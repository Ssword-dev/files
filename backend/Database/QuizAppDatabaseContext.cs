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
    public static readonly string AssemblyDirectory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)!;
    public static readonly string RecordsDirectory = Path.Combine(AssemblyDirectory, "questions");
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

    public async Task<Guid> CreateTagIfNotExist(string tagName)
    {
        var tagExist = await TagExists(tagName);

        if (!tagExist)
        {
            var id = Guid.NewGuid();
            var tag = new DatabaseQuizTagEntity()
            {
                Id = id,
                Name = tagName
            };

            QuizTags.Add(tag);
            return id;
        }

        return await QuizTags.Where(tag => tag.Name == tagName).Select(tag => tag.Id).FirstAsync();
    }

    internal async Task AddTagToQuizId(Guid ownerQuizId, Guid tagId)
    {
        var relation = new DatabaseQuizTagRelationEntity()
        {
            OwnerQuizId = ownerQuizId,

            // equivalent of this sql statement:
            // SELECT t.id FROM `quiz_tags` t WHERE t.name = {name}
            // the .First part is just here to tell the ef framework only return
            // a single one. this is guaranteed to be null or Guid but since used,
            // only internally, works.
            TagId = tagId
        };

        await QuizTagRelations.AddAsync(relation);
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
