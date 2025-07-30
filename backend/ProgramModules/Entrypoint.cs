#pragma warning disable CA1822
using Library.Commander;
using System.Text.Json; // custom dyi library for multi command.
namespace Backend.ProgramModules; // Program

sealed class HwToolCommand : Command
{
    public override Task Main(Invocation invocation)
    {
        Console.WriteLine(
            JsonSerializer.Serialize(invocation)
        );
        return Task.CompletedTask;
    }
}

sealed class ToolCommandGroup : Command
{
    public override void Init(Command command)
    {
        command.AddSubCommand<HwToolCommand>("hw");
        base.Init(command);
    }

    public override async Task Main(Invocation invocation)
    {
        await Task.CompletedTask;
    }
}

/// <summary>
/// <code>Program.cs</code>
/// but OOP style...
/// literally... it just
/// allows me to break it into steps.
/// </summary>
sealed class Entrypoint : CommanderProgram<UnixParser>
{
    public override void Init(CommanderProgram<UnixParser> program)
    {
        program.AddCommand<ServeCommand>("serve");
        program.AddCommand<ToolCommandGroup>("tool");
    }

    public override Command DefaultCommand()
    {
        return new ServeCommand(); // Serve
    }
}
