using System;
using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Domain.Entities;

public class Ticket
{
    public Guid Id { get; private set; }
    public TipoTicket Tipo { get; private set; }
    public StatusTicket Status { get; private set; }
    public decimal? ValorSolicitado { get; private set; }
    public DateTime DataSolicitacao { get; private set; }

    public string UsuarioId { get; private set; } = string.Empty;
    public Usuario Usuario { get; private set; } = null!;

    // Construtor vazio para o Entity Framework
    protected Ticket() { }

    public Ticket(TipoTicket tipo, string usuarioId, decimal? valorSolicitado = null)
    {
        Id = Guid.NewGuid();
        Tipo = tipo;
        Status = StatusTicket.Pendente;
        DataSolicitacao = DateTime.UtcNow;
        UsuarioId = usuarioId;
        ValorSolicitado = valorSolicitado;
    }

    public void Aprovar() => Status = StatusTicket.Aprovado;
    public void Recusar() => Status = StatusTicket.Recusado;
}