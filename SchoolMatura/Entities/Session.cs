using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolMatura.Entities
{
    public class Session
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SessionId { get; set; }

        [Required]
        [ForeignKey("Set")]
        public int SetId { get; set; }

        [Required]
        public string SessionName { get; set; }

        [Required]
        public Guid UniqueSessionCode { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime ExpirationTime { get; set; }

        [Required]
        public UserSet Set { get; set; }

        public ICollection<TestTaker>? TestTakers { get; set; }

        public Session()
        {

        }

        public Session (Guid _code, DateTime _expirationTime, DateTime _startTime, string _sessionName)
        {
            SessionName = _sessionName;
            UniqueSessionCode = _code;
            ExpirationTime = _expirationTime;
            StartTime = _startTime;
            TestTakers = new List<TestTaker>();
        }
    }
}
