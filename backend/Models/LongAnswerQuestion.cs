using System.Text.Json.Serialization;

namespace Backend.Models;

public class LongAnswerQuestion : QuestionModel
{
    [JsonPropertyName("answers")]
    public string[] Answers { get; set; }

    public LongAnswerQuestion(string title, string[] answers) : base(QuestionType.LongAnswer, title)
    {
        Answers = answers;
    }
}