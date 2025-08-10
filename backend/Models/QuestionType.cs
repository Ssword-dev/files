namespace Backend.Models;

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
    /// An answer should be 
    /// </summary>
    ShortAnswer,
    LongAnswer,
}