// For those wondering why all pragma warning disables are in top level.
// it is because it looks bad inline.
#pragma warning disable IDE0150
using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Models;

namespace Backend.FileSystemRecords;

/// <summary>
/// Represents a record of questions belonging to a specific quiz, stored in the filesystem.
/// </summary>
public class QuestionRecord
{
    // instance properties
    [JsonInclude]
    public required string OwnerQuizId { get; set; }

    [JsonInclude]
    public required QuestionModel[] Questions { get; set; }

    // constructor
    [JsonConstructor]
    private QuestionRecord() { }

    // instance methods
    /// <summary>
    /// Saves the current <see cref="QuestionRecord"/> to the specified directory as a JSON file.
    /// </summary>
    public async Task SaveAsync(string directory)
    {
        if (!Directory.Exists(directory))
            Directory.CreateDirectory(directory);

        var path = Path.Combine(directory, $"{OwnerQuizId}.json");

        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, this);
    }

    // static methods (alphabetical)
    public static QuestionRecord? FromJson(string json)
    {
        return JsonSerializer.Deserialize<QuestionRecord>(json);
    }

    public static async Task<QuestionRecord?> FromJsonAsync(Stream stream)
    {
        return await JsonSerializer.DeserializeAsync<QuestionRecord>(stream);
    }

    public static async Task<QuestionRecord?> LoadFromDirectoryAsync(string directory, string quizId)
    {
        var path = Resolve(directory, quizId);

        if (!File.Exists(path))
            return null;

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<QuestionRecord>(stream);
    }

    /// <summary>
    /// Creates a new record with the given id and questions
    /// </summary>
    /// <param name="ownerQuizId">The id of the quiz that owns this questions. (as Guid)</param>
    /// <param name="questions">The questions</param>
    /// <returns>A new QuestionRecord</returns>
    public static QuestionRecord New(Guid ownerQuizId, QuestionModel[] questions)
    {

        // this one has skipped sanity check on the ownerQuizId because it
        // is already a guid. assumed to be valid.

        var violations = questions
            .Select(QuestionSanityChecks)
            .Where(v => v != null)
            .ToArray();

        if (violations.Length != 0)
        {
            throw violations[0]!;
        }

        return new QuestionRecord
        {
            OwnerQuizId = ownerQuizId.ToString(),
            Questions = questions
        };
    }


    /// <summary>
    /// Creates a new record with the given id and questions
    /// </summary>
    /// <param name="ownerQuizId">The id of the quiz that owns this questions. (as untrusted string)</param>
    /// <param name="questions">The questions</param>
    /// <returns>A new QuestionRecord</returns>
    public static QuestionRecord New(string ownerQuizId, QuestionModel[] questions)
    {
        if (ownerQuizId.Length != 36)
        {
            throw new ArgumentException("The owner id must be a valid GUID string");
        }

        var violations = questions
            .Select(QuestionSanityChecks)
            .Where(v => v != null)
            .ToArray();

        if (violations.Length != 0)
        {
            throw violations[0]!;
        }

        return new QuestionRecord
        {
            OwnerQuizId = ownerQuizId,
            Questions = questions
        };
    }

    private static Exception? QuestionSanityChecks(QuestionModel model)
    {
        switch (model.Type)
        {
            case QuestionType.MultipleChoice:
                if (model.AnswerChoices is not string[])
                {
                    return new Exception("Multiple choice questions should have an array as answer choices.");
                }
                break;

            case QuestionType.OpenEnded:
                if (model.AnswerChoices is not null)
                {
                    return new Exception("Open Ended questions should not have any right or wrong answer.");
                }
                break;

            default:
                break;
        }

        return null;
    }

    /// <summary>
    /// Resolves the path for a question record's file
    /// </summary>
    /// <param name="directory">The path to the directory that contains the record files</param>
    /// <param name="quizId">The quiz id (not validated. untrusted strings)</param>
    /// <returns>The path to the record file</returns>
    public static string Resolve(string directory, string quizId)
    {
        return Path.Combine(directory, $"{quizId}.json");
    }

    /// <summary>
    /// Resolves the path for a question record's file
    /// </summary>
    /// <param name="directory">The path to the directory that contains the record files</param>
    /// <param name="quizId">The quiz id (a Guid instance)</param>
    /// <returns>The path to the record file</returns>
    public static string Resolve(string directory, Guid quizId)
    {
        return Path.Combine(directory, $"{quizId}.json");
    }
}
