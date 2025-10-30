using System.ComponentModel.DataAnnotations;

namespace ProjectManagerAPI.Models;

public class ProjectTask
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public bool IsCompleted { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
