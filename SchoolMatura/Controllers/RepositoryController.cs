using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using System.Diagnostics;
using System.Text.Json;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class RepositoryController : Controller
    {
        public class SetTitleObject
        {
            public string Title { get; set; }
        }

        private readonly IHttpContextAccessor HttpContextAccessor;

        public RepositoryController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        [ActivatorUtilitiesConstructor]
        public IActionResult UserRepository()
        {
            return View();
        }

        [HttpGet]
        public string LoadUserSets()
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
                    var UserSets = Context.Sets
                        .Where(Set => Set.Username == UserName)
                        .Select(Set => Set.Title)
                        .ToList();
                    var JSONResult = JsonSerializer.Serialize(UserSets);
                    return JSONResult;
                }
            }
            catch
            {
                return "";
            }
        }

        [HttpPost]
        public async Task<IActionResult> RemoveSet([FromBody] SetTitleObject SetTitle)
        {
            try
            {
                using (var Context = new SetsDbContext())
                {
                    UserSet FoundSet = Context.Sets.Where(Set => Set.Title == SetTitle.Title).FirstOrDefault();
                    if (FoundSet != null)
                    {
                        Context.Remove(FoundSet);
                        await Context.SaveChangesAsync();
                    }
                }
            }
            catch
            {

            }

            return View("UserRepository");
        }
    }
}
