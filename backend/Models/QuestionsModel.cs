namespace Backend.Models
{
    /// <summary>
    /// The type of question and how it should be interpreted.
    /// </summary>
    public enum QuestionType
    {
        /// <summary>
        /// A multiple-choice question; answer is validated by index match.
        /// </summary>
        MultipleChoice,

        /// <summary>
        /// Any answer is considered correct (free-form).
        /// </summary>
        OpenEnded,

        /// <summary>
        /// True/False question with value 0 (true) or 1 (false).
        /// </summary>
        // Binary,
    }

    /// <summary>
    /// A single question in a quiz.
    /// </summary>
    /// <param name="Type">The type of question.</param>
    /// <param name="Question">The question text.</param>
    /// <param name="AnswerChoices">The possible choices, if applicable.</param>
    /// <param name="Answer">The correct answer or accepted response(s).</param>
    public record QuestionModel(
        QuestionType Type,
        string Question,
        string[]? AnswerChoices,
        dynamic Answer
    );

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

    /// <summary>
    /// Represents the question data for a quiz as stored in the database.
    /// </summary>
    /// <param name="UniqueId">The quiz ID that links to the metadata.</param>
    /// <param name="Questions">The full question set from the DB.</param>
    /// <remarks>
    /// Please note that there should be a dedicated writer and reader api for
    /// this. do not directly read from the database
    /// </remarks>
    public record QuizQuestionEntity(
        string UniqueId,
        QuestionModel[] Questions
    );
}
