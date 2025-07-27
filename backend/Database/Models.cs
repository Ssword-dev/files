using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Database
{
    public enum QuestionType
    {
        MultipleChoice,
        OpenEnded,
    }

    [Table("quizzes")]
    public class QuizEntity
    {
        [Key]
        [Column("id", TypeName = "binary(16)")]
        public Guid UniqueId { get; set; }

        [Column("publisher")]
        public required string Publisher { get; set; }
        [Column("title")]
        public required string Title { get; set; }
    }

    [Table("tags")]
    public class QuizTagEntity
    {
        [Column("id")]
        public required Guid Id { get; set; }

        [Column("name")]
        public required string Name { get; set; }
    }

    [Table("quiz_tags")]
    public class QuizTagRelationEntity
    {
        [Column("id")]
        public Guid OwnerQuestionId { get; set; }
        [Column("tag_id")]
        public Guid TagId { get; set; }
    }
}
