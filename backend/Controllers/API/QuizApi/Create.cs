using Backend.Database;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

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
        var quiz = await Context.QuizEntity(
            request.Publisher,
            request.Title,
            request.Tags,
            Guid.NewGuid(),
            request.Questions
        );

        return Ok(quiz);
    }
}
