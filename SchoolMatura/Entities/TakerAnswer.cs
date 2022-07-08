using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolMatura.Entities
{
    public class TakerAnswer
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AnswerId { get; set; }

        public string? UserAnswer { get; set; }

        public string? CodeAnswer { get; set; }

        public string? CodingLanguage { get; set; }

        [Required]
        public int ScoredPoints { get; set; }

        public string? TeacherComment { get; set; }

        [ForeignKey("TestTaker")]
        public int? TakerId { get; set; }

        [Required]
        [ForeignKey("Exercise")]
        public int ExerciseId { get; set; }

        [Required]
        public Exercise Exercise { get; set; }

        public TestTaker? TestTaker { get; set; }

        public TakerAnswer()
        {

        }

        public TakerAnswer(string _userAnswer, int _exerciseId, TestTaker _testTaker)
        {
            UserAnswer = _userAnswer;
            ExerciseId = _exerciseId;
            TestTaker = _testTaker;
        }
    }
}
