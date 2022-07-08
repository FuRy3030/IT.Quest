using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using SchoolMatura.Models.CreateSetModels;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class EditSetController : Controller
    {
        public class SetTitleObject
        {
            public string Title { get; set; }
        }

        public class EditSetData
        {
            public string Title { get; set; }
            public List<Models.CreateSetModels.Exercise> Exercises { get; set; }
        }

        private readonly IHttpContextAccessor HttpContextAccessor;

        public EditSetController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        [ActivatorUtilitiesConstructor]
        public IActionResult Edit()
        {
            return View();
        }

        [HttpPost]
        public string LoadQuestionsList([FromBody] SetTitleObject TitleObject)
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
                    UserSet FoundSet = Context.Sets
                        .Where(Set => Set.Title == TitleObject.Title && Set.Username == UserName)
                        .Include(Set => Set.Exercises)
                        .FirstOrDefault();

                    FoundSet.Exercises = FoundSet.Exercises.ToList();

                    string JSONResult = JsonConvert.SerializeObject(FoundSet, Formatting.Indented,
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

        [HttpPost]
        public async Task<string> LoadNewData([FromBody] EditSetData EditData)
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
                    UserSet FoundSet = Context.Sets
                        .Where(Set => Set.Title == EditData.Title && Set.Username == UserName)
                        .Include(Set => Set.Exercises)
                        .FirstOrDefault();

                    if (FoundSet != null)
                    {
                        List<Entities.Exercise> Exercises = new List<Entities.Exercise>();
                        foreach (var ViewModelExercise in EditData.Exercises)
                        {
                            Entities.Exercise ExerciseEntity = new Entities.Exercise(ViewModelExercise.Type,
                                ViewModelExercise.MainOrder, ViewModelExercise.SubOrder, ViewModelExercise.Content,
                                ViewModelExercise.CorrectAnswer, ViewModelExercise.AdditionalData,
                                ViewModelExercise.Points, ViewModelExercise.Hashtags, FoundSet);
                            Exercises.Add(ExerciseEntity);
                        }
                       
                        FoundSet.Exercises = Exercises;
                        await Context.SaveChangesAsync();
                        return "Success";
                    }
                }
                return "Error";
            }
            catch (Exception ex)
            {
                return ex.Message.ToString();
            }
        }
    }
}
