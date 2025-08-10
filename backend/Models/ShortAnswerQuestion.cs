using System.Text.Json.Serialization;

namespace Backend.Models;

public class ShortAnswerQuestion : QuestionModel
{
    [JsonPropertyName("answers")]
    public string[] Answers { get; set; }

    public ShortAnswerQuestion(string title, string[] answers) : base(QuestionType.ShortAnswer, title)
    {
        Answers = answers;
    }
}