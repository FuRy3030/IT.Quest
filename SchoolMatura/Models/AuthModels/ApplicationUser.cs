using Microsoft.AspNetCore.Identity;

namespace SchoolMatura.Models.AuthModels
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
