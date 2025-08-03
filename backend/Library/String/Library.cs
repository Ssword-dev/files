using System.Text;

namespace Library.String;

// This is a string transformer that can be used
// to transform characters in a string based on their
// position and character value.
using StringTransformer = Func<char, int, string>;

public abstract class StringLibraryAbstract
{
    /// <summary>
    /// Takes in a table name and sanitizes it for sql queries.
    /// </summary>
    /// <param name="table">
    /// Untrusted table name where user might use <code>`</code>
    /// to do an sql injection
    /// </param>
    /// <returns>The sanitized table name</returns>
    public abstract string TableName(string table);
}

public sealed class StringLibrary : StringLibraryAbstract
{
    public StringLibrary()
    {
        // library code does not have initialization.
    }

    /// <inheritdoc />
    public override string TableName(string table)
    {
        var sanitized = table.Replace("`", "\\`");
        return $"`{sanitized}`";
    }

    /// <summary>
    /// Escapes a string's quotes. might be useful if quotes have special meaning
    /// in an specific context, such as SQL queries
    /// </summary>
    /// <param name="input">The unsanitized input</param>
    /// <param name="quotes">The characters to be escaped</param>
    /// <returns>The escaped strings.</returns>
    public string EscapeString(string input, char[] quotes)
    {
        return input.Aggregate(new StringBuilder(), (sb, c) =>
        {
            foreach (var quote in quotes)
            {
                if (c == quote)
                {
                    sb.Append($"\\{quote}");
                    return sb;
                }
            }

            sb.Append(c);
            return sb;
        }).ToString();
    }

    public string TransformString(string input, Dictionary<char, string> replacements)
    {
        var builder = new StringBuilder();
        foreach (var c in input)
        {
            if (replacements.TryGetValue(c, out var rep))
            {
                builder.Append(rep);
            }

            else
            {
                builder.Append(c);
            }
        }

        return builder.ToString();
    }

    /// <summary>
    /// Optimized version of the one that uses string replacements.
    /// </summary>
    /// <inheritdoc /> 
    public string TransformString(string input, Dictionary<char, char> replacements)
    {
        var builder = new StringBuilder(input.Length);
        foreach (var c in input)
        {
            if (replacements.TryGetValue(c, out var rep))
            {
                builder.Append(rep);
            }

            else
            {
                builder.Append(c);
            }
        }

        return builder.ToString();
    }

    public string TransformString(string input, StringTransformer transformer)
    {
        var builder = new StringBuilder();

        for (int i = 0; i < input.Length; i++)
        {
            var c = input[i];
            var transformed = transformer(c, i);
            builder.Append(transformed);
        }

        return builder.ToString();
    }

    public string TransformString(string input, Dictionary<char, StringTransformer> transformers)
    {
        var builder = new StringBuilder();

        for (int i = 0; i < input.Length; i++)
        {
            var c = input[i];

            if (transformers.TryGetValue(c, out var transformer))
            {
                builder.Append(transformer(c, i));
            }

            else
            {
                builder.Append(c);
            }
        }

        return builder.ToString();
    }
}
