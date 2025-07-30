namespace Library.Commander;

public record class Invocation(string InvocationPath, string[] InvocationArguments, Dictionary<string, dynamic> InvocationOptions, string[] InvocationOperands);

/// <summary>
/// Represents an internal invocation model.
/// (nothing is parsed.)
/// </summary>
public record class RawInvocation(string InvocationPath, string[] InvocationArguments);
