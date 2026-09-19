using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace GestaoColaboradores.Domain.Entities;

public class Usuario : IdentityUser
{
    public string NomeCompleto { get; set; } = string.Empty;

    // Propriedade de navegação
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}