namespace Backend.ProgramModules.Middlewares;

public class LoggerMiddleware() : RequestMiddleware, IDisposable
{
    private readonly StreamWriter logWriter = new("logs.txt", append: true);

    public override async Task HandleAsync(HttpContext context, RequestDelegate next)
    {
        await logWriter.WriteLineAsync($"[{DateTime.Now}] Request: {context.Request.Path}");
        await next(context);
    }

    public override Task HandleExceptionAsync(HttpContext context, RequestDelegate next, Exception exception)
    {
        return logWriter.WriteLineAsync($"[{DateTime.Now}] Error: {exception.Message}");
    }

    public override async Task CompleteAsync(HttpContext context, RequestDelegate next, Exception? exception)
    {
        await logWriter.FlushAsync(); // optional, force flush
    }

    public void Dispose()
    {
        logWriter?.Dispose(); // closes the file handle
        GC.SuppressFinalize(this);
    }
}
