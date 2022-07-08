using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolMatura.Models.CreateSetModels
{
    public class Exercise
    {
        [Required]
        public string Type { get; set; }

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
    }
}
