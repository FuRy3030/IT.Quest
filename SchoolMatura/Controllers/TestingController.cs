using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using AspNetCore.ReCaptcha;

namespace SchoolMatura.Controllers
{
    [ValidateReCaptcha]
    public class TestingController : Controller
    {
        public string? SessionIdentifier { get; set; }

        public string? TestTakerIdentifier { get; set; }

        public class Credentials
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
        }

        public class TestTakerSubmittedData
        {
            public List<AnswerData> UserAnswers { get; set; }
            public string TakerIdentifier { get; set; }
        }

        public class AnswerData
        {
            public int ExerciseId { get; set; }
            public string Answer { get; set; }
        }

        public class ResponseObject
        {
            public string ResponseMessage { get; set; }
            public string TestTakerIdentifier { get; set; }
        }

        public class CodeFromFile
        {
            public string Identifier { get; set; }
            public List<int> ExerciseOrders { get; set; }
            public List<string> Codes { get; set; }
            public List<string> Languages { get; set; }
        }

        public class FileData
        {
            public IFormFileCollection? Files { get; set; }
        }

        public IActionResult UserCredentials([FromQuery] string? Id)
        {
            try
            {
                SessionIdentifier = Id ?? TempData["SessionIdentifier"].ToString();
                if (SessionIdentifier == null)
                {
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    TempData["SessionIdentifier"] = SessionIdentifier;
                    return View("Credentials");
                }
            }
            catch (Exception ex)
            {
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpPost]
        public async Task<string> SubmitCredentials([FromBody] Credentials UserCredentials)
        {
            try
            {
                SessionIdentifier = TempData["SessionIdentifier"].ToString();
                using (var Context = new SetsDbContext())
                {
                    Session CurrentSession = Context.Sessions
                        .Where(Session => Session.UniqueSessionCode.ToString() == SessionIdentifier)
                        .FirstOrDefault();

                    if (CurrentSession != null &&
                        UserCredentials.FirstName != "" &&
                        UserCredentials.LastName != "")
                    {
                        Guid CurrentTakerIdentifier = Guid.NewGuid();
                        TestTaker CurrentTestTaker = new TestTaker(UserCredentials.FirstName, 
                            UserCredentials.LastName, CurrentTakerIdentifier, CurrentSession);
                        Context.TestTakers.Add(CurrentTestTaker);
                        await Context.SaveChangesAsync();

                        ResponseObject CurrentResponse = new ResponseObject();
                        CurrentResponse.ResponseMessage = "Success";
                        CurrentResponse.TestTakerIdentifier = CurrentTakerIdentifier.ToString();
                        string JSONResult = JsonConvert.SerializeObject(CurrentResponse, Formatting.Indented,
                            new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            }
                        );
                        return JSONResult;
                    }
                }
                return "Error";
            }
            catch (Exception ex)
            {
                ResponseObject CurrentResponse = new ResponseObject();
                CurrentResponse.ResponseMessage = ex.Message;
                CurrentResponse.TestTakerIdentifier = "";
                string JSONResult = JsonConvert.SerializeObject(CurrentResponse, Formatting.Indented,
                    new JsonSerializerSettings
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    }
                );
                return JSONResult;
            }
        }

        public IActionResult Questions()
        {
            return View("Questions");
        }

        [HttpPost]
        public string GetTakerQuestions([FromQuery(Name = "identifier")] string UserIdentifier)
        {
            try
            {
                Debug.WriteLine(UserIdentifier + "a");
                TestTakerIdentifier = UserIdentifier.ToString();
                using (var Context = new SetsDbContext())
                {
                    var TestTakerData = Context.TestTakers
                        .Include(TestTaker => TestTaker.Session)
                        .ThenInclude(Session => Session.Set)
                        .ThenInclude(Set => Set.Exercises)
                        .Where(TestTaker => TestTaker.TakerIdentifier.ToString() == TestTakerIdentifier)
                        .Select(TestTaker => new
                        {
                            Exercises = TestTaker.Session.Set.Exercises.ToList(),
                            TakerIdentifier = TestTakerIdentifier
                        });

                    string JSONResult = JsonConvert.SerializeObject(TestTakerData, Formatting.Indented,
                        new JsonSerializerSettings
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        }
                    );
                    return JSONResult;
                }
            }
            catch
            {
                return "Error";
            }
        }

        [HttpPost]
        public async Task<string> UpdateTakerAnswers([FromBody] TestTakerSubmittedData SubmittedAnswers)
        {
            try
            {
                using (var Context = new SetsDbContext())
                {
                    var CurrentTestTaker = Context.TestTakers
                        .Include(TestTaker => TestTaker.TakerAnswers)
                        .Where(TestTaker => TestTaker.TakerIdentifier.ToString() == SubmittedAnswers.TakerIdentifier)
                        .FirstOrDefault();

                    if (CurrentTestTaker != null && (CurrentTestTaker.TakerAnswers == null || 
                        CurrentTestTaker.TakerAnswers.Count == 0))
                    {
                        List<TakerAnswer> CurrentAnswers = new List<TakerAnswer>();
                        CurrentTestTaker.TakerAnswerSubmissionDate = DateTime.Now;

                        foreach (AnswerData AnswerData in SubmittedAnswers.UserAnswers)
                        {
                            TakerAnswer CurrentTakerAnswer = new TakerAnswer
                                (AnswerData.Answer, AnswerData.ExerciseId, CurrentTestTaker);
                            CurrentAnswers.Add(CurrentTakerAnswer);
                        }
                        CurrentTestTaker.TakerAnswers = CurrentAnswers;

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

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<string> SaveFileAnswers([FromForm] CodeFromFile CodeData)
        {
            try
            {
                using (var Context = new SetsDbContext())
                {
                    for (int i = 0; i < CodeData.Codes.Count; i++)
                    {
                        var CurrentAnswer = Context.Answers
                            .Include(Answer => Answer.TestTaker)
                            .Include(Answer => Answer.Exercise)
                            .Where(Answer =>
                                Answer.TestTaker.TakerIdentifier.ToString() == CodeData.Identifier &&
                                Answer.Exercise.MainOrder == CodeData.ExerciseOrders[i])
                            .FirstOrDefault();

                        if (CurrentAnswer != null)
                        {
                            CurrentAnswer.CodeAnswer = CodeData.Codes[i];
                            CurrentAnswer.CodingLanguage = CodeData.Languages[i];
                            await Context.SaveChangesAsync();
                            return "Success";
                        }
                    }

                }
                //foreach (var File in FileData.Files)
                //{
                //    var path = Path.Combine(Directory.GetCurrentDirectory(), "UserFiles",
                //      File.Name);

                //    using (var stream = new FileStream(path, FileMode.Create))
                //    {
                //        await File.CopyToAsync(stream);
                //    }
                //}

                return "Error";
            }
            catch
            {
                return "Error";
            }
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<string> SaveNonCodeFileAnswers([FromForm] FileData FileData)
        {
            try
            {
                if (FileData == null)
                {
                    return "Error";
                }

                foreach (var File in FileData.Files)
                {
                    var path = Path.Combine(Directory.GetCurrentDirectory(), "UserFiles",
                      File.FileName);

                    Debug.WriteLine(File.FileName);
                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await File.CopyToAsync(stream);
                    }
                    return "Success";
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
