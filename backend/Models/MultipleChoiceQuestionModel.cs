using System.Text.Json.Serialization;

namespace Backend.Models;

public class MultipleChoiceQuestionModel : QuestionModel
{
    [JsonPropertyName("choices")]
    public string[] Choices { get; set; }

    [JsonPropertyName("correctAnswerIndex")]
    public int AnswerIndex { get; set; }

    public MultipleChoiceQuestionModel(string title, string[] choices, int answerIndex)
        : base(QuestionType.MultipleChoice, title)
    {
        Choices = choices;
        AnswerIndex = answerIndex;
    }
}
