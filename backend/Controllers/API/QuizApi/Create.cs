using Backend.Database;
using Backend.FileSystemRecords;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using SystemFile = System.IO.File;

namespace Backend.Controllers.Api.QuizApi;

public class QuizCreateRequest
{
    public required string Publisher { get; set; }
    public required string Title { get; set; }
    public required string[] Tags { get; set; }
    public required QuestionModel[] Questions { get; set; }
}


[ApiController]
[Route("api/quiz")]
public class QuizApiCreationController(QuizAppDatabaseContext database) : QuizApiCommonController(database)
{
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] QuizCreateRequest request)
    {
        // phase 1: quiz creation
        var id = Guid.NewGuid();

        var quiz = new QuizEntity
        {
            UniqueId = id,
            Title = request.Title,
            Publisher = request.Publisher
        };

        Context.Quizzes.Add(quiz);

        // phase 2: tag deduplication
        var normalizedTags = request.Tags.Distinct();

        // phase 3: tag creation. (if they dont exist.)
        List<Guid> tagIds = [];


        foreach (var tag in normalizedTags)
        {
            var tid = await Context.CreateTagIfNotExist(tag);
            tagIds.Add(tid);
        }

        await Context.SaveChangesAsync(); // <-- this could be optimized if the tags exists.

        // phase 4: relation creations
        foreach (var tagId in tagIds)
        {
            await Context.AddTagToQuizId(id, tagId);
        }

        // reminder to self, ef does not pick up guids being
        // binary(16), be explicit next time
        await Context.SaveChangesAsync();


        // phase 5: create question records
        // this automatically writes to filesystem btw.
        // uses QuestionRecord.Resolve(...)
        var questionRecord = QuestionRecord.New(id, request.Questions);
        await questionRecord.SaveAsync(QuizAppDatabaseContext.RecordsDirectory);
        // phase 6: Ok
        return Ok(quiz);
    }

}
