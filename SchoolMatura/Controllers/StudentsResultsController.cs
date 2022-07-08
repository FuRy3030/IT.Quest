using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using System.Diagnostics;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class StudentsResultsController : Controller
    {
        public class SessionIdentifier
        {
            public string? Identifier { get; set; }
        }

        private readonly IHttpContextAccessor HttpContextAccessor;

        public StudentsResultsController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        [ActivatorUtilitiesConstructor]
        public IActionResult Sessions()
        {
            return View("SessionsList");
        }

        [ActivatorUtilitiesConstructor]
        public IActionResult Summary()
        {
            return View("Summary");
        }

        [HttpGet]
        public string UserSessions()
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }
                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name.ToString();

                using (var Context = new SetsDbContext())
                {
                    var UserSessions = Context.Sessions
                        .Include(Session => Session.Set)
                        .Include(Session => Session.TestTakers)
                        .Where(Session => Session.Set.Username == UserName)
                        .Select(Session => new
                        {
                            Session.SessionName,
                            Session.ExpirationTime,
                            Session.UniqueSessionCode,
                            StudentsNumber = Session.TestTakers
                                .Where(Taker => Taker.TakerAnswerSubmissionDate != null)
                                .ToList().Count
                        }).ToList();

                    var FilteredUserSessions = UserSessions.Where(Session => Session.StudentsNumber > 0);

                    if (FilteredUserSessions != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(FilteredUserSessions,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
                    }

                    return "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        [HttpPost]
        public string SessionSummary([FromBody] SessionIdentifier IdentifierObject)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }
                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name.ToString();

                using (var Context = new SetsDbContext())
                {
                    var TestTakersScores = Context.TestTakers
                        .Include(TestTaker => TestTaker.Session)
                            .ThenInclude(Session => Session.Set)
                        .Include(TestTaker => TestTaker.TakerAnswers)
                            .ThenInclude(TakerAnswer => TakerAnswer.Exercise)
                        .Where(TestTaker => TestTaker.Session.Set.Username == UserName &&
                            TestTaker.Session.UniqueSessionCode.ToString() == IdentifierObject.Identifier &&
                            TestTaker.TakerAnswers.Count > 0)
                        .Select(TestTaker => new
                        {
                            Credentials = TestTaker.TakerFirstName + " " + TestTaker.TakerLastName,
                            TestTaker.TakerAnswerSubmissionDate,
                            Answers = TestTaker.TakerAnswers.Select(TakerAnswer => new
                            {
                                TakerAnswer.ScoredPoints,
                                TakerAnswer.Exercise.MainOrder,
                                TakerAnswer.Exercise.SubOrder,
                                TakerAnswer.Exercise.Points
                            })
                        }).ToList();

                    if (TestTakersScores != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(TestTakersScores,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
                    }

                    return "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        [HttpPost]
        public string SessionDetails([FromBody] SessionIdentifier IdentifierObject)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }
                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name.ToString();

                using (var Context = new SetsDbContext())
                {
                    var SessionDetails = Context.Sessions
                        .Include(Session => Session.Set)
                        .Where(Session => Session.Set.Username == UserName &&
                            Session.UniqueSessionCode.ToString() == IdentifierObject.Identifier)
                        .Select(Session => new
                        {
                            Session.SessionName,
                            Session.ExpirationTime
                        }).FirstOrDefault();


                    if (SessionDetails != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(SessionDetails,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
                    }

                    return "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }
    }
}
