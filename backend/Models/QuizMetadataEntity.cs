namespace Backend.Models;

/// <summary>
/// Represents quiz metadata stored in the database.
/// </summary>
/// <param name="UniqueId">The quiz ID from the database.</param>
/// <param name="Publisher">The publisher or author of the quiz.</param>
/// <param name="Tags">Associated tags for filtering or searching.</param>
/// <param name="Title">The title of the quiz.</param>
/// <remarks>
/// Please note that there should be a dedicated writer and reader api for
/// this. do not directly read from the database
/// </remarks>
public record QuizMetadataEntity(
    string UniqueId,
    string Publisher,
    string[] Tags,
    string Title
);
