namespace Backend.Models
{


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
