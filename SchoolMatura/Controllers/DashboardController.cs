using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using System.Linq;

namespace SchoolMatura.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IHttpContextAccessor HttpContextAccessor;

        public DashboardController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        public IActionResult Main()
        {
            return View();
        }

        [HttpGet]
        public string UserData()
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
                                Date = IndependentExercise.CreationTime,
                                Type = "Exercise"
                            }).Distinct().Take(6).ToList();

                        var UserSets = SecondContext.Sets
                            .Where(Set => Set.Username == UserName)
                            .OrderByDescending(Set => Set.CreationTime)
                            .Select(Set => new
                            {
                                Title = Set.Title,
                                Date = Set.CreationTime,
                                Type = "Set"
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

        [HttpGet]
        public string UserLiveSessions()
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "Error";
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new SetsDbContext())
                {
                    var UserLiveSessions = Context.Sessions
                        .Include(Session => Session.Set)
                        .Include(Session => Session.TestTakers)
                        .Where(Session => Session.Set.Username == UserName &&
                            DateTime.Compare(Session.ExpirationTime, DateTime.Now) > 0 &&
                            DateTime.Compare(Session.StartTime, DateTime.Now) < 0)
                        .GroupBy(Session => Session.Set.Title)
                        .Select(SessionGroup => new
                        {
                            SetTitle = SessionGroup.First().Set.Title,
                            Sessions = SessionGroup.Select(Session => new
                            {
                                 SessionTitle = Session.SessionName,
                                 ExpirationDate = Session.ExpirationTime,
                                 TestTakersAmount = Session.TestTakers.Count,
                                 SessionID = Session.UniqueSessionCode
                            })
                            .OrderByDescending(Session => Session.ExpirationDate)
                            .ToList()
                        })
                        .OrderBy(SessionGroup => SessionGroup.SetTitle)
                        .ToList();                          

                    if (UserLiveSessions != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(UserLiveSessions,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
                    }

                    return "Error";
                }
            }
            catch
            {
                return "Error";
            }
        }

        [HttpGet]
        public string UserRecentTestTakers()
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "Error";
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new SetsDbContext())
                {
                    var TestTakersWithActionsToBeDone = Context.TestTakers
                        .Include(TestTaker => TestTaker.Session)
                            .ThenInclude(Session => Session.Set)
                        .Select(TestTaker => new
                        {
                            NotGraded = Context.TestTakers
                                .Where(TestTaker => TestTaker.Session.Set.Username == UserName &&
                                    TestTaker.GradingStatus == Entities.GradingStatus.NotGraded &&                           
                                    DateTime.Compare(TestTaker.Session.ExpirationTime, DateTime.Now) < 0)
                                .GroupBy(TestTaker => TestTaker.Session.SessionName)
                                .Select(TestTakersGroup => new {
                                    SessionName = TestTakersGroup.First().Session.SessionName,
                                    ExpirationTime = TestTakersGroup.First().Session.ExpirationTime,
                                    SessionID = TestTakersGroup.First().Session.UniqueSessionCode,
                                    SessionTakers = TestTakersGroup
                                        .Where(TestTaker => TestTaker.TakerAnswerSubmissionDate != null)
                                        .Select(TestTaker => new
                                         {
                                             Credentials = TestTaker.TakerLastName + " " + TestTaker.TakerFirstName,
                                             ID = TestTaker.TakerIdentifier,
                                             SubmissionDate = TestTaker.TakerAnswerSubmissionDate,
                                             MarkingStatus = TestTaker.GradingStatus
                                         })
                                        .OrderByDescending(TestTaker => TestTaker.SubmissionDate)
                                        .Take(2)
                                        .ToList()
                                 })
                                .OrderByDescending(TestTakersGroup => TestTakersGroup.ExpirationTime)
                                .Take(4)
                                .ToList(),

                            PartiallyGraded = Context.TestTakers
                                .Where(TestTaker => TestTaker.Session.Set.Username == UserName &&
                                    TestTaker.GradingStatus == Entities.GradingStatus.PartiallyGraded &&
                                    DateTime.Compare(TestTaker.Session.ExpirationTime, DateTime.Now) < 0)
                                .GroupBy(TestTaker => TestTaker.Session.SessionName)
                                .Select(TestTakersGroup => new {
                                    SessionName = TestTakersGroup.First().Session.SessionName,
                                    ExpirationTime = TestTakersGroup.First().Session.ExpirationTime,
                                    SessionID = TestTakersGroup.First().Session.UniqueSessionCode,
                                    SessionTakers = TestTakersGroup
                                        .Where(TestTaker => TestTaker.TakerAnswerSubmissionDate != null)
                                        .Select(TestTaker => new
                                        {
                                            Credentials = TestTaker.TakerLastName + " " + TestTaker.TakerFirstName,
                                            ID = TestTaker.TakerIdentifier,
                                            SubmissionDate = TestTaker.TakerAnswerSubmissionDate,
                                            MarkingStatus = TestTaker.GradingStatus
                                        })
                                        .OrderByDescending(TestTaker => TestTaker.SubmissionDate)
                                        .Take(2)
                                        .ToList()
                                })
                                .OrderByDescending(TestTakersGroup => TestTakersGroup.ExpirationTime)
                                .Take(4)
                                .ToList(),
                        })
                        .FirstOrDefault();

                    if (TestTakersWithActionsToBeDone != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(TestTakersWithActionsToBeDone,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
                    }

                    return "Error";
                }
            }
            catch
            {
                return "Error";
            }
        }
    }
}
