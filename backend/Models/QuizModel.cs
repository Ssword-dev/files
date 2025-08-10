namespace Backend.Models;

/// <summary>
/// Represents a quiz as used in the application layer.
/// </summary>
/// <param name="UniqueId">The unique identifier for the quiz.</param>
/// <param name="Metadata">Metadata such as publisher, title, and tags.</param>
/// <param name="Questions">The list of questions in the quiz.</param>
public record QuizModel(
    string UniqueId,
    QuizMetadataEntity Metadata,
    QuestionModel[] Questions
);