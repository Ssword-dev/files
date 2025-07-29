namespace Backend.ProgramModules;

class CommanderProgram
{
    private readonly Dictionary<string, Command> _commands;
    public CommanderProgram()
    {
        _commands = [];
    }

    public Tuple<int, Command?> Lookup(string[] argv)
    {
        int depth = 0;
        Dictionary<string, Command> lookupTable = _commands;
        Command? current = null;

        foreach (var k in argv.Skip(1))
        {
            Command? command = lookupTable.GetValueOrDefault<string, Command?>(k, null);

            if (command is null)
            {
                return (depth, current);
            }

            current = command;
            lookupTable = command.subcommands;
        }
    }

    public async Task Main(string[] argv)
    {

    }
}
abstract class Command
{
    internal readonly Dictionary<string, Command> subcommands;
    public Command()
    {
        subcommands = [];
    }

    public abstract Task Main(string[] argv);
}
