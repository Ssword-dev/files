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

        [Column("publisher", TypeName = "longtext")]
        public required string Publisher { get; set; }

        [Column("title", TypeName = "longtext")]
        public required string Title { get; set; }
    }

    [Table("tags")]
    public class QuizTagEntity
    {
        [Key]
        [Column("id", TypeName = "binary(16)")]
        public required Guid Id { get; set; }

        [Column("name")]
        [StringLength(45)]
        public required string Name { get; set; }
    }

    [Table("quiz_tags")]
    public class QuizTagRelationEntity
    {
        [Column("id", TypeName = "binary(16)")]
        public Guid OwnerQuizId { get; set; }

        [Column("tag_id", TypeName = "binary(16)")]
        public Guid TagId { get; set; }
    }
}
