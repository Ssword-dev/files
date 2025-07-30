using System.Text;

class ConsoleLibrary
{
    public readonly ConsoleKey LineTerminator;
    public ConsoleLibrary(ConsoleKey lineTerminator)
    {
        LineTerminator = lineTerminator;
    }
    public string ReadLineSecure()
    {
        var password = new StringBuilder();
        ConsoleKeyInfo key;
        while ((key = Console.ReadKey(true)).Key != LineTerminator)
        {
            if (key.Key == ConsoleKey.Backspace && password.Length > 0)
            {
                password.Length--;
                Console.Write("\b \b");
            }
            else if (!char.IsControl(key.KeyChar))
            {
                password.Append(key.KeyChar);
                Console.Write("*");
            }
        }
        Console.WriteLine();
        return password.ToString();
    }
}
