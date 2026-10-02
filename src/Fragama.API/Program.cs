using System;
using System.Text;
using System.Threading.RateLimiting;
using Fragama.Application.Common;
using Fragama.Application.Interfaces;
using Fragama.Application.Services;
using Fragama.Domain.Enums;
using Fragama.Domain.Interfaces;
using Fragama.Infrastructure.Data;
using Fragama.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Logging estructurado de alto rendimiento con Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Base de Datos SQL Server con EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost,1433;Database=FragamaWarehouseDb;User Id=sa;Password=FragamaStrongPassword2026!;TrustServerCertificate=True;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null);
        sqlOptions.MigrationsAssembly("Fragama.Infrastructure");
    });
});

// 3. Inyección de Dependencias (IoC / Clean Architecture)
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IProductService, BarcodeService>();
builder.Services.AddScoped<IDispatchService, DispatchService>();

// 4. Autenticación JWT y Políticas de Roles (RBAC)
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "FragamaSuperSecretProductionKey2026!MustBeVeryLongAndSecure#";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "FragamaAuthService",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "FragamaWarehouseClients",
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole(RolesConstant.Administrador));
    options.AddPolicy("RequireWarehouse", policy => policy.RequireRole(RolesConstant.Administrador, RolesConstant.Bodeguero));
    options.AddPolicy("RequireDriver", policy => policy.RequireRole(RolesConstant.Chofer, RolesConstant.Administrador));
});

// 5. Rate Limiting (Mitigación OWASP contra ataques de fuerza bruta)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth-limiter", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

// 6. Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5000", "http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 7. Swagger / OpenAPI con soporte para Token Bearer
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Distribuidora Fragama - API de Gestión de Inventarios y Bodega",
        Version = "v1",
        Description = "API REST corporativa para control multi-categoría de stock, Kardex transaccional, facturación y despacho móvil para choferes."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header utilizando el esquema Bearer. Ejemplo: \"Authorization: Bearer {token}\"",
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

var app = builder.Build();

// 8. Pipeline HTTP y Middlewares de Seguridad OWASP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fragama API v1"));
}

// Headers de seguridad HTTP (OWASP)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;");
    await next();
});

// Manejo global de excepciones
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        var statusCode = exception switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            InsufficientStockException => StatusCodes.Status409Conflict,
            BusinessRuleException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.StatusCode = statusCode;
        var response = ApiResponse<string>.Fail(
            exception?.Message ?? "Ha ocurrido un error inesperado en el servidor.",
            new List<string> { exception?.GetType().Name ?? "Exception" }
        );

        await context.Response.WriteAsJsonAsync(response);
    });
});

app.UseSerilogRequestLogging();
app.UseCors("AllowFrontendApp");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Soporte para servir la interfaz web (SPA / Frontend) directamente desde la API en Visual Studio
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

// Fallback para SPA si no es una ruta API
app.MapFallbackToFile("index.html");

app.Run();
