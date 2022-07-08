using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Models.ExercisePoolModels;
using System.Linq;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class ExercisesController : Controller
    {
        public List<IndependentExerciseModel>? IndependentExercises;

        private readonly IHttpContextAccessor HttpContextAccessor;

        public ExercisesController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        public IActionResult New()
        {
            return View("NewExercise");
        }

        public IActionResult List()
        {
            return View("ExercisesList");
        }

        public IActionResult Edit()
        {
            return View("EditExercise");
        }

        public IActionResult NewSet()
        {
            return View("NewSet");
        }

        [HttpPost]
        public async Task<IActionResult> CreateExercise([FromBody] List<IndependentExerciseModel> IndependentExercises)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return View("NewExercise");
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new ExercisePoolDbContext())
                {
                    if (IndependentExercises[0].Type == "TrueFalseExercise")
                    {
                        Guid RelationalGuid = Guid.NewGuid();
                        foreach (var IndependentExercise in IndependentExercises)
                        {
                            Entities.IndependentExercise IndependentExerciseEntity = 
                            new Entities.IndependentExercise(IndependentExercise.Type,
                                IndependentExercise.Content, IndependentExercise.CorrectAnswer, 
                                IndependentExercise.AdditionalData, IndependentExercise.Points, 
                                IndependentExercise.Hashtags, RelationalGuid, UserName, 
                                IndependentExercise.Title, DateTime.Now);
                            Context.Add(IndependentExerciseEntity);
                        }
                    }
                    else if (IndependentExercises.Count < 2)
                    {
                        foreach (var IndependentExercise in IndependentExercises)
                        {
                            Entities.IndependentExercise IndependentExerciseEntity =
                            new Entities.IndependentExercise(IndependentExercise.Type,
                                IndependentExercise.Content, IndependentExercise.CorrectAnswer,
                                IndependentExercise.AdditionalData, IndependentExercise.Points,
                                IndependentExercise.Hashtags, Guid.NewGuid(), UserName,
                                IndependentExercise.Title, DateTime.Now);
                            Context.Add(IndependentExerciseEntity);
                        }
                    }
              
                    await Context.SaveChangesAsync();
                    return View("NewExercise");
                }
            }
            catch
            {
                return View("NewExercise");
            }
        }

        [HttpPost]
        public async Task<IActionResult> 
            CreateExerciseWithGivenGuid([FromBody] List<IndependentExerciseModelWithGuid> IndependentExercises)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return View("EditExercise");
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new ExercisePoolDbContext())
                {
                    if (IndependentExercises[0].Type == "TrueFalseExercise")
                    {
                        foreach (var IndependentExercise in IndependentExercises)
                        {
                            Entities.IndependentExercise IndependentExerciseEntity =
                            new Entities.IndependentExercise(IndependentExercise.Type,
                                IndependentExercise.Content, IndependentExercise.CorrectAnswer,
                                IndependentExercise.AdditionalData, IndependentExercise.Points,
                                IndependentExercise.Hashtags, IndependentExercise.ID, UserName,
                                IndependentExercise.Title, DateTime.Now);
                            Context.Add(IndependentExerciseEntity);
                        }
                    }
                    else if (IndependentExercises.Count < 2)
                    {
                        foreach (var IndependentExercise in IndependentExercises)
                        {
                            Entities.IndependentExercise IndependentExerciseEntity =
                            new Entities.IndependentExercise(IndependentExercise.Type,
                                IndependentExercise.Content, IndependentExercise.CorrectAnswer,
                                IndependentExercise.AdditionalData, IndependentExercise.Points,
                                IndependentExercise.Hashtags, IndependentExercise.ID, UserName,
                                IndependentExercise.Title, DateTime.Now);
                            Context.Add(IndependentExerciseEntity);
                        }
                    }

                    await Context.SaveChangesAsync();
                    return View("EditExercise");
                }
            }
            catch
            {
                return View("EditExercise");
            }
        }

        [HttpGet]
        public string GetUserExercises()
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
                    var UserExercises = Context.IndependentExercises
                        .Where(IndependentExercise => IndependentExercise.Username == UserName)
                        .Select(IndependentExercise => new
                        {
                            ID = IndependentExercise.RelationalID,
                            Title = IndependentExercise.Title,
                            Type = IndependentExercise.ExerciseType,
                            IndependentExercise.Content,
                            IndependentExercise.Points,
                            IndependentExercise.Hashtags
                        }).ToList();


                    if (UserExercises != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(UserExercises,
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
        public async Task<string> DeleteExercises([FromBody] List<Guid> ExercisesIdentifiers)
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
                    var FoundExercises = Context.IndependentExercises
                        .Where(IndependentExercise => ExercisesIdentifiers.Contains((Guid)IndependentExercise.RelationalID) &&
                            IndependentExercise.Username == UserName);

                    Context.RemoveRange(FoundExercises);
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
        public string LoadExercisesWithGivenIdentifiers([FromBody] List<Guid> ExerciseIdentifiers)
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
                    var UserExercises = Context.IndependentExercises
                        .Where(IndependentExercise => ExerciseIdentifiers.Contains((Guid)IndependentExercise.RelationalID) &&
                            IndependentExercise.Username == UserName)
                        .Select(IndependentExercise => new
                        {
                            ID = IndependentExercise.RelationalID,
                            IndependentExercise.ExerciseType,
                            IndependentExercise.Content,
                            IndependentExercise.Points,
                            IndependentExercise.Hashtags,
                            IndependentExercise.AdditionalData,
                            IndependentExercise.CorrectAnswer
                        }).ToList();


                    if (UserExercises != null)
                    {
                        string JSONResult = JsonConvert.SerializeObject(UserExercises,
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
        public string LoadExercise([FromBody] Guid ID)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new ExercisePoolDbContext())
                {
                    var FoundExercise = Context.IndependentExercises
                        .Where(IndependentExercise => IndependentExercise.RelationalID == ID &&
                        IndependentExercise.Username == UserName)
                        .Select(IndependentExercise => new
                        {
                            IndependentExercise.Title,
                            IndependentExercise.ExerciseType,
                            IndependentExercise.Content,
                            IndependentExercise.CorrectAnswer,
                            IndependentExercise.AdditionalData,
                            IndependentExercise.Points,
                            IndependentExercise.Hashtags
                        })
                        .ToList();

                    string JSONResult = JsonConvert.SerializeObject(FoundExercise, Formatting.Indented,
                        new JsonSerializerSettings
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        }
                    );
                    return JSONResult;
                }
            }
            catch (Exception ex)
            {
                return ex.Message.ToString();
            }
        }
    }
}
