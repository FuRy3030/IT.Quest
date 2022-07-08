using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchoolMatura.Entities
{
    public class Exercise
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExerciseId { get; set; }

        [Required]
        public string ExerciseType { get; set; }

        [Required]
        public int MainOrder { get; set; }

        public int? SubOrder { get; set; }

        [Required]
        public string Content { get; set; }

        public char? CorrectAnswer { get; set; }

        public char? AdditionalData { get; set; }

        [Required]
        public int Points { get; set; }

        public string? Hashtags { get; set; }

        [JsonIgnore]
        [Required]
        public UserSet Set { get; set; }

        [JsonIgnore]
        [Required]
        public ICollection<TakerAnswer> TakerAnswers { get; set; }

        public Exercise()
        {

        }

        public Exercise(string exerciseType, int mainOrder, int? subOrder, string content, 
            char? correctAnswer, char? additionalData, int _points, string? _hashtags, UserSet set)
        {
            ExerciseType = exerciseType;
            MainOrder = mainOrder;
            SubOrder = subOrder;
            Content = content;
            CorrectAnswer = correctAnswer;
            AdditionalData = additionalData;
            Points = _points;
            Hashtags = _hashtags;
            Set = set;
            TakerAnswers = new List<TakerAnswer>();
        }
    }
}
