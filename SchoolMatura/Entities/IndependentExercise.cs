using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolMatura.Entities
{
    public class IndependentExercise
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExerciseId { get; set; }

        public Guid? RelationalID { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public DateTime CreationTime { get; set; }

        [Required]
        public string ExerciseType { get; set; }

        [Required]
        public string Content { get; set; }

        public char? CorrectAnswer { get; set; }

        public char? AdditionalData { get; set; }

        [Required]
        public int Points { get; set; }

        public string? Hashtags { get; set; }

        public IndependentExercise()
        {

        }

        public IndependentExercise(string exerciseType, string content, char? correctAnswer, 
            char? additionalData, int _points, string? _hashtags, Guid? _relationalID, string _username,
            string _title, DateTime _creationTime)
        {
            ExerciseType = exerciseType;
            Content = content;
            CorrectAnswer = correctAnswer;
            AdditionalData = additionalData;
            Points = _points;
            Hashtags = _hashtags;
            RelationalID = _relationalID;
            Username = _username;
            Title = _title;
            CreationTime = _creationTime;
        }
    }
}
