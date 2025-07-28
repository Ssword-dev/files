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
        var id = Guid.NewGuid();

        var quiz = new QuizEntity
        {
            UniqueId = id,
            Title = request.Title,
            Publisher = request.Publisher
        };

        Context.Quizzes.Add(quiz);

        List<Guid> tagIds = [];

        var normalizedTags = request.Tags.Distinct();

        foreach (var tag in normalizedTags)
        {
            var tid = await Context.CreateTagIfNotExist(tag);
            tagIds.Add(tid);
        }

        await Context.SaveChangesAsync();
        Console.WriteLine($"{tagIds}");

        foreach (var tagId in tagIds)
        {
            Console.WriteLine(tagId.ToString());
            await Context.AddTagToQuizId(id, tagId);
        }

        await Context.SaveChangesAsync(); // TODO: When resubmitting. this breaks due to different id stuff.

        return Ok(quiz);
    }

}
