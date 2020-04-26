using System.ComponentModel.DataAnnotations;

namespace Dairy.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}