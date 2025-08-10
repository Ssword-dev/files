using Backend.Database;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Api.QuizApi;

public enum QuizObjectCreationErrorCode
{
    RecordAlreadyExist,
}

public class QuizApiCommonController(QuizAppDatabaseContext context) : ControllerBase
{
    public QuizAppDatabaseContext Context = context;
}
