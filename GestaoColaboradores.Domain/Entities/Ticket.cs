using System;
using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Domain.Entities
{
    public class Ticket
    {
        public Guid Id { get; private set; }
        public string UsuarioId { get; private set; } = null!;

        // Adicione esta linha para o Entity Framework conseguir fazer o mapeamento
        public Usuario Usuario { get; private set; } = null!;

        public TipoTicket Tipo { get; private set; }
        public decimal? ValorSolicitado { get; private set; }
        public StatusTicket Status { get; private set; }
        public DateTime DataSolicitacao { get; private set; }

        // Construtor protegido exigido pelo Entity Framework Core
        protected Ticket() { }

        // Construtor principal com as validações de domínio
        public Ticket(string usuarioId, TipoTicket tipo, decimal? valorSolicitado)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
                throw new ArgumentException("O ID do colaborador é obrigatório.");

            // Altere "AdiantamentoSalarial" para o nome exato que estiver no seu ficheiro TipoTicket.cs
            if (tipo == TipoTicket.AdiantamentoSalarial && (valorSolicitado == null || valorSolicitado <= 0))
                throw new ArgumentException("O valor do adiantamento salarial deve ser estritamente superior a zero.");

            if (tipo == TipoTicket.Ferias && valorSolicitado.HasValue && valorSolicitado > 0)
                throw new ArgumentException("Os pedidos de férias não devem incluir valores financeiros.");

            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            Tipo = tipo;
            ValorSolicitado = valorSolicitado;
            Status = StatusTicket.Pendente;
            DataSolicitacao = DateTime.UtcNow;
        }

        public void Aprovar()
        {
            if (Status != StatusTicket.Pendente)
                throw new InvalidOperationException("Apenas os pedidos pendentes podem ser aprovados.");

            Status = StatusTicket.Aprovado;
        }

        public void Recusar()
        {
            if (Status != StatusTicket.Pendente)
                throw new InvalidOperationException("Apenas os pedidos pendentes podem ser recusados.");

            Status = StatusTicket.Recusado;
        }
    }
}