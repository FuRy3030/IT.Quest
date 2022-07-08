using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SchoolMatura.Contexts;
using SchoolMatura.Entities;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SchoolMatura.Controllers
{
    [Authorize]
    public class SetOverviewController : Controller
    {
        public class SetTitleObject
        {
            public string Title { get; set; }
        }

        public class NewTitleObject
        {
            public string NewTitle { get; set; }
            public string OldTitle { get; set; }
        }

        public class NewDescriptionObject
        {
            public string SetTitle { get; set; }
            public string NewDescription { get; set; }
        }

        public class SessionObject
        {
            public string SetTitle { get; set; }
            public string SessionName { get; set; }
            public DateTime SessionStartDate { get; set; }
            public DateTime SessionEndDate { get; set; }
        }

        private readonly IHttpContextAccessor HttpContextAccessor;

        public SetOverviewController(IHttpContextAccessor httpContextAccessor)
        {
            HttpContextAccessor = httpContextAccessor;
        }

        [ActivatorUtilitiesConstructor]
        public IActionResult Overview()
        {
            return View();
        }

        [HttpPost]
        public string LoadGivenSet([FromBody] SetTitleObject TitleObject)
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
                        .Include(Set => Set.Exercises)
                        .Include(Set => Set.Sessions)
                        .ThenInclude(Session => Session.TestTakers)
                        .Where(Set => Set.Title == TitleObject.Title && Set.Username == UserName)
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

        [HttpGet]
        public string LoadConfigElements()
        {
            try
            {
                IConfigurationRoot Configuration = new ConfigurationBuilder()
                   .SetBasePath(Directory.GetCurrentDirectory())
                   .AddJsonFile("appsettings.json")
                   .Build();
                string Hostname = Configuration.GetSection("Hostname").Value.ToString();
                string Protocol = Configuration.GetSection("Protocol").Value.ToString();

                return Protocol + Hostname;
            }
            catch
            {
                return "Error";
            }
        }

            //[HttpPost]
            //public string LoadSessions([FromBody] SetTitleObject TitleObject)
            //{
            //    try
            //    {
            //        if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
            //        {
            //            return "";
            //        }

            //        string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

            //        using (var Context = new SetsDbContext())
            //        {
            //            Context.ChangeTracker.LazyLoadingEnabled = false;
            //            UserSet FoundSet = Context.Sets
            //                .Where(Set => Set.Title == TitleObject.Title && Set.Username == UserName)
            //                .FirstOrDefault();

            //            var Sessions = Context.Sessions
            //                .Where(Session => Session.SetId == FoundSet.SetId);

            //            string JSONResult = JsonConvert.SerializeObject(Sessions, Formatting.Indented,
            //                new JsonSerializerSettings
            //                {
            //                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            //                }
            //            );
            //            return JSONResult;
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        return ex.Message.ToString();
            //    }
            //}

        [HttpPost]
        public async Task<string> UpdateTitle([FromBody] NewTitleObject NewTitleObject)
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
                        .Where(Set => Set.Title == NewTitleObject.NewTitle && Set.Username == UserName)
                        .FirstOrDefault();

                    if (FoundSet == null)
                    {
                        UserSet CurrentSet = Context.Sets
                            .Where(Set => Set.Title == NewTitleObject.OldTitle && Set.Username == UserName)
                            .FirstOrDefault();

                        if (CurrentSet != null)
                        {
                            CurrentSet.Title = NewTitleObject.NewTitle;
                            await Context.SaveChangesAsync();
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

        [HttpPost]
        public async Task<string> UpdateDescription([FromBody] NewDescriptionObject NewDescriptionObject)
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
                        .Where(Set => Set.Title == NewDescriptionObject.SetTitle && Set.Username == UserName)
                        .FirstOrDefault();

                    if (FoundSet != null)
                    {
                        FoundSet.Description = NewDescriptionObject.NewDescription;
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
        public async Task<string> AddNewSession([FromBody] SessionObject SessionObject)
        {
            try
            {
                SessionObject.SessionStartDate = SessionObject.SessionStartDate.AddHours(2);
                SessionObject.SessionEndDate = SessionObject.SessionEndDate.AddHours(2);

                if (HttpContextAccessor.HttpContext.User.Identity.Name == null)
                {
                    return "";
                }
                string UserName = HttpContextAccessor.HttpContext.User.Identity.Name;

                if (DateTime.Compare(SessionObject.SessionEndDate, DateTime.Now) <= 0)
                {
                    return "WrongDate";
                }

                if (DateTime.Compare(SessionObject.SessionStartDate, SessionObject.SessionEndDate) > 0)
                {
                    return "WrongDateRelation";
                }

                using (var Context = new SetsDbContext())
                {
                    UserSet FoundSet = Context.Sets
                       .Where(Set => Set.Title == SessionObject.SetTitle && Set.Username == UserName)
                       .Include(Set => Set.Sessions)
                       .FirstOrDefault();

                    if (FoundSet != null)
                    {
                        if (FoundSet.Sessions.Count > 0)
                        {
                            var MatchingSession = FoundSet.Sessions
                                .Where(Session => Session.SessionName == SessionObject.SessionName &&
                                DateTime.Compare(Session.ExpirationTime, SessionObject.SessionEndDate) == 0)
                                .FirstOrDefault();
                            if (MatchingSession != null)
                            {
                                return "SessionExists";
                            }
                        }

                        Session NewSession = new Session(Guid.NewGuid(), SessionObject.SessionEndDate,
                            SessionObject.SessionStartDate, SessionObject.SessionName);
                        FoundSet.Sessions.Add(NewSession);

                        await Context.SaveChangesAsync();
                        return "Success";
                    }
                }
                return "Error";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}
