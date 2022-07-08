using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Models.StudentsAnswersModels;
using System.Diagnostics;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class StudentsAnswersController : Controller
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

        private readonly IHttpContextAccessor HttpContextAccessor;

        public StudentsAnswersController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        private string GetContentType(string path)
        {
            var types = GetMimeTypes();
            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types[ext];
        }

        private Dictionary<string, string> GetMimeTypes()
        {
            return new Dictionary<string, string>
            {
                {".txt", "text/plain"},
                {".pdf", "application/pdf"},
                {".doc", "application/msword"},
                {".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
                {".xls", "application/vnd.ms-excel"},
                {".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},  
                {".png", "image/png"},
                {".jpg", "image/jpeg"},
                {".jpeg", "image/jpeg"},
                {".gif", "image/gif"},
                {".csv", "text/csv"},
                {".accdb", "application/msaccess"}
            };
        }

        [ActivatorUtilitiesConstructor]
        public IActionResult Answers()
        {
            return View("StudentAnswers");
        }

        [HttpPost]
        public string GetAnswers([FromBody] UserIdentifier IdentifierObject)
        {
            Debug.WriteLine(IdentifierObject.Identifier);
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
                        .Where(TestTaker => TestTaker.TakerIdentifier.ToString() == IdentifierObject.Identifier)
                        .Select(TestTaker => TestTaker.Session.Set.Username)
                        .FirstOrDefault();

                    if (SetUsername.ToString() != UserName.ToString())
                    {
                        return "Error";
                    }

                    var CurrentTaker = Context.TestTakers
                        .Include(TestTaker => TestTaker.TakerAnswers)
                        .ThenInclude(Answer => Answer.Exercise)
                        .Where(TestTaker => TestTaker.TakerIdentifier.ToString() == IdentifierObject.Identifier)
                        .Select(TestTaker => new
                        {
                            FirstName = TestTaker.TakerFirstName,
                            LastName = TestTaker.TakerLastName,
                            SubmissionDate = TestTaker.TakerAnswerSubmissionDate,
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
                                Answer.Exercise.Points,
                                Answer.Exercise.Hashtags
                            })
                        }).FirstOrDefault();

                    if (CurrentTaker != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(CurrentTaker,
                            Formatting.Indented, new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
                        return JSONResult;
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
        public async Task<string> PostFileNames([FromBody] List<string> FileNames)
        {
            try
            {
                Debug.WriteLine(FileNames[0]);
                string JSONResult = JsonConvert.SerializeObject(FileNames);
                TempData["UserFileNames"] = JSONResult;
                return "Success";
            }
            catch
            {
                return "Error";
            }
        }

        [HttpGet]
        public async Task<List<FileContentResult>?> GetUserFiles()
        {
            try
            {
                List<string> FileNames = JsonConvert.DeserializeObject
                    <List<string>>(TempData["UserFileNames"].ToString());
                Debug.WriteLine(FileNames[0]);
                List<FileContentResult> Files = new List<FileContentResult>();
                if (FileNames == null)
                {
                    return null;
                }

                foreach (string FileName in FileNames)
                {
                    if (FileName == null)
                    {
                        return null;
                    }

                    Debug.WriteLine(Directory.GetCurrentDirectory());
                    Debug.WriteLine(Directory.GetCurrentDirectory() + "\\UserFiles");
                    var UserFile = Directory.GetFiles(Directory.GetCurrentDirectory() + "\\UserFiles", FileName + ".*");
                    if (UserFile.Length > 0)
                    {
                        var FilePath = Path.Combine(Directory.GetCurrentDirectory(), "UserFiles", UserFile[0]);

                        var Memory = new MemoryStream();
                        using (var Stream = new FileStream(FilePath, FileMode.Open))
                        {
                            await Stream.CopyToAsync(Memory);
                        }
                        Memory.Position = 0;

                        Files.Add(new FileContentResult(Memory.ToArray(), GetContentType(FilePath)));
                    }
                }

                return Files;
            }
            catch (Exception ex)
            {
                return null;
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
    }
}
