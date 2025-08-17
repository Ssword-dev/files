import { BaseError } from "./bases.js";

/**
 * Thrown when a class provided as input
 * does not meet the expected requirements.
 */
class InvalidClassCandidateError extends BaseError {
  /** super */
}

/**
 * Thrown when a semantic function call
 * fails due to logic or input issues.
 */
class SemanticFunctionError extends BaseError {
  /** super */
}

/**
 * Thrown when attempting to subscribe or operate
 * on a value that is not a valid reactive object.
 */
class InvalidReactiveObjectError extends BaseError {
  /** super */
}

/**
 * Thrown when attempting to create a reactive instance
 * from a value that is not an object (null, primitive, etc.).
 */
class NonObjectReactiveError extends BaseError {
  /** super */
}

export {
  InvalidClassCandidateError,
  SemanticFunctionError,
  InvalidReactiveObjectError,
  NonObjectReactiveError,
};
