using Microsoft.EntityFrameworkCore;
using GestaoColaboradores.Domain.Entities;

namespace GestaoColaboradores.Infrastructure.Data
{
    // Alterado de IdentityDbContext para DbContext padrão
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapeamento da relação entre o Utilizador e os seus Tickets
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Usuario)
                .WithMany()
                .HasForeignKey(t => t.UsuarioId)
                .IsRequired();
        }
    }
}