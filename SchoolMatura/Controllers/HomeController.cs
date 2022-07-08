using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Models;
using System.Diagnostics;

namespace SchoolMatura.Controllers
{
    public class HomeController : Controller
    {
        public class GuidSessionIdentifier {
            public string SessionIdentifier { get; set; }
        }

        private readonly ILogger<HomeController> _logger;

        private readonly IHttpContextAccessor HttpContextAccessor;

        public HomeController(ILogger<HomeController> logger, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            HttpContextAccessor = httpContextAccessor;
        }

        public IActionResult Index()
        {
            if (TempData["ShowRegisterModal"] != null && (bool)TempData["ShowRegisterModal"] == true)
            {
                ViewBag.ShowModal = true;
                TempData["ShowRegisterModal"] = false;
            }
            else
            {
                ViewBag.ShowModal = false;
            }

            if (TempData["ShowNewPasswordModal"] != null && (bool)TempData["ShowNewPasswordModal"] == true)
            {
                ViewBag.ShowModalNewPassword = true;
                TempData["ShowNewPasswordModal"] = false;
            }
            else
            {
                ViewBag.ShowModalNewPassword = false;
            }

            if (TempData["ShowNewPasswordErrorModal"] != null && (bool)TempData["ShowNewPasswordErrorModal"] == true)
            {
                ViewBag.ShowModalNewPasswordError = true;
                TempData["ShowNewPasswordErrorModal"] = false;
            }
            else
            {
                ViewBag.ShowModalNewPasswordError = false;
            }

            return View();
        }

        [HttpPost]
        public string IsCodeValid([FromBody] GuidSessionIdentifier GuidSessionIdentifier)
        {
            try
            {
                using (var Context = new SetsDbContext())
                {
                    Debug.WriteLine(GuidSessionIdentifier.SessionIdentifier);
                    var FoundUniqueSessionCode = Context.Sessions
                        .Where(Session => Session.UniqueSessionCode.ToString() == GuidSessionIdentifier.SessionIdentifier)
                        .Select(Session => new { 
                            UniqueCodeString = Session.UniqueSessionCode.ToString(), 
                            Session.ExpirationTime
                        })
                        .FirstOrDefault();

                    if (FoundUniqueSessionCode != null)
                    {
                        if (DateTime.Compare(FoundUniqueSessionCode.ExpirationTime, DateTime.Now) > 0)
                        {
                            TempData["SessionIdentifier"] = FoundUniqueSessionCode.UniqueCodeString;
                            return "Success";
                        }
                    }
                }
                return "Error";
            }
            catch
            {
                return "Error";
            }
        }

        [HttpGet]
        public string NavBarDataHandler()
        {
            try 
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "Error";
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new ExercisePoolDbContext())
                {
                    using (var SecondContext = new SetsDbContext())
                    {
                        var UserExercises = Context.IndependentExercises
                            .Where(IndependentExercise => IndependentExercise.Username == UserName)
                            .OrderByDescending(IndependentExercise => IndependentExercise.CreationTime)
                            .Select(IndependentExercise => new
                            {
                                Title = IndependentExercise.Title,
                                Type = IndependentExercise.ExerciseType,
                                Date = IndependentExercise.CreationTime
                            }).Distinct().Take(6).ToList();

                        var UserSets = SecondContext.Sets
                            .Where(Set => Set.Username == UserName)
                            .OrderByDescending(Set => Set.CreationTime)
                            .Select(Set => new
                            {
                                Title = Set.Title,
                                ExercisesCount = Set.Exercises.Count,
                                Date = Set.CreationTime
                            }).Take(6).ToList();

                        var UserRecentData = new
                        {
                            Sets = UserSets,
                            Exercises = UserExercises
                        };

                        if (UserRecentData != null)
                        {
                            string JSONResult = JsonConvert.SerializeObject(UserRecentData,
                                Formatting.Indented, new JsonSerializerSettings
                                {
                                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                                });
                            return JSONResult;
                        }

                        return "Error";
                    }
                }
            }
            catch
            {
                return "Error";
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}