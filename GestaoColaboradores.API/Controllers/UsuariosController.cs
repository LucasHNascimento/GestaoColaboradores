using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Infrastructure.Data;
using BCrypt.Net;

namespace GestaoColaboradores.API.Controllers
{
    public class CriarUsuarioDto
    {
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Role { get; set; } = "Colaborador"; // Padrão
    }

    public class AtualizarUsuarioDto
    {
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Toda a gestão de utilizadores é restrita à administração
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new { u.Id, u.NomeCompleto, u.Email, u.Role })
                .ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] CriarUsuarioDto dto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email.ToLower()))
                return BadRequest(new { mensagem = "Já existe um utilizador com este e-mail." });

            var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

            var novoUsuario = new Usuario(dto.NomeCompleto, dto.Email, senhaHash, dto.Role);

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Utilizador criado com sucesso.", id = novoUsuario.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarUsuario(string id, [FromBody] AtualizarUsuarioDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensagem = "Utilizador não encontrado." });

            // Valida se o novo email já pertence a outro utilizador
            if (usuario.Email != dto.Email.ToLower() && await _context.Usuarios.AnyAsync(u => u.Email == dto.Email.ToLower()))
                return BadRequest(new { mensagem = "O novo e-mail já está em utilização." });

            usuario.AtualizarDados(dto.NomeCompleto, dto.Email, dto.Role);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Dados atualizados com sucesso." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(string id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensagem = "Utilizador não encontrado." });

            // Opcional: Impedir que o administrador se apague a si próprio
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (id == currentUserId)
                return BadRequest(new { mensagem = "Não pode eliminar a sua própria conta." });

            // Verifica se o utilizador tem tickets pendentes ou histórico
            var temTickets = await _context.Tickets.AnyAsync(t => t.UsuarioId == id);
            if (temTickets)
                return BadRequest(new { mensagem = "Não é possível eliminar um utilizador com histórico de pedidos associado." });

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Conta eliminada permanentemente." });
        }
    }
}