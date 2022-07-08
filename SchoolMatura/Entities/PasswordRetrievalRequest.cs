using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Entities
{
    public class PasswordRetrievalRequest
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public Guid RequestCode { get; set; }

        [Required]
        public DateTime ExpirationTime { get; set; }

        public PasswordRetrievalRequest()
        {

        }

        public PasswordRetrievalRequest(Guid _requestCode, string _email)
        {
            RequestCode = _requestCode;
            Email = _email;
            ExpirationTime = DateTime.Now;
        }
    }
}
