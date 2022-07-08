using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.ExercisePoolModels
{
    public class IndependentExerciseModel
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public string Content { get; set; }

        public char? CorrectAnswer { get; set; }

        public char? AdditionalData { get; set; }

        [Required]
        public int Points { get; set; }

        public string? Hashtags { get; set; }

        public IndependentExerciseModel()
        {

        }

        public IndependentExerciseModel(string type, string content, char? correctAnswer,
            char? additionalData, int _points, string? _hashtags, string _title)
        {
            Type = type;
            Content = content;
            CorrectAnswer = correctAnswer;
            AdditionalData = additionalData;
            Points = _points;
            Hashtags = _hashtags;
            Title = _title;
        }
    }
}
