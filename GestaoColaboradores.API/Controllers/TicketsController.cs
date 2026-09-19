using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Domain.Enums;
using GestaoColaboradores.Infrastructure.Data;

namespace GestaoColaboradores.API.Controllers;

public class SolicitacaoTicketDto
{
    public TipoTicket Tipo { get; set; }
    public decimal? Valor { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _context;

    // Injeção de dependência do banco de dados
    public TicketsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("todos")]
    public async Task<IActionResult> ListarTodosTickets()
    {
        // Traz todos os tickets e inclui os dados básicos do usuário que solicitou
        var tickets = await _context.Tickets
            .Include(t => t.Usuario)
            .Select(t => new
            {
                t.Id,
                t.Tipo,
                t.Status,
                t.ValorSolicitado,
                t.DataSolicitacao,
                Colaborador = t.Usuario.NomeCompleto,
                Email = t.Usuario.Email
            })
            .ToListAsync();

        return Ok(tickets);
    }

    [Authorize]
    [HttpPost("solicitar")]
    public async Task<IActionResult> SolicitarTicket([FromBody] SolicitacaoTicketDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // Validação de regra de negócio básica
        if (dto.Tipo == TipoTicket.AdiantamentoSalarial && (dto.Valor == null || dto.Valor <= 0))
            return BadRequest("Para adiantamento salarial, o valor deve ser maior que zero.");

        var ticket = new Ticket(dto.Tipo, userId, dto.Valor);

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync(); // Efetiva a gravação no PostgreSQL

        return Ok(new { Mensagem = "Ticket registrado com sucesso!", TicketId = ticket.Id });
    }

    [Authorize]
    [HttpGet("meus-tickets")]
    public async Task<IActionResult> ListarMeusTickets()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Filtra estritamente pelo ID do usuário logado no token JWT
        var tickets = await _context.Tickets
            .Where(t => t.UsuarioId == userId)
            .OrderByDescending(t => t.DataSolicitacao)
            .ToListAsync();

        return Ok(tickets);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/aprovar")]
    public async Task<IActionResult> AprovarTicket(Guid id)
    {
        var ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
            return NotFound("Ticket não encontrado.");

        if (ticket.Status != StatusTicket.Pendente)
            return BadRequest("Apenas tickets pendentes podem ser aprovados.");

        ticket.Aprovar(); // Executa a regra de negócio da entidade
        await _context.SaveChangesAsync();

        return Ok(new { Mensagem = "Ticket aprovado com sucesso!", StatusAtual = ticket.Status.ToString() });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/recusar")]
    public async Task<IActionResult> RecusarTicket(Guid id)
    {
        var ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
            return NotFound("Ticket não encontrado.");

        if (ticket.Status != StatusTicket.Pendente)
            return BadRequest("Apenas tickets pendentes podem ser recusados.");

        ticket.Recusar(); // Executa a regra de negócio da entidade
        await _context.SaveChangesAsync();

        return Ok(new { Mensagem = "Ticket recusado.", StatusAtual = ticket.Status.ToString() });
    }

    // Retorna todos os tickets do banco, independentemente do usuário
    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        // Se o seu contexto de banco de dados tiver um nome diferente de _context, ajuste aqui
        var tickets = await _context.Tickets.ToListAsync();
        return Ok(tickets);
    }

    // Recebe o comando do botão "Aprovar" no React
    [HttpPut("{id}/aprovar")]
    public async Task<IActionResult> Aprovar(Guid id) // Troque Guid por int se o seu ID for numérico
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound("Ticket não encontrado.");

        ticket.Aprovar(); // Executa a regra de domínio criada na entidade
        await _context.SaveChangesAsync();

        return Ok();
    }

    // Recebe o comando do botão "Recusar" no React
    [HttpPut("{id}/recusar")]
    public async Task<IActionResult> Recusar(Guid id) // Troque Guid por int se o seu ID for numérico
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound("Ticket não encontrado.");

        ticket.Recusar(); // Executa a regra de domínio criada na entidade
        await _context.SaveChangesAsync();

        return Ok();
    }
}