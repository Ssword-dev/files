using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Api.Dev;

[ApiController]
[Route("api/dev/null")]
class NullController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(""); // EOF
    }
}
