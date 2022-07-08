using AspNetCore.ReCaptcha;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using SchoolMatura.Classes;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using SchoolMatura.Models;
using SchoolMatura.Models.AuthModels;
using System.Data;
using System.Diagnostics;

namespace SchoolMatura.Controllers
{
    public class AuthController : Controller
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly IOptionsMonitor<GoogleCaptchaConfig> config;

        public AuthController(UserManager<ApplicationUser> userManager, 
            SignInManager<ApplicationUser> signInManager, IOptionsMonitor<GoogleCaptchaConfig> Config)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.config = Config;
        }

        public class CurrentRequest
        {
            public string Email { get; set; }
            public DateTime ExpirationTime { get; set; }
        }

        public IActionResult Register()
        {
            return View();
        }

        public IActionResult Login()
        {
            return View();
        }

        public IActionResult PasswordRetrieval()
        {
            return View();
        }

        public IActionResult NewPassword()
        {
            return View();
        }

        public IActionResult EmailSent()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateNewUser(Register Model)
        {
            bool CaptchaResult = await GoogleCaptchaConfig
                    .VerifyToken(config.CurrentValue.SecretKey, Model.Token);

            if (CaptchaResult == false)
            {
                ModelState.AddModelError("", "Weryfikacja poprzez Captche nie została zdana pozytywnie!");
                return View("Login");
            }

            if (ModelState.IsValid)
            {
                ApplicationUser User = new ApplicationUser()
                {
                    FirstName = Model.FirstName,
                    LastName = Model.LastName,
                    UserName = Model.Email,
                    Email = Model.Email
                };

                var Result = await this.userManager.CreateAsync(User, Model.Password);
                if (Result.Succeeded)
                {
                    await signInManager.SignInAsync(User, isPersistent: false);
                    TempData["ShowRegisterModal"] = true;
                    return RedirectToAction("Index", "Home");
                }

                foreach (var Error in Result.Errors)
                {
                    ModelState.AddModelError(string.Empty, Error.Description);
                }
            }

            return View("Register");
        }

        [HttpPost]
        public async Task<IActionResult> AuthenticateUser(Login Model)
        {
            bool CaptchaResult = await GoogleCaptchaConfig
                    .VerifyToken(config.CurrentValue.SecretKey, Model.Token);

            if (CaptchaResult == false)
            {
                ModelState.AddModelError("", "Weryfikacja poprzez Captche nie została zdana pozytywnie!");
                return View("Login");
            }

            if (ModelState.IsValid)
            {
                var AuthenticationResult = await signInManager.PasswordSignInAsync
                    (Model.Email, Model.Password, isPersistent: Model.RememberMe, false);

                if (AuthenticationResult.Succeeded)
                {
                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError("", "Email lub hasło są niepoprawne!");
            }

            return View("Login");
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> PasswordRetrievalMailSent(PasswordRetrieval Model)
        {
            try
            {
                bool CaptchaResult = await GoogleCaptchaConfig
                    .VerifyToken(config.CurrentValue.SecretKey, Model.Token);

                if (CaptchaResult == false)
                {
                    ModelState.AddModelError("", "Weryfikacja poprzez Captche nie została zdana pozytywnie!");
                    return View("PasswordRetrieval");
                }

                var FoundUser = await userManager.FindByEmailAsync(Model.Email);

                if (FoundUser != null)
                {
                    IConfigurationRoot Configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
                    var ConnectionString = Configuration.GetConnectionString("AuthConnectionString");

                    SqlConnection con = new SqlConnection(ConnectionString);
                    if (con.State == ConnectionState.Closed)
                    {
                        con.Open();
                    } 

                    Guid RequestCode = Guid.NewGuid();
                    string NewRequestCmd = "INSERT INTO Requessts (Email, RequestCode, ExpirationTime) values " +
                        "(@Email, @NewGuid, @DateNow);";
                    SqlCommand NewRequest = new SqlCommand(NewRequestCmd, con);

                    NewRequest.Parameters.AddWithValue("@Email", SqlDbType.NVarChar).Value = Model.Email;
                    NewRequest.Parameters.AddWithValue("@NewGuid", SqlDbType.UniqueIdentifier).Value = RequestCode;
                    NewRequest.Parameters.AddWithValue("@DateNow", SqlDbType.DateTime2).Value = DateTime.Now.AddHours(3);

                    NewRequest.ExecuteNonQuery();
                    con.Close();

                    PasswordRetrievalFunctions.SendPasswordResetEmail(Model.Email, RequestCode.ToString());
                }

                return RedirectToAction("EmailSent", "Auth");
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return View("PasswordRetrieval");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SetNewPassword(NewPassword Model)
        {
            try
            {
                bool CaptchaResult = await GoogleCaptchaConfig
                    .VerifyToken(config.CurrentValue.SecretKey, Model.Token);

                if (CaptchaResult == false)
                {
                    ModelState.AddModelError("", "Weryfikacja poprzez Captche nie została zdana pozytywnie!");
                    return View("PasswordRetrieval");
                }

                CurrentRequest CurrentRequest = new CurrentRequest();

                IConfigurationRoot Configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
                var ConnectionString = Configuration.GetConnectionString("AuthConnectionString");

                SqlConnection con = new SqlConnection(ConnectionString);
                if (con.State == ConnectionState.Closed)
                {
                    con.Open();
                }

                string GetRequestEmailCmd = "SELECT Email, ExpirationTime FROM Requessts WHERE RequestCode = @ID;";
                SqlCommand GetRequestEmail = new SqlCommand(GetRequestEmailCmd, con);

                GetRequestEmail.Parameters.AddWithValue("@ID", SqlDbType.UniqueIdentifier).Value = 
                    Guid.Parse(Model.ID);

                using (SqlDataReader rdr = GetRequestEmail.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        CurrentRequest.Email = rdr.GetString(0);
                        CurrentRequest.ExpirationTime = rdr.GetDateTime(1);
                    }
                }
                con.Close();
                Debug.WriteLine('a');
                Debug.WriteLine(CurrentRequest.Email);
                Debug.WriteLine(CurrentRequest.ExpirationTime);

                if (DateTime.Compare(CurrentRequest.ExpirationTime, DateTime.Now) > 0)
                {
                    AuthDbContext Context = new AuthDbContext();
                    UserStore<ApplicationUser> Store = new UserStore<ApplicationUser>(Context);

                    var FoundUser = await Store.FindByEmailAsync(CurrentRequest.Email);
                    Debug.WriteLine('a');
                    string HashedNewPassword = userManager.PasswordHasher.HashPassword(FoundUser, Model.Password);
                    Debug.WriteLine('a');
                    Debug.WriteLine(HashedNewPassword);
                    await Store.SetPasswordHashAsync(FoundUser, HashedNewPassword);
                    Debug.WriteLine('a');
                    await Store.UpdateAsync(FoundUser);

                    Debug.WriteLine('a');
                    TempData["ShowNewPasswordModal"] = true;
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    TempData["ShowNewPasswordErrorModal"] = true;
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return View("NewPassword");
            }
        }
    }
}
