using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.StudentsAnswersModels
{
    public class MarkedExercise
    {
        [Required]
        public int ExerciseOrder { get; set; }

        [Required]
        public int AnswerPoints { get; set; }

        public string? TeacherComment { get; set; }
    }
}
