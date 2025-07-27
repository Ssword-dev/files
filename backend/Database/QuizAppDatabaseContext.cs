#pragma warning disable IDE0305 // The warnings about using a semantic sugar instead of toList()
using Backend.FileSystemRecords;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using SystemFile = System.IO.File;
using DatabaseQuizEntity = Backend.Database.QuizEntity;
using DatabaseQuizTagEntity = Backend.Database.QuizTagEntity;
using DatabaseQuizTagRelationEntity = Backend.Database.QuizTagRelationEntity;

namespace Backend.Database;

public sealed class QuizAppDatabaseContext(DbContextOptions<QuizAppDatabaseContext> options) : DbContext(options)
{
    /// <summary>
    /// This constant controls what the context considers
    /// "many" insertions before parallelizing everything with
    /// tasks.
    /// </summary>
    public static readonly int StandardInsertionLimitBeforeParallelism = 10;
    // Static constants
    // this is the directory of where the exe is located.
    private static readonly string AssemblyDirectory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)!;
    private static readonly string RecordsDirectory = Path.Combine(AssemblyDirectory, "questions");
    public DbSet<DatabaseQuizEntity> Quizzes { get; set; }
    public DbSet<DatabaseQuizTagEntity> QuizTags { get; set; }
    public DbSet<DatabaseQuizTagRelationEntity> QuizTagRelations { get; set; }

    public async Task<List<DatabaseQuizTagEntity>> Tags(DatabaseQuizEntity quizEntity)
    {
        return await QuizTagRelations
            .Where(rel => rel.OwnerQuizId == quizEntity.UniqueId)
            .Join(
                QuizTags,
                rel => rel.TagId,
                tag => tag.Id,
                (rel, tag) => tag
            ).ToListAsync();
    }

    public IQueryable<DatabaseQuizEntity> QueryGetAllQuizzesWithTag(Guid tagId)
    {
        return Quizzes
            .FromSqlRaw("""
            SELECT q.*
            FROM `quizzes` q
            JOIN `quiz_tags` qt ON q.id = qt.id
            JOIN `tags` t ON t.id = qt.tag_id
            WHERE t.id = {0}
        """, tagId); // this is raw sql statement because doing it in ef is awkward (i know more mysql than ef)
    }

    public List<DatabaseQuizEntity> GetAllQuizzesWithTag(string tagId)
    {
        if (!Guid.TryParse(tagId, out var guid))
        {
            throw new ArgumentException("Invalid GUID format.");
        }

        return QueryGetAllQuizzesWithTag(guid).ToList();
    }

    public List<DatabaseQuizEntity> GetAllQuizzesWithTag(Guid tagId)
    {
        return QueryGetAllQuizzesWithTag(tagId).ToList();
    }


    public async Task<List<DatabaseQuizEntity>> GetAllQuizzesWithTagAsync(string tagId)
    {
        if (!Guid.TryParse(tagId, out var guid))
        {
            throw new ArgumentException("Invalid GUID format.");
        }

        return await QueryGetAllQuizzesWithTag(guid).ToListAsync();
    }

    public async Task<List<DatabaseQuizEntity>> GetAllQuizzesWithTagAsync(Guid tagId)
    {
        return await QueryGetAllQuizzesWithTag(tagId).ToListAsync();
    }


    public async Task<DatabaseQuizEntity?> GetQuizById(string id)
    {
        return await Quizzes.Where(ent => ent.UniqueId.ToString() == id).FirstAsync(); // THERE CAN BE ONLY ONE
    }

    public async Task<QuestionRecord?> GetQuestionsById(string id)
    {
        try
        {
            var fp = QuestionRecord.Resolve(RecordsDirectory, id);
            var fileStream = SystemFile.OpenRead(fp);
            return await QuestionRecord.FromJsonAsync(fileStream);
        }
        catch (FileNotFoundException)
        {
            return null;
        }
    }

    public Task<bool> QuizExists(string title)
    {
        return Quizzes.AnyAsync(ent => ent.Title == title);
    }

    public Task<bool> QuizExists(Guid id)
    {
        return Quizzes.AnyAsync(ent => ent.UniqueId == id);
    }

    public Task<bool> TagExists(string name)
    {
        return QuizTags.AnyAsync(tag => tag.Name == name);
    }

    public Task<bool> TagExists(Guid id)
    {
        return QuizTags.AnyAsync(tag => tag.Id == id);
    }

    internal async Task CreateTagIfNotExist(string tagName)
    {

        if (!await TagExists(tagName))
        {
            var tag = new DatabaseQuizTagEntity()
            {
                Id = Guid.NewGuid(),
                Name = tagName
            };

            await QuizTags.AddAsync(tag);
        }
    }

    internal async Task AddTagToQuizId(Guid ownerQuizId, string name)
    {
        var relation = new DatabaseQuizTagRelationEntity()
        {
            OwnerQuizId = ownerQuizId,

            // equivalent of this sql statement:
            // SELECT t.id FROM `quiz_tags` t WHERE t.name = {name}
            // the .First part is just here to tell the ef framework only return
            // a single one. this is guaranteed to be null or Guid but since used,
            // only internally, works.
            TagId = QuizTags.Where(tag => tag.Name == name).Select(tag => tag.Id).First()
        };

        await QuizTagRelations.AddAsync(relation);
    }


    public async Task<DatabaseQuizEntity> QuizEntity(string publisher, string title, string[] tags, Guid uniqueId, QuestionModel[] questions)
    {
        // phase 1: sanity checks
        if (SystemFile.Exists(QuestionRecord.Resolve(RecordsDirectory, uniqueId.ToString())) || await QuizExists(uniqueId))
        {
            throw new Exception("Cannot create a question record, a quiz with the same guid is detected");
        }

        var record = QuestionRecord.New(uniqueId, questions);

        // save the record
        await record.SaveAsync(RecordsDirectory);

        // phase 2: the entity creation
        var entity = new DatabaseQuizEntity()
        {
            UniqueId = uniqueId,
            Publisher = publisher,
            Title = title,
        };

        // if the user provides like 10 copies of a tag, then that is just
        // wait of time to check with ef. so distinct is perf gain!!
        // kinda... it adds O(n) but useful.
        var normalizedTagList = tags.Distinct().ToArray();

        // phase 3: Tag insertion
        if (normalizedTagList.Length <= StandardInsertionLimitBeforeParallelism)
        {
            foreach (var tag in tags)
            {
                await CreateTagIfNotExist(tag);
            }
        }

        // i think this is faster?
        // it just parallelizes tag creations to
        // c#'s pool thread.
        // (well actually the pool thread is also limited but...)
        // will worry bout that later when it needs that much speed.
        else
        {
            var tasks = new List<Task>(normalizedTagList.Length);
            foreach (var tag in normalizedTagList)
            {
                var task = CreateTagIfNotExist(tag);
                tasks.Add(task);
            }
            await Task.WhenAll(tasks);
        }

        await SaveChangesAsync();

        // phase 4: relational tag insertion
        // now the way i will handle this is very similar to previous phases.
        // but if it needs more speed i can just join phase 3 and 4 together
        // later.

        if (normalizedTagList.Length <= StandardInsertionLimitBeforeParallelism)
        {
            foreach (var tag in normalizedTagList)
            {
                await AddTagToQuizId(uniqueId, tag);
            }
        }

        else
        {
            var tasks = new List<Task>(normalizedTagList.Length);
            foreach (var tag in normalizedTagList)
            {
                var task = AddTagToQuizId(uniqueId, tag);
                tasks.Add(task);
            }

            await Task.WhenAll(tasks);
        }

        // phase 5: add the newly created entity.
        await AddAsync(entity);
        await SaveChangesAsync();

        // phase X: return the newly created entity.
        return entity;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // these configures ef to understand the environment.
        modelBuilder.Entity<DatabaseQuizTagRelationEntity>()
        .HasKey(rel => new { rel.OwnerQuizId, rel.TagId });

        modelBuilder.Entity<DatabaseQuizTagRelationEntity>()
            .HasOne<DatabaseQuizEntity>()
            .WithMany()
            .HasForeignKey(rel => rel.OwnerQuizId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DatabaseQuizTagRelationEntity>()
            .HasOne<DatabaseQuizTagEntity>()
            .WithMany()
            .HasForeignKey(rel => rel.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
};
