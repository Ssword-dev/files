#pragma warning disable IDE0305 // collection simplification warnings

using System.Text.RegularExpressions;

namespace Library.Commander;

public abstract class ArgumentParserBase
{
    public abstract Invocation Parse(string scriptPath, string[] args);
}

public partial class UnixParser : ArgumentParserBase
{
    private static readonly Regex flagWithValueRegex = FlagWithValueRegexFactory(); // --flag=value
    private static readonly Regex flagRegex = FlagRegexFactory(); // -f or --flag

    public override Invocation Parse(string scriptPath, string[] args)
    {
        bool terminated = false;
        int n = 0;

        var options = new Dictionary<string, dynamic>();
        var preTerms = new List<string>();
        var postTerms = new List<string>();

        while (n < args.Length)
        {
            var current = args[n];

            // handle -- to terminate flags
            if (!terminated && current == "--")
            {
                terminated = true;
                n++;
                continue;
            }

            // if we're after "--", collect into postTerms
            if (terminated)
            {
                postTerms.Add(current);
                n++;
                continue;
            }

            // check for --flag=value
            var matchWithValue = flagWithValueRegex.Match(current);
            if (matchWithValue.Success)
            {
                var key = matchWithValue.Groups[1].Value;
                var value = matchWithValue.Groups[2].Value;
                options[key] = value;
                n++;
                continue;
            }

            // check for plain flags: --debug or -f
            var matchFlag = flagRegex.Match(current);
            if (matchFlag.Success)
            {
                var key = matchFlag.Groups[1].Value;

                // lookahead for value (not a flag)
                if (n + 1 < args.Length && !args[n + 1].StartsWith('-'))
                {
                    options[key] = args[n + 1];
                    n += 2;
                }
                else
                {
                    options[key] = true;
                    n++;
                }

                continue;
            }

            // else, positional argument
            preTerms.Add(current);
            n++;
        }

        return new Invocation(scriptPath, preTerms.ToArray(), options, postTerms.ToArray());
    }

    [GeneratedRegex(@"--?(\w+)=([\s\S]+)")]
    private static partial Regex FlagWithValueRegexFactory();

    [GeneratedRegex(@"--?(\w+)")]
    private static partial Regex FlagRegexFactory();
}
