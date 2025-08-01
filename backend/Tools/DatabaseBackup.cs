using System.Data;
using System.Net;
using System.Text.Json;
using Library.Commander;
using MySqlConnector;

class DatabaseSyncTool : Command
{
    public async Task V1(Invocation invocation, dynamic document, string db, string host, string user, string password, string table, dynamic data)
    {
        if (string.IsNullOrWhiteSpace(db) || string.IsNullOrWhiteSpace(table) || data.ValueKind != JsonValueKind.Array)
        {
            Console.WriteLine("Invalid backup file structure.");
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

        foreach (var row in data.EnumerateArray())
        {
            var columns = new List<string>();
            var values = new List<string>();
            var parameters = new List<MySqlParameter>();

            int paramIndex = 0;

            foreach (var prop in row.EnumerateObject())
            {
                var column = $"`{prop.Name}`";
                var paramName = $"@p{paramIndex++}";

                columns.Add(column);
                values.Add(paramName);
                parameters.Add(new MySqlParameter(paramName, prop.Value.ValueKind switch
                {
                    JsonValueKind.String => prop.Value.GetString(),
                    JsonValueKind.Number => prop.Value.TryGetInt64(out int l) ? l : prop.Value.GetDouble(),
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    JsonValueKind.Null => DBNull.Value,
                    _ => prop.Value.ToString()
                }));
            }

            string query = $"REPLACE INTO `{table}` ({string.Join(", ", columns)}) VALUES ({string.Join(", ", values)})";

            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddRange(parameters.ToArray());
            await cmd.ExecuteNonQueryAsync();
        }

        Console.WriteLine($"Sync completed for {data.GetArrayLength()} rows.");
    }

    public override async Task Main(Invocation invocation)
    {
        // very tiny library that just does stuff to console i guess.
        var console = new ConsoleLibrary(lineTerminator: ConsoleKey.Enter);

        // connection parameters
        string password = "";
        string host = "localhost";
        string user = "root";

        if (invocation.InvocationOptions.GetValueOrDefault("p", false))
        {
            password = console.ReadLineSecure();
        }

        if (invocation.InvocationOptions.TryGetValue("h", out var h))
        {
            host = h;
        }

        if (!invocation.InvocationOptions.TryGetValue("i", out var inFile))
        {
            Console.WriteLine("Input file (-i) must be provided.");
            return;
        }

        var fullInFilePath = Path.GetFullPath(inFile, Directory.GetCurrentDirectory());
        if (!File.Exists(fullInFilePath))
        {
            Console.WriteLine($"Input file not found: {fullInFilePath}");
            return;
        }

        var json = await File.ReadAllTextAsync(fullInFilePath);
        var doc = JsonDocument.Parse(json);

        // basically fast as lightning parsing i guess... apparently
        // this is lower level than JsonSerializer, which probably is,
        // because it loads everything into memory. it just needs
        // the database, table, and data.
        var data = doc.RootElement.GetProperty("data");
        var db = doc.RootElement.GetProperty("database").GetString();
        var table = doc.RootElement.GetProperty("table").GetString();

        // backup format version
        var version = doc.RootElement.GetProperty("version").GetInt32();

        // version 1. may add new versions later. literally just
        // need to copy the previous version and change stuff. its all
        // the same.
        switch (version)
        {
            case 1:
                {
                    await V1(
                     invocation: invocation,
                     document: doc,
                     db: db,
                     host: host,
                     user: user,
                     password: password,
                     table: table,
                     data: data
                   ); // 8/1/25 - 5:09 PM i fragmented this to make the intent more visible.
                    break;
                }

            default:
                Console.WriteLine($"Unsupported backup format version: {version}");
                break;
        }
    }
}

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
        var json = JsonSerializer.Serialize(backup);

        await File.WriteAllTextAsync(fullOutfilePath, json);
        Console.WriteLine($"Backup written to {fullOutfilePath}");
    }
}

class DatabaseBackupTool : Command
{
    public override void Init(Command command)
    {
        command.AddSubCommand<DatabaseSaveTool>("save");
        command.AddSubCommand<DatabaseSyncTool>("sync");
        base.Init(command);
    }

    public override Task Main(Invocation invocation)
    {
        return Task.CompletedTask;
    }
}
