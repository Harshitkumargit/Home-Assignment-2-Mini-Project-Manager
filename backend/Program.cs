using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjectManagerAPI.Data;
using ProjectManagerAPI.DTOs;
using ProjectManagerAPI.Models;
using ProjectManagerAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure port for deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Project Manager API",
        Version = "v1",
        Description = "RESTful API for managing projects and tasks with JWT authentication"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add JWT Service as Scoped
builder.Services.AddScoped<JwtService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowedToAllowWildcardSubdomains()
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://*.vercel.app",
                "https://*.netlify.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Create database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project Manager API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ==================== AUTH ENDPOINTS ====================

// POST /api/auth/register
app.MapPost("/api/auth/register", async (RegisterDTO dto, AppDbContext db, JwtService jwtService) =>
{
    // Check if username exists
    if (await db.Users.AnyAsync(u => u.Username == dto.Username))
    {
        return Results.BadRequest(new { message = "Username already exists" });
    }

    // Check if email exists
    if (await db.Users.AnyAsync(u => u.Email == dto.Email))
    {
        return Results.BadRequest(new { message = "Email already exists" });
    }

    try
    {
        // Create new user
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);

        var response = new AuthResponseDTO
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };

        return Results.Created($"/api/users/{user.Id}", response);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Registration error: {ex.Message}");
        return Results.Problem("Registration failed", statusCode: 500);
    }
})
.WithName("Register")
.WithTags("Authentication")
.Produces<AuthResponseDTO>(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest);

// POST /api/auth/login
app.MapPost("/api/auth/login", async (LoginDTO dto, AppDbContext db, JwtService jwtService) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
    {
        return Results.Unauthorized();
    }

    var token = jwtService.GenerateToken(user);

    var response = new AuthResponseDTO
    {
        Token = token,
        Username = user.Username,
        Email = user.Email,
        UserId = user.Id
    };

    return Results.Ok(response);
})
.WithName("Login")
.WithTags("Authentication")
.Produces<AuthResponseDTO>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status401Unauthorized);

// ==================== PROJECT ENDPOINTS ====================

// GET /api/projects
app.MapGet("/api/projects", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var projects = await db.Projects
        .Where(p => p.UserId == userId)
        .Include(p => p.Tasks)
        .Select(p => new ProjectDTO
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            CreatedAt = p.CreatedAt,
            TaskCount = p.Tasks.Count,
            CompletedTaskCount = p.Tasks.Count(t => t.IsCompleted)
        })
        .ToListAsync();

    return Results.Ok(projects);
})
.RequireAuthorization()
.WithName("GetProjects")
.WithTags("Projects")
.Produces<List<ProjectDTO>>(StatusCodes.Status200OK);

// GET /api/projects/{id}
app.MapGet("/api/projects/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var project = await db.Projects
        .Where(p => p.Id == id && p.UserId == userId)
        .Include(p => p.Tasks)
        .Select(p => new ProjectDTO
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            CreatedAt = p.CreatedAt,
            TaskCount = p.Tasks.Count,
            CompletedTaskCount = p.Tasks.Count(t => t.IsCompleted)
        })
        .FirstOrDefaultAsync();

    if (project == null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    return Results.Ok(project);
})
.RequireAuthorization()
.WithName("GetProjectById")
.WithTags("Projects")
.Produces<ProjectDTO>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

// POST /api/projects
app.MapPost("/api/projects", async (CreateProjectDTO dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var project = new Project
    {
        Title = dto.Title,
        Description = dto.Description,
        UserId = userId
    };

    db.Projects.Add(project);
    await db.SaveChangesAsync();

    var projectDto = new ProjectDTO
    {
        Id = project.Id,
        Title = project.Title,
        Description = project.Description,
        CreatedAt = project.CreatedAt,
        TaskCount = 0,
        CompletedTaskCount = 0
    };

    return Results.Created($"/api/projects/{project.Id}", projectDto);
})
.RequireAuthorization()
.WithName("CreateProject")
.WithTags("Projects")
.Produces<ProjectDTO>(StatusCodes.Status201Created);

// PUT /api/projects/{id}
app.MapPut("/api/projects/{id:int}", async (int id, UpdateProjectDTO dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

    if (project == null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    project.Title = dto.Title;
    project.Description = dto.Description;

    await db.SaveChangesAsync();

    var projectDto = new ProjectDTO
    {
        Id = project.Id,
        Title = project.Title,
        Description = project.Description,
        CreatedAt = project.CreatedAt,
        TaskCount = project.Tasks.Count,
        CompletedTaskCount = project.Tasks.Count(t => t.IsCompleted)
    };

    return Results.Ok(projectDto);
})
.RequireAuthorization()
.WithName("UpdateProject")
.WithTags("Projects")
.Produces<ProjectDTO>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

// DELETE /api/projects/{id}
app.MapDelete("/api/projects/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

    if (project == null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    db.Projects.Remove(project);
    await db.SaveChangesAsync();

    return Results.NoContent();
})
.RequireAuthorization()
.WithName("DeleteProject")
.WithTags("Projects")
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status404NotFound);

// ==================== TASK ENDPOINTS ====================

// GET /api/projects/{projectId}/tasks
app.MapGet("/api/projects/{projectId:int}/tasks", async (int projectId, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
    if (project == null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    var tasks = await db.Tasks
        .Where(t => t.ProjectId == projectId)
        .Select(t => new TaskDTO
        {
            Id = t.Id,
            Title = t.Title,
            DueDate = t.DueDate,
            IsCompleted = t.IsCompleted,
            CreatedAt = t.CreatedAt,
            ProjectId = t.ProjectId
        })
        .ToListAsync();

    return Results.Ok(tasks);
})
.RequireAuthorization()
.WithName("GetTasks")
.WithTags("Tasks")
.Produces<List<TaskDTO>>(StatusCodes.Status200OK);

// POST /api/projects/{projectId}/tasks
app.MapPost("/api/projects/{projectId:int}/tasks", async (int projectId, CreateTaskDTO dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
    if (project == null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    var task = new ProjectTask
    {
        Title = dto.Title,
        DueDate = dto.DueDate,
        ProjectId = projectId
    };

    db.Tasks.Add(task);
    await db.SaveChangesAsync();

    var taskDto = new TaskDTO
    {
        Id = task.Id,
        Title = task.Title,
        DueDate = task.DueDate,
        IsCompleted = task.IsCompleted,
        CreatedAt = task.CreatedAt,
        ProjectId = task.ProjectId
    };

    return Results.Created($"/api/tasks/{task.Id}", taskDto);
})
.RequireAuthorization()
.WithName("CreateTask")
.WithTags("Tasks")
.Produces<TaskDTO>(StatusCodes.Status201Created);

// PUT /api/tasks/{id}
app.MapPut("/api/tasks/{id:int}", async (int id, UpdateTaskDTO dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var task = await db.Tasks
        .Include(t => t.Project)
        .FirstOrDefaultAsync(t => t.Id == id && t.Project.UserId == userId);

    if (task == null)
    {
        return Results.NotFound(new { message = "Task not found" });
    }

    task.Title = dto.Title;
    task.DueDate = dto.DueDate;
    task.IsCompleted = dto.IsCompleted;

    await db.SaveChangesAsync();

    var taskDto = new TaskDTO
    {
        Id = task.Id,
        Title = task.Title,
        DueDate = task.DueDate,
        IsCompleted = task.IsCompleted,
        CreatedAt = task.CreatedAt,
        ProjectId = task.ProjectId
    };

    return Results.Ok(taskDto);
})
.RequireAuthorization()
.WithName("UpdateTask")
.WithTags("Tasks")
.Produces<TaskDTO>(StatusCodes.Status200OK);

// PATCH /api/tasks/{id}/toggle
app.MapPatch("/api/tasks/{id:int}/toggle", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var task = await db.Tasks
        .Include(t => t.Project)
        .FirstOrDefaultAsync(t => t.Id == id && t.Project.UserId == userId);

    if (task == null)
    {
        return Results.NotFound(new { message = "Task not found" });
    }

    task.IsCompleted = !task.IsCompleted;
    await db.SaveChangesAsync();

    var taskDto = new TaskDTO
    {
        Id = task.Id,
        Title = task.Title,
        DueDate = task.DueDate,
        IsCompleted = task.IsCompleted,
        CreatedAt = task.CreatedAt,
        ProjectId = task.ProjectId
    };

    return Results.Ok(taskDto);
})
.RequireAuthorization()
.WithName("ToggleTask")
.WithTags("Tasks")
.Produces<TaskDTO>(StatusCodes.Status200OK);

// DELETE /api/tasks/{id}
app.MapDelete("/api/tasks/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var task = await db.Tasks
        .Include(t => t.Project)
        .FirstOrDefaultAsync(t => t.Id == id && t.Project.UserId == userId);

    if (task == null)
    {
        return Results.NotFound(new { message = "Task not found" });
    }

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();

    return Results.NoContent();
})
.RequireAuthorization()
.WithName("DeleteTask")
.WithTags("Tasks")
.Produces(StatusCodes.Status204NoContent);

// Health check
app.MapGet("/", () => Results.Ok(new
{
    message = "Project Manager API",
    version = "1.0.0",
    endpoints = new
    {
        swagger = "/swagger",
        auth = "/api/auth",
        projects = "/api/projects",
        tasks = "/api/projects/{projectId}/tasks"
    }
}));

Console.WriteLine("🚀 Project Manager API is running!");
Console.WriteLine($"📍 Swagger: http://localhost:{port}/swagger");

app.Run();
