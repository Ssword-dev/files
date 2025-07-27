using System.ComponentModel.DataAnnotations.Schema;
using Backend.FileSystemRecords;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemFile = System.IO.File;
using DatabaseQuizEntity = Backend.Database.QuizEntity;
using DatabaseQuizTagEntity = Backend.Database.QuizTagEntity;
using DatabaseQuizTagRelationEntity = Backend.Database.QuizTagRelationEntity;

namespace Backend.Database;

public sealed class QuizAppDatabaseContext(DbContextOptions<QuizAppDatabaseContext> options) : DbContext(options)
{
    // this is the directory of where the exe is located.
    private static readonly string AssemblyDirectory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)!;
    private static readonly string RecordsDirectory = Path.Combine(AssemblyDirectory, "questions");
    public DbSet<DatabaseQuizEntity> Quizzes { get; set; }
    public DbSet<DatabaseQuizTagEntity> QuizTags { get; set; }
    public DbSet<DatabaseQuizTagRelationEntity> QuizTagRelations { get; set; }

    public async Task<List<DatabaseQuizTagEntity>> Tags(DatabaseQuizEntity quizEntity)
    {
        return await QuizTagRelations
            .Where(rel => rel.OwnerQuestionId == quizEntity.UniqueId)
            .Join(
                QuizTags,
                rel => rel.TagId,
                tag => tag.Id,
                (rel, tag) => tag
            ).ToListAsync();
    }

    public async Task<List<DatabaseQuizEntity>> GetAllQuizzesWithTagAsync(Guid tagId)
    {
        // i am regretting using ef now...
        // reminder to self: do not use ef core fore querying
        // only use it as an abstraction for connections.
        // this is not that good for complex queries.
        return await Quizzes
            .FromSqlRaw("""
            SELECT q.*
            FROM `quizzes` q
            JOIN `quiz_tags` qt ON q.id = qt.id
            JOIN `tags` t ON t.id = qt.tag_id
            WHERE t.id = {0}
        """, tagId)
            .ToListAsync();
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

    public Task<bool> QuizExists(Guid id)
    {
        return Quizzes.AnyAsync(ent => ent.UniqueId == id);
    }


    public async Task<DatabaseQuizEntity> QuizEntity(string publisher, string title, string[] tags, string uniqueId, QuestionModel[] questions)
    {
        Guid guid = new(uniqueId);
        if (SystemFile.Exists(QuestionRecord.Resolve(RecordsDirectory, uniqueId)) || await QuizExists(uniqueId))
        {
            throw new Exception("Cannot create a question record, a quiz with the same guid is detected");
        }

        var record = QuestionRecord.New(uniqueId, questions);

        // save the record
        await record.SaveAsync(RecordsDirectory);

        // phase 2. the actual insertion
        var entity = new DatabaseQuizEntity()
        {
            Publisher = publisher,
            Title = title,
            UniqueId = new Guid(uniqueId)
        };

        await AddAsync(entity);
        await SaveChangesAsync();
        return entity;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
};
