using System;

namespace GestaoColaboradores.Domain.Entities
{
    public class Usuario
    {
        public string Id { get; private set; } = null!;
        public string NomeCompleto { get; private set; } = null!;
        public string Email { get; private set; } = null!;
        public string SenhaHash { get; private set; } = null!;
        public string Role { get; private set; } = null!; // "Admin" ou "Colaborador"

        protected Usuario() { }

        public Usuario(string nomeCompleto, string email, string senhaHash, string role)
        {
            if (string.IsNullOrWhiteSpace(nomeCompleto) || string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Nome e E-mail são obrigatórios.");

            Id = Guid.NewGuid().ToString();
            NomeCompleto = nomeCompleto;
            Email = email.ToLower();
            SenhaHash = senhaHash;
            Role = role;
        }

        public void AtualizarDados(string nomeCompleto, string email, string role)
        {
            if (string.IsNullOrWhiteSpace(nomeCompleto) || string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Nome e E-mail são obrigatórios.");

            NomeCompleto = nomeCompleto;
            Email = email.ToLower();
            Role = role;
        }
    }
}