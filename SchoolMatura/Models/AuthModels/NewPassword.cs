using System.ComponentModel.DataAnnotations;

namespace SchoolMatura.Models.AuthModels
{
    public class NewPassword
    {
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

        [Required]
        public string ID { get; set; }
    }
}
