using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.CreateSetModels
{
    public class NewSetData
    {
        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public List<Exercise> Exercises { get; set; }
    }
}
