using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using SchoolMatura.Models.CreateSetModels;
using System.Diagnostics;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class CreateSetController : Controller
    {
        public NewSetData? NewSet;

        private readonly IHttpContextAccessor HttpContextAccessor;

        public CreateSetController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        public IActionResult NewSetPage()
        {
            return View("NewSet");
        }
            
        [HttpPost]
        [Route("NewSet/CreateNewSet")]
        public async Task<IActionResult> CreateNewSet([FromBody] NewSetData NewSet)
        {
            try
            {
                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return View("NewSet");
                }

                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                using (var Context = new SetsDbContext())
                {
                    UserSet NewSetEntity = new UserSet(UserName, NewSet.Title, NewSet.Description, DateTime.Now);

                    foreach (var ViewModelExercise in NewSet.Exercises)
                    {
                        Entities.Exercise ExerciseEntity = new Entities.Exercise(ViewModelExercise.Type,
                            ViewModelExercise.MainOrder, ViewModelExercise.SubOrder, ViewModelExercise.Content,
                            ViewModelExercise.CorrectAnswer, ViewModelExercise.AdditionalData,
                            ViewModelExercise.Points, ViewModelExercise.Hashtags, NewSetEntity);
                        NewSetEntity.Exercises.Add(ExerciseEntity);
                    }

                    Context.Add(NewSetEntity);
                    Context.SaveChanges();
                }
            }
            catch
            {

            }

            return View("NewSet");
        }
    }
}
