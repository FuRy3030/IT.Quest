using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolMatura.Entities
{
    public enum GradingStatus : int
    {
        NotGraded,
        PartiallyGraded,
        FullyGraded
    }

    public class TestTaker
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TakerId { get; set; }

        [ForeignKey("Session")]
        public int? SessionId { get; set; }

        [Required]
        public string TakerFirstName { get; set; }

        [Required]
        public string TakerLastName { get; set; }

        [Required]
        public Guid TakerIdentifier { get; set; }

        public DateTime? TakerAnswerSubmissionDate { get; set; }

        [Required]
        public GradingStatus GradingStatus { get; set; }

        [Required]
        public Session? Session { get; set; }

        public ICollection<TakerAnswer>? TakerAnswers { get; set; }

        public TestTaker()
        {

        }

        public TestTaker (string _takerFirstName, string _takerLastName, Guid _takerIdentifier, Session _session)
        {
            TakerFirstName = _takerFirstName;
            TakerLastName = _takerLastName;
            TakerIdentifier = _takerIdentifier;
            Session = _session;
            TakerAnswers = new List<TakerAnswer>();
        }
    }
}
