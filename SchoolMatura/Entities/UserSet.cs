using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolMatura.Entities
{
    public class UserSet
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SetId { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public DateTime CreationTime { get; set; }

        [Required]
        public ICollection<Exercise> Exercises { get; set; }

        [Required]
        public ICollection<Session> Sessions { get; set; }

        public UserSet(string username, string title, string description, DateTime creationTime)
        {
            Username = username;
            Title = title;
            Description = description;
            Exercises = new List<Exercise>();
            Sessions = new List<Session>();
            CreationTime = creationTime;
        }
    }
}
