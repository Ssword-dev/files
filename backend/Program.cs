using Backend.ProgramModules;

sealed class Program
{
    public static async Task Main(string[] argv)
    {
        var entry = new Entrypoint();
        await entry.Invoke(argv);
    }
}
