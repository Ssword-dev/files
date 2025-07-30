using System.Data;
using System.Text.Json;
using Library.Commander;
using MySqlConnector;

class DatabaseSaveTool : Command
{
    public override async Task Main(Invocation invocation)
    {
        var console = new ConsoleLibrary(lineTerminator: ConsoleKey.Enter);
        string password = "";
        string host = "localhost";
        string user = "root";

        if (invocation.InvocationOptions.GetValueOrDefault("p", false))
        {
            password = console.ReadLineSecure();
        }

        if (!invocation.InvocationOptions.TryGetValue("d", out var db) ||
            !invocation.InvocationOptions.TryGetValue("t", out var table) ||
            !invocation.InvocationOptions.TryGetValue("o", out var outFile))
        {
            Console.WriteLine("Database (-d), Table (-t), and Out file (-o) must be set");
            return;
        }

        var connString = new MySqlConnectionStringBuilder
        {
            Database = db,
            Server = host,
            UserID = user,
            Password = password
        }.ToString();

        using var conn = new MySqlConnection(connString);
        await conn.OpenAsync();

        var cmd = new MySqlCommand($"SELECT * FROM `{table}`", conn);

        var reader = await cmd.ExecuteReaderAsync();
        var results = new List<Dictionary<string, object>>();

        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < reader.FieldCount; i++)
            {
                row[reader.GetName(i)] = reader.GetValue(i);
            }
            results.Add(row);
        }

        var backup = new Dictionary<string, object>
        {
            ["version"] = 1,
            ["database"] = db,
            ["table"] = table,
            ["timestamp"] = DateTime.Now,
            ["data"] = results
        };

        var fullOutfilePath = Path.GetFullPath(outFile, Directory.GetCurrentDirectory());
        var json = JsonSerializer.Serialize(backup, new JsonSerializerOptions { WriteIndented = true });

        await File.WriteAllTextAsync(fullOutfilePath, json);
        Console.WriteLine($"Backup written to {fullOutfilePath}");
    }
}

class DatabaseBackupTool : Command
{
    public override void Init(Command command)
    {
        command.AddSubCommand<DatabaseSaveTool>("save");
        base.Init(command);
    }

    public override Task Main(Invocation invocation)
    {
        return Task.CompletedTask;
    }
}
