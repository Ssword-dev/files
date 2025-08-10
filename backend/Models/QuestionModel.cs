using System.Text.Json.Serialization;

namespace Backend.Models;

/// <summary>
/// A single question in a quiz.
/// </summary>
/// <param name="Type">The type of question.</param>
/// <param name="Question">The question text.</param>
/// <param name="AnswerChoices">The possible choices, if applicable.</param>
/// <param name="Answer">The correct answer or accepted response(s).</param>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type", UnknownDerivedTypeHandling = JsonUnknownDerivedTypeHandling.FailSerialization)]
[JsonDerivedType(typeof(MultipleChoiceQuestionModel), (int)QuestionType.MultipleChoice)]
[JsonDerivedType(typeof(OpenEndedQuestionModel), (int)QuestionType.OpenEnded)]
[JsonDerivedType(typeof(ShortAnswerQuestion), (int)QuestionType.ShortAnswer)]
[JsonDerivedType(typeof(LongAnswerQuestion), (int)QuestionType.LongAnswer)]
public class QuestionModel
{
    [JsonPropertyName("type")]
    public QuestionType Type { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    public QuestionModel(
        QuestionType type,
        string title
    )
    {
        Type = type;
        Title = title;
    }
};