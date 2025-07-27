using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Models;

namespace Backend.FileSystemRecords;


/// <summary>
/// Represents a record of questions belonging to a specific quiz, stored in the filesystem.
/// </summary>
public class QuestionRecord
{
    /// <summary>
    /// The GUID string identifying the quiz that owns this record.
    /// </summary>
    [JsonInclude]
    public required string OwnerQuizId { get; set; }

    /// <summary>
    /// The array of questions associated with the quiz.
    /// </summary>
    [JsonInclude]
    public required QuestionModel[] Questions { get; set; }

    /// <summary>
    /// The internal constructor.
    /// Only accessible via the static <see cref="New"/> method.
    /// </summary>
    /// <param name="ownerQuizId">The GUID of the owner quiz.</param>
    /// <param name="questions">The questions that the record contains.</param>
    [JsonConstructor]
    private QuestionRecord(){}

    /// <summary>
    /// Deserialize a JSON string into a <see cref="QuestionRecord"/>.
    /// </summary>
    /// <param name="json">The raw JSON string.</param>
    /// <returns>The deserialized <see cref="QuestionRecord"/> instance or null on failure.</returns>
    public static QuestionRecord? FromJson(string json)
    {
        return JsonSerializer.Deserialize<QuestionRecord>(json);
    }

/// <summary>
    /// Deserialize a stream asynchronously into a <see cref="QuestionRecord"/>.
    /// </summary>
    /// <param name="stream">A stream containing the JSON payload.</param>
    /// <returns>The deserialized <see cref="QuestionRecord"/> instance or null on failure.</returns>
    public static async Task<QuestionRecord?> FromJsonAsync(Stream stream)
    {
        return await JsonSerializer.DeserializeAsync<QuestionRecord>(stream);
    }

    /// <summary>
    /// Saves the current <see cref="QuestionRecord"/> to the specified directory as a JSON file.
    /// </summary>
    /// <param name="directory">The directory where the file will be stored.</param>
    public async Task SaveAsync(string directory)
    {
        if (!Directory.Exists(directory))
            Directory.CreateDirectory(directory);

        var path = Path.Combine(directory, $"{OwnerQuizId}.json");

        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, this);
    }

    /// <summary>
    /// Resolves the full file path of a quiz record in a directory.
    /// </summary>
    /// <param name="directory">The base directory.</param>
    /// <param name="quizId">The unique quiz ID to resolve.</param>
    /// <returns>The full resolved path to the quiz file.</returns>
    public static string Resolve(string directory, string quizId)
    {
        return Path.Combine(directory, $"{quizId}.json");
    }

    /// <summary>
    /// Loads a <see cref="QuestionRecord"/> from the given directory using its quiz ID.
    /// </summary>
    /// <param name="directory">The base directory to load from.</param>
    /// <param name="quizId">The quiz ID used to locate the file.</param>
    /// <returns>The loaded <see cref="QuestionRecord"/> or null if not found.</returns>
    public static async Task<QuestionRecord?> LoadFromDirectoryAsync(string directory, string quizId)
    {
        var path = Resolve(directory, quizId);

        if (!File.Exists(path))
            return null;

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<QuestionRecord>(stream);
    }

    /// <summary>
    /// Creates a new instance of <see cref="QuestionRecord"/> with validation.
    /// </summary>
    /// <param name="ownerQuizId">The GUID of the owning quiz (must be 36 characters).</param>
    /// <param name="questions">The list of questions to associate.</param>
    /// <returns>A validated <see cref="QuestionRecord"/> instance.</returns>
    /// <exception cref="ArgumentException">Thrown if the GUID format or questions are invalid.</exception>
    public static QuestionRecord New(string ownerQuizId, QuestionModel[] questions)
    {
        // a valid uuid is 36 characters long
        if (ownerQuizId.Length != 36)
        {
            throw new ArgumentException("The owner id must be a valid GUID string");
        }

        var violations = questions.Select(QuestionSanityChecks).Where((v) => v != null).ToArray();

        if (violations.Length != 0)
        {
            throw violations[0]!;
        }

        var instance = new QuestionRecord()
        {
            OwnerQuizId = ownerQuizId,
            Questions = questions
        };
        return instance;
    }

    /// <summary>
    /// Performs type-based checks on a question's validity according to its type.
    /// </summary>
    /// <param name="model">The question model to validate.</param>
    /// <returns>An exception if there is something wrong.returns>
    private static Exception? QuestionSanityChecks(QuestionModel model)
    {
        switch (model.Type)
        {
            case QuestionType.MultipleChoice:
#pragma warning disable IDE0150 // Prefer 'null' check over type check
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
}
