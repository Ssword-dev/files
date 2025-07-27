// Disables unused parameter warning (used in CompleteAsync null implementation)
#pragma warning disable IDE0060
namespace Backend.ProgramModules.Middlewares;

/// <summary>
/// A light abstraction for request middlewares.
/// use with <code>app.UseMiddleware()</code>
/// </summary>
public abstract class RequestMiddleware
{
    public abstract Task HandleAsync(HttpContext context, RequestDelegate next);
    public abstract Task HandleExceptionAsync(HttpContext context, RequestDelegate next, Exception exception);
    public virtual async Task CompleteAsync(HttpContext context, RequestDelegate next, Exception? exception)
    {
        await Task.CompletedTask; // No-op
    }
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        Exception? anyException = null;
        try
        {
            await HandleAsync(context, next);
        }

        catch (Exception e)
        {
            anyException = e;
            await HandleExceptionAsync(context, next, e);
        }

        finally
        {
            await CompleteAsync(context, next, anyException);
        }
    }
}
