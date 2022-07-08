using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Models.StudentsAnswersModels;
using System.Diagnostics;

namespace SchoolMatura.Controllers
{
    public class SessionsController : Controller
    {
        public class UserIdentifier
        {
            public string? Identifier { get; set; }
        }

        public class TeacherCheck
        {
            public string Identifier { get; set; }
            public List<MarkedExercise> MarkedExercises { get; set; }
            public int GradingStatus { get; set; }
        }

        public class SessionObject
        {
            public string Identifier { get; set; }
            public string NewSessionName { get; set; }
            public DateTime NewSessionStartDate { get; set; }
            public DateTime NewSessionEndDate { get; set; }
        }

        private readonly IHttpContextAccessor HttpContextAccessor;

        public SessionsController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        public IActionResult List()
        {
            return View("SessionsList");
        }

        public IActionResult Details()
        {
            return View("SessionDetails");
        }

        [HttpGet]
        public string AllUserSessions()
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
                    var SessionsGrouppedBySet = Context.Sessions
                        .Include(Session => Session.Set)
                        .Include(Session => Session.TestTakers)
                        .Where(Session => Session.Set.Username == UserName)
                        .OrderByDescending(Session => Session.Set.CreationTime)
                        .GroupBy(Session => Session.Set.Title)
                        .Select(SessionsGroup => SessionsGroup
                            .Select(Session => new
                            {
                                ID = Session.UniqueSessionCode,
                                SessionTitle = Session.SessionName,
                                SetTitle = Session.Set.Title,
                                StartDate = Session.StartTime,
                                ExpirationDate = Session.ExpirationTime,
                                TestTakersAmount = Session.TestTakers.Count,
                                TestTakersNames = Session.TestTakers
                                    .OrderByDescending(TestTaker => TestTaker.TakerAnswerSubmissionDate)
                                    .Select(TestTaker => TestTaker.TakerFirstName + " " +
                                        TestTaker.TakerLastName)
                                    .Take(4)
                            })
                            .OrderByDescending(Session => Session.StartDate)
                            .ToList())
                        .ToList();

                    var SessionsList = Context.Sessions
                        .Include(Session => Session.Set)
                        .Include(Session => Session.TestTakers)
                        .Where(Session => Session.Set.Username == UserName)
                        .Select(Session => new
                        {
                            ID = Session.UniqueSessionCode,
                            SessionTitle = Session.SessionName,
                            SetTitle = Session.Set.Title,
                            StartDate = Session.StartTime,
                            ExpirationDate = Session.ExpirationTime,
                            TestTakersAmount = Session.TestTakers.Count,
                            TestTakersNames = Session.TestTakers
                                .OrderByDescending(TestTaker => TestTaker.TakerAnswerSubmissionDate)
                                .Select(TestTaker => TestTaker.TakerFirstName + " " +
                                    TestTaker.TakerLastName)
                                .Take(4)
                        })
                        .ToList();

                    var SessionsGrouppedByDate = new
                    {
                        NotStarted = SessionsList
                                .Where(Session => DateTime.Compare(Session.StartDate, DateTime.Now) >= 0)
                                .OrderByDescending(Session => Session.StartDate)
                                .ToList(),

                        TodayAndYesterday = SessionsList
                                .Where(Session =>
                                    DateTime.Compare(Session.StartDate, DateTime.Now) < 0 &&
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-2)) >= 0)
                                .OrderByDescending(Session => Session.StartDate)
                                .ToList(),

                        LastWeek = SessionsList
                                .Where(Session =>
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-2)) < 0 &&
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-7)) >= 0
                                 )
                                .OrderByDescending(Session => Session.StartDate)
                                .ToList(),

                        LastMonth = SessionsList
                                .Where(Session =>
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-7)) < 0 &&
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-31)) >= 0
                                 )
                                .OrderByDescending(Session => Session.StartDate)
                                .ToList(),

                        LastYear = SessionsList
                                .Where(Session =>
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-31)) < 0 &&
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-365)) >= 0
                                 )
                                .OrderByDescending(Session => Session.StartDate)
                                .ToList(),

                        Earlier = SessionsList
                                .Where(Session =>
                                    DateTime.Compare(Session.StartDate, DateTime.Now.AddDays(-365)) < 0)
                                .OrderByDescending(Session => Session.StartDate)
                                .ToList()
                    };

                    var UserSessions = new
                    {
                        SessionsGrouppedBySet = SessionsGrouppedBySet,
                        SessionsGrouppedByDate = SessionsGrouppedByDate
                    };

                    if (UserSessions != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(UserSessions,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
                    }

                    return "Error";
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return "Error";
            }
        }

        [HttpPost]
        public string SessionDetails([FromBody] UserIdentifier ID)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "Error";
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                Debug.WriteLine('a');
                Debug.WriteLine(ID.Identifier);

                using (var Context = new SetsDbContext())
                {
                    var SessionDetails = Context.Sessions
                        .Include(Session => Session.Set)
                        .Include(Session => Session.TestTakers)
                            .ThenInclude(TestTakers => TestTakers.TakerAnswers)
                            .ThenInclude(Answer => Answer.Exercise)
                        .Where(Session => Session.Set.Username == UserName &&
                            Session.UniqueSessionCode.ToString() == ID.Identifier)
                        .Select(Session => new
                        {
                            Details = new
                            {
                                Session.StartTime,
                                Session.ExpirationTime,
                                Session.SessionName
                            },
                            TestTakers = Session.TestTakers.Select(TestTaker => new
                            {
                                Credentials = TestTaker.TakerLastName + " " + TestTaker.TakerFirstName,
                                ID = TestTaker.TakerIdentifier,
                                SubmissionDate = TestTaker.TakerAnswerSubmissionDate,
                                MarkingStatus = TestTaker.GradingStatus,
                                Answers = TestTaker.TakerAnswers.Select(Answer => new
                                {
                                    CodeAnswerContent = Answer.CodeAnswer,
                                    CodeAnswerLanguage = Answer.CodingLanguage,
                                    AnswerContent = Answer.UserAnswer,
                                    GainedPoints = Answer.ScoredPoints,
                                    TeacherComment = Answer.TeacherComment,
                                    ExerciseContent = Answer.Exercise.Content,
                                    Answer.Exercise.ExerciseType,
                                    Answer.Exercise.MainOrder,
                                    Answer.Exercise.SubOrder,
                                    Answer.Exercise.CorrectAnswer,
                                    Answer.Exercise.AdditionalData,
                                    Answer.Exercise.Points
                                })
                                .ToList()
                            })
                            .OrderByDescending(TestTaker => TestTaker.SubmissionDate)
                            .ToList()
                        })
                        .FirstOrDefault();

                    if (SessionDetails != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(SessionDetails,
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

        [HttpPost]
        public async Task<string> UpdateTeacherMarking([FromBody] TeacherCheck MarkedData)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }
                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new SetsDbContext())
                {
                    string SetUsername = Context.TestTakers
                        .Include(TestTaker => TestTaker.Session)
                            .ThenInclude(Session => Session.Set)
                        .Where(TestTaker => TestTaker.TakerIdentifier.ToString() == MarkedData.Identifier)
                        .Select(TestTaker => TestTaker.Session.Set.Username)
                        .FirstOrDefault();

                    if (SetUsername.ToString() != UserName.ToString())
                    {
                        return "Error";
                    }

                    var CurrentTaker = Context.TestTakers
                        .Include(TestTaker => TestTaker.TakerAnswers)
                        .ThenInclude(Answer => Answer.Exercise)
                        .Where(TestTaker => TestTaker.TakerIdentifier.ToString() == MarkedData.Identifier)
                        .FirstOrDefault();

                    CurrentTaker.GradingStatus = (Entities.GradingStatus)MarkedData.GradingStatus;

                    var AnswersList = CurrentTaker.TakerAnswers
                        .OrderBy(Answer => Answer.Exercise.MainOrder)
                        .ToList();

                    int j = 0;
                    for (int i = 0; i < AnswersList.Count; i++)
                    {
                        if (AnswersList[i].Exercise.MainOrder == MarkedData.MarkedExercises[j].ExerciseOrder)
                        {
                            AnswersList[i].ScoredPoints = MarkedData.MarkedExercises[j].AnswerPoints;
                            AnswersList[i].TeacherComment = MarkedData.MarkedExercises[j].TeacherComment;
                        }

                        if (i != AnswersList.Count - 1)
                        {
                            if (AnswersList[i + 1].Exercise.ExerciseType == "TrueFalseExercise" &&
                                AnswersList[i].Exercise.ExerciseType == "TrueFalseExercise")
                            {
                                //Don't increment
                            }
                            else
                            {
                                j++;
                            }
                        }
                    }

                    await Context.SaveChangesAsync();
                    return "Success";
                }
            }
            catch
            {
                return "Error";
            }
        }

        [HttpPost]
        public async Task<string> UpdateSession([FromBody] SessionObject SessionUpdate)
        {
            try
            {
                SessionUpdate.NewSessionStartDate = SessionUpdate.NewSessionStartDate.AddHours(2);
                SessionUpdate.NewSessionEndDate = SessionUpdate.NewSessionEndDate.AddHours(2);

                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }
                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                if (DateTime.Compare(SessionUpdate.NewSessionEndDate, DateTime.Now) <= 0)
                {
                    return "WrongDate";
                }

                if (DateTime.Compare(SessionUpdate.NewSessionStartDate, SessionUpdate.NewSessionEndDate) > 0)
                {
                    return "WrongDateRelation";
                }

                if (SessionUpdate.NewSessionName.Length < 1)
                {
                    return "EmptyName";
                }

                using (var Context = new SetsDbContext())
                {
                    var CurrentSession = Context.Sessions
                        .Include(Session => Session.Set)
                        .Where(Session => Session.Set.Username == UserName &&
                            Session.UniqueSessionCode.ToString() == SessionUpdate.Identifier)
                        .FirstOrDefault();

                    if (CurrentSession != null)
                    {
                        CurrentSession.StartTime = SessionUpdate.NewSessionStartDate;
                        CurrentSession.ExpirationTime = SessionUpdate.NewSessionEndDate;
                        CurrentSession.SessionName = SessionUpdate.NewSessionName;

                        await Context.SaveChangesAsync();
                        return "Success";
                    }
                }
                return "Error";
            }
            catch
            {
                return "Error";
            }
        }
    }
}
