using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GestaoColaboradores.Infrastructure.Data;
using GestaoColaboradores.API.Middleware; // O middleware de erros que criámos

var builder = WebApplication.CreateBuilder(args);

// 1. Contexto de Base de Dados (Sem o Identity)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configuração Limpa da Autenticação JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "chave_super_secreta_para_desenvolvimento_tcc_2026";
var key = Encoding.ASCII.GetBytes(secretKey);

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
        ValidateIssuer = false, // Em produção, mude para true
        ValidateAudience = false // Em produção, mude para true
    };
});

// Configuração de CORS para permitir que o React (Porta 5173) aceda à API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- INÍCIO DO BLOCO DE SEEDING ---
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Garante que a base de dados tem as tabelas criadas
    context.Database.Migrate();

    // Se a tabela de utilizadores estiver vazia, cria o primeiro Administrador
    if (!context.Usuarios.Any())
    {
        var senhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var admin = new GestaoColaboradores.Domain.Entities.Usuario(
            "Administrador Principal",
            "admin@empresa.com",
            senhaHash,
            "Admin"
        );

        context.Usuarios.Add(admin);
        context.SaveChanges();
    }
}
// --- FIM DO BLOCO DE SEEDING ---

// Interceta os erros do Domínio (DDD)
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact");

// Ordem estritamente obrigatória: Autenticação antes de Autorização
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();