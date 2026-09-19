using GestaoColaboradores.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<Usuario>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Ticket> Tickets { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Ticket>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.ValorSolicitado).HasPrecision(18, 2);

            entity.HasOne(t => t.Usuario)
                  .WithMany(u => u.Tickets)
                  .HasForeignKey(t => t.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}