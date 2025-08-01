using System.Text.Json;
using System.Reflection;
namespace Library.Secrets;

// configurable types here
using SecretsPropertyValue = dynamic;

/// <summary>
/// A very tiny library to load secrets from an embedded JSON file.
/// The secrets are loaded from an embedded resource named "Configurations.secrets.json".
/// please make sure it exists in the solution root under the "Configurations" folder.
/// </summary>
/// <remarks>
/// </remarks>
public class SecretsLibrary
{
    private static Dictionary<string, SecretsPropertyValue>? _Secrets = null;

    public static Dictionary<string, SecretsPropertyValue> LoadSecrets()
    {
        if (_Secrets == null)
        {
            var asm = Assembly.GetExecutingAssembly();

            var resourceName = asm.GetManifestResourceNames()
                .FirstOrDefault(n => n.EndsWith("Configurations.secrets.json"))
                ?? throw new InvalidOperationException("secrets.json not embedded properly");

            Stream stream;

            try
            {
                stream = asm.GetManifestResourceStream(resourceName) ?? throw new FileNotFoundException();
            }

            catch (FileNotFoundException)
            {
                throw new InvalidOperationException("Secrets file cannot be loaded. ensure it exist as Configurations/secrets.json from the solution root.");
            }

            using var reader = new StreamReader(stream);
            var json = reader.ReadToEnd(); // intentional blocking here.

            _Secrets = JsonSerializer.Deserialize<Dictionary<string, SecretsPropertyValue>>(json) ?? throw new FormatException("Configurations/secrets.json is not a valid JSON file.");
        }

        return _Secrets;
    }

    public class Secrets
    {
        private readonly Dictionary<string, SecretsPropertyValue> _secrets;
        public Secrets()
        {
            _secrets = LoadSecrets();
        }

        public SecretsPropertyValue? this[string key]
        {
            get => _secrets.TryGetValue(key, out var v) ? v : null;
        }

        public SecretsPropertyValue Get(string key)
        {
            if (_secrets.TryGetValue(key, out var value))
            {
                return value;
            }

            throw new KeyNotFoundException($"The key '{key}' was not found in the secrets configuration.");
        }

        /// <summary>
        /// I
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
#if DEBUG
            return JsonSerializer.Serialize(_secrets, new JsonSerializerOptions()
            {
                WriteIndented = true,
            });
#else
            return "<SecretsLibrary.Secrets object>";
#endif
        }
    }
}
