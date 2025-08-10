using Backend.Database;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Api.QuizApi;

[ApiController]
[Route("api/quiz/tags/{tag}")]
public class QuizApiReaderController(QuizAppDatabaseContext database) : QuizApiCommonController(database)
{
    [HttpGet]
    public async Task<OkObjectResult> Get(string tag)
    {
        return Ok(
            await Context.GetAllQuizzesWithTagAsync(tag)
        );
    }
}
