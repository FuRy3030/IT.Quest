using Newtonsoft.Json;
using System.Net;

namespace SchoolMatura.Models
{
    public class GoogleCaptchaConfig
    {
        public string? SiteKey { get; set; }
        public string? SecretKey { get; set; }
        public string? Version { get; set; }

        public static async Task<bool> VerifyToken(string SecretKey, string Token)
        {
            try
            {
                string URL = $"https://www.google.com/recaptcha/api/siteverify?secret={SecretKey}&response={Token}";

                using (var client = new HttpClient())
                {
                    var HttpResult = await client.GetAsync(URL);
                    if (HttpResult.StatusCode != HttpStatusCode.OK)
                    {
                        return false;
                    }

                    var Response = await HttpResult.Content.ReadAsStringAsync();
                    var CaptchaResult = JsonConvert.DeserializeObject<GoogleCaptchaResponse>(Response);
                    return CaptchaResult.Success && CaptchaResult.Score > 0.8;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
