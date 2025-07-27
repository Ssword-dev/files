using Backend.Models;
using Backend.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Api.QuizApi;

[ApiController]
[Route("api/quiz/tags/{tag}")]
public class QuizApiReaderController(QuizAppDatabaseContext database) : QuizApiCommonController(database)
{
    [HttpGet]
    public async Task<OkObjectResult> Get(string tag)
    {
        return Ok(
            await GetAllQuizzesWithTag(tag)
        );
    }
}
