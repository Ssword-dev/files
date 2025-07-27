#pragma warning disable CA1822
using Backend.Database; // For database contexts.
using Backend.ProgramModules.Middlewares;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Backend.ProgramModules; // Program

/// <summary>
/// <code>Program.cs</code>
/// but OOP style...
/// literally... it just
/// allows me to break it into steps.
/// </summary>
sealed class Entrypoint
{
    /// <summary>
    /// Configures the web application builder (does not mutate any state)
    /// </summary>
    /// <param name="builder">
    /// The dependancy injected builder.
    /// (it is dependancy injected because this is impure enough. and i do not want to debug
    /// for 10 more hours trying to make this a class instance state... which may include
    /// late field assignments)
    /// </param>
    public void ConfigureBuilder(WebApplicationBuilder builder)
    {
        // register controller services
        builder.Services.AddControllers();
        builder.Services.AddCors(opts => opts.AddPolicy("AllowFrontendConnection", pol => pol.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

        builder.Services.AddDbContext<QuizAppDatabaseContext>(options =>
        {
            options.UseMySql(
                builder.Configuration.GetConnectionString("DefaultConnection"),
                ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
            );
        });

        builder.Services.AddEndpointsApiExplorer();
    }

    /// <summary>
    /// Builds a web application from a given builder 
    /// </summary>
    /// <param name="builder">The builder to build an app for. (again, dependancy injected.)</param>
    /// <returns>The built app</returns>
    public WebApplication BuildApplication(WebApplicationBuilder builder)
    {
        return builder.Build();
    }

    /// <summary>
    /// Sets up middlewares for the server.
    /// Note: Currently only logging is used.
    /// </summary>
    /// <param name="app">The dependancy injected app.</param>
    public void SetupMiddlewares(WebApplication app)
    {
        // app.UseMiddleware<LoggerMiddleware>();
        app.Use(async (context, next) =>
        {
            Console.WriteLine($"[{DateTime.Now}] {context.Request.Method} {context.Request.GetEncodedUrl()}");
            await next(context);
        });
    }

    /// <summary>
    /// Configures aplication.
    /// sets up CORS policies (Cross Origin Resource Sharing)
    /// which is when the browser says cannot do a fetch request because of
    /// CORS policies or whatever.
    /// </summary>
    /// <param name="app"></param>
    public void ConfigureApplication(WebApplication app)
    {
        app.UseCors("AllowFrontendConnection");
    }

    /// <summary>
    /// Maps the controllers (which is api routes but MVC framework related)
    /// </summary>
    /// <param name="app">
    /// The web application (dependancy injected because will add
    /// more impurity to the function.
    /// (it is already impure enough under the hood.)
    /// </param>
    public void MapControllers(WebApplication app)
    {
        // map controller routes
        app.MapControllers();
    }

    /// <summary>
    /// The real thing that runs the program itself.
    /// This creates the builder, calls the ConfigureBuilder method,
    /// sets up the middlewares via SetupMiddleware,
    /// does some argument processing (mainly to get the argv_1 which is a url)
    /// to get the argv_1 which is a url that the server will be hosted into
    /// (note: the default is 0.0.0.0 which is the "all ip" ip address)
    /// on port 4006 (not random, 4006 is close to 4000 which is convinient for me
    /// because i usually build servers in port 4000 or somewhere between
    /// 4000 and 5000)
    /// </summary>
    public async Task Run()
    {
        var builder = WebApplication.CreateBuilder();
        ConfigureBuilder(builder);

        var app = BuildApplication(builder);

        // Configures the application itself
        ConfigureApplication(app);

        // Setups middlewares... preferably logging
        SetupMiddlewares(app);
        MapControllers(app);

        var argv = Environment.GetCommandLineArgs();
        string addr = "http://0.0.0.0:4006";

        if (argv.Length > 1)
        {
            addr = argv[1];
        }

        await app.RunAsync(addr);
    }
}
