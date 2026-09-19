using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace GestaoColaboradores.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Tenta executar a requisição normalmente
                await _next(context);
            }
            catch (Exception ex)
            {
                // Se a entidade disparar um throw new ArgumentException, o fluxo cai aqui
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            // Define o código HTTP 400 para erros de validação da nossa regra de negócio
            context.Response.StatusCode = exception switch
            {
                ArgumentException => StatusCodes.Status400BadRequest,
                InvalidOperationException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError // Mantém 500 para erros desconhecidos
            };

            // Formata a mensagem de erro para o React consumir facilmente
            var result = JsonSerializer.Serialize(new { mensagem = exception.Message });
            return context.Response.WriteAsync(result);
        }
    }
}