using Library.Commander;
using Microsoft.EntityFrameworkCore;

class DatabaseContext(DbContextOptions Opts) : DbContext(Opts) { };

// TODO: add this later
// class DatabaseSaveTool : Command
// {
//     public override Task Main(Invocation invocation)
//     {
//     }
// }

class DatabaseBackupTool : Command
{
    public override Task Main(Invocation invocation)
    {
        return Task.CompletedTask;
    }
}
