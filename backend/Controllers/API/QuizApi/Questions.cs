using Backend.Database;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Api.QuizApi;

[ApiController]
[Route("api/quiz")]
public class QuizApiQuestionsController(QuizAppDatabaseContext db) : QuizApiCommonController(db)
{
    [HttpGet("questions/{id}")]
    public async Task<IActionResult> GetQuestions(string id)
    {
        var questions = await Context.GetQuestionsById(id);

        if (questions == null)
        {
            return NotFound($"Questions for quiz id {id} was not found.");
        }

        return Ok(questions);
    }
}
