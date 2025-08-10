// For those wondering why all pragma warning disables are in top level.
// it is because it looks bad inline.
#pragma warning disable IDE0150
using System.Text.Json.Serialization;

namespace Backend.Models;

/// <summary>
/// Represents a record of questions belonging to a specific quiz, stored in the filesystem.
/// </summary>
public class QuestionRecordModel
{
    // instance properties
    [JsonPropertyName("ownerQuizId")]
    public required string OwnerQuizId { get; set; }

    [JsonPropertyName("questions")]
    public required QuestionModel[] Questions { get; set; }

    // constructor
    [JsonConstructor]
    public QuestionRecordModel() { }
}
