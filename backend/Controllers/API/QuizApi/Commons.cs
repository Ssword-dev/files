using Backend.Models;
using Backend.Database;
using Backend.FileSystemRecords; // json stored in the local file system
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemFile = System.IO.File;

namespace Backend.Controllers.Api.QuizApi;

public enum QuizObjectCreationErrorCode
{
    RecordAlreadyExist,
}

public class QuizApiCommonController(QuizAppDatabaseContext database) : ControllerBase
{
    private readonly QuizAppDatabaseContext _db = database;
}
