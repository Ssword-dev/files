using System.Diagnostics.CodeAnalysis;

namespace Library.Commander;

/// <summary>
/// An object that defines the entrypoint to your programs.
/// basically i just wired up an argument parser + command lookup in
/// one "engine". basically minor abstractions, just lets you do
/// <code>myapp cmd subcommand subcommand2 -short --long</code>
/// or some other ways to do it depending on your parser. but thats what
/// the unix one does.
/// 
/// like you can think of this as giant tree of trees that can contain trees.
/// or if you want to go existential, an atom to electrons. it contains electrons or
/// in this case, trees. but the electrons itself are made of quarks and gluons...
/// </summary>
/// <typeparam name="P">
/// An argument parser that gives meaning to the argument values.
/// has `.Parse` method that returns an Invocation object
/// which is the semantic meaning of the arguments.
///
/// Basically like us, a bunch of atoms, give meaning to other atoms.
/// but less deep. because this is an existential thing...
/// </typeparam>
public abstract class CommanderProgram<P> where P : ArgumentParserBase, new()

{
    internal readonly Dictionary<string, Command> _commands;
    public CommanderProgram()
    {
        _commands = [];
    }

    public abstract void Init(CommanderProgram<P> program);
    public void InitAll(List<Command> commands)
    {
        Stack<Command> stack = new();

        foreach (var command in commands)
        {
            stack.Push(command);
        }

        while (true)
        {
            if (!stack.TryPop(out var command))
            {
                return;
            }

            command.Init(command);

            foreach (var subcommand in command.subcommands.Values)
            {
                stack.Push(subcommand);
            }
        }
    }

    public CommanderProgram<P> AddCommand<T>(string name) where T : Command, new()
    {
        _commands[name] = new T();
        return this;
    }

    public abstract Command DefaultCommand();

    public Tuple<int, Command?> Lookup(RawInvocation invocation)
    {
        int depth = 0;

        // this is not harmful.
        Dictionary<string, Command> lookupTable = _commands;
        Command? current = null;

        foreach (var k in invocation.InvocationArguments)
        {
            if (!lookupTable.TryGetValue(k, out var command))
            {
                return Tuple.Create(depth, current);
            }

            current = command;
            lookupTable = command.subcommands;
            depth++;
        }

        return Tuple.Create(depth, current);
    }

    public async Task Invoke(string[] argv)
    {
        Init(this);
        InitAll(_commands.Values.ToList());

        var rawInvocationArguments = Environment.GetCommandLineArgs();
        var applicationInvocationPath = rawInvocationArguments[0];

        var rawCommandInvocation = new RawInvocation(applicationInvocationPath, argv);
        var (depth, command) = Lookup(rawCommandInvocation);

        var parser = new P();


        Console.WriteLine($"args: {string.Join(" ", argv)}");
        Console.WriteLine($"matched depth: {depth}, command: {command?.GetType().Name ?? "none"}");

        if (command is null)
        {
            var defaultCommandInvocation = parser.Parse(applicationInvocationPath, argv);
            await DefaultCommand().Invoke(defaultCommandInvocation);
            return;
        }

        var remainingArgs = argv.Skip(depth).ToArray();

        var parsed = parser.Parse(applicationInvocationPath, remainingArgs);
        await command.Invoke(parsed);
    }
}

/// <summary>
/// This is the atomic unit of your program.
/// controls what to do, and groups subcommands (if any).
/// </summary>
public abstract class Command
{
    internal readonly Dictionary<string, Command> subcommands;
    public Command()
    {
        subcommands = [];
    }

    public Command AddSubCommand<T>(
        string name
        ) where T : Command, new()
    {
        subcommands[name] = new T();
        return this;
    }

    public abstract Task Main(Invocation invocation);
    public virtual void Init(Command command) { }
    public async Task Invoke(Invocation invocation)
    {
        Init(this);
        await Main(invocation);
    }
}
