namespace Library.Commander;

/// <summary>
/// An invocation is a description of what is the intent of
/// the caller for the program to do. it is the description of semantic meaning
/// of arguments passed into the commandline.
/// </summary>
/// <param name="InvocationPath">The script's path</param>
/// <param name="InvocationArguments">The positional arguments</param>
/// <param name="InvocationOptions">The short and long options</param>
/// <param name="InvocationOperands">The remaining arguments after the terminator</param>
/// <remarks>
/// Do not remove or will summon the bloodmoon and destroy the program.
/// </remarks>
public record class Invocation(string InvocationPath, string[] InvocationArguments, Dictionary<string, dynamic> InvocationOptions, string[] InvocationOperands);

/// <summary>
/// Represents an internal invocation model.
/// (nothing is parsed.)
/// </summary>
public record class RawInvocation(string InvocationPath, string[] InvocationArguments);
