using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Api.Dev;

[ApiController]
[Route("api/dev/null")]
class NullController : ControllerBase
{
    [HttpGet]
    [HttpPost]
    [HttpPut]
    [HttpHead]
    [HttpDelete]
    [HttpPatch]
    [HttpOptions]
    public IActionResult All()
    {
        return Ok(""); // EOF
    }
}
