using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.AuthModels
{
    public class Register
    {
        [Required]
        [DataType(DataType.Text)]
        [MaxLength(150)]
        public string FirstName { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [MaxLength(150)]
        public string LastName { get; set; }

        [Required]
        [DataType(DataType.EmailAddress)]
        [MaxLength(250)]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [MaxLength(300)]
        public string Password { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [MaxLength(300)]
        [Compare("Password", ErrorMessage = "Podane hasła nie są identyczne!")]
        public string ConfirmPassword { get; set; }

        [Required]
        public string Token { get; set; }
    }
}
