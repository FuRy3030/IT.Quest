using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.AuthModels
{
    public class Login
    {
        [Required]
        [DataType(DataType.EmailAddress)]
        [MaxLength(250)]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [MaxLength(300)]
        public string Password { get; set; }

        public bool RememberMe { get; set; }

        [Required]
        public string Token { get; set; }
    }
}
