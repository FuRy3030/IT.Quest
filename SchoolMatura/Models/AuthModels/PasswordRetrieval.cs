using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.AuthModels
{
    public class PasswordRetrieval
    {
        [Required]
        [DataType(DataType.EmailAddress)]
        [MaxLength(250)]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }
    }
}
