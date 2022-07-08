using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Diagnostics;

namespace SchoolMatura.Classes
{
    public class PasswordRetrievalFunctions
    {
        static public void SendPasswordResetEmail(string ToEmail, string UniqueId)
        {
            var MailMessage = new MimeMessage();
            MailMessage.From.Add(MailboxAddress.Parse("it.quest.service@outlook.com"));
            MailMessage.To.Add(MailboxAddress.Parse(ToEmail));
            MailMessage.Subject = "Prośba zmiany hasła";

            var Builder = new BodyBuilder();
            Builder.HtmlBody = $"<h4>Szanowny Użytkowniku,</h4><br/><p>Link umożliwiający Ci ustawnie nowego hasła to: <a href=\"it-quest.com/Auth/NewPassword?id={UniqueId}\">it-quest.com/Auth/NewPassword?id={UniqueId}</a></p>";
            MailMessage.Body = Builder.ToMessageBody();
            Debug.WriteLine('a');

            using (var SMTPClient = new SmtpClient())
            {
                SMTPClient.Connect("smtp.office365.com", 587, SecureSocketOptions.StartTlsWhenAvailable);
                SMTPClient.Authenticate("it.quest.service@outlook.com", "ItQuest2004$");
                SMTPClient.Send(MailMessage);
                SMTPClient.Disconnect(true);
            }
        }
    }
}
