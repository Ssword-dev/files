namespace Backend.Models;

public class OpenEndedQuestionModel : QuestionModel
{
    /* This one dont have any other props... */
    public OpenEndedQuestionModel(string title) : base(QuestionType.OpenEnded, title)
    {
    }
}