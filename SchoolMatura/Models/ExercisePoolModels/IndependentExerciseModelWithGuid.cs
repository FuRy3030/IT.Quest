using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.ExercisePoolModels
{
    public class IndependentExerciseModelWithGuid
    {
        [Required]
        public Guid ID { get; set; }

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

        public IndependentExerciseModelWithGuid()
        {

        }

        public IndependentExerciseModelWithGuid(string type, string content, char? correctAnswer,
            char? additionalData, int _points, string? _hashtags, string _title, Guid _id)
        {
            Type = type;
            Content = content;
            CorrectAnswer = correctAnswer;
            AdditionalData = additionalData;
            Points = _points;
            Hashtags = _hashtags;
            Title = _title;
            ID = _id;
        }
    }
}
