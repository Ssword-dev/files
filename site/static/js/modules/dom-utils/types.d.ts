declare module "./bases.js" {
  export class BaseError extends Error {
    constructor(message: string);
  }
}

// cls.d.ts
import { InvalidClassCandidateError } from "./errors";

type ClassCandidate =
  | string
  | symbol
  | Record<string, boolean | (() => boolean)>
  | ClassCandidate[]
  | null
  | undefined
  | false
  | 0;

declare module "./classname-utils.js" {
  export function cls(...args: ClassCandidate[]): string;

  export namespace cls {
    function flattenRecord(
      record: Record<string, boolean | (() => boolean)>,
    ): string;

    function flattenArray(arr: ClassCandidate[]): string;

    function serializeSymbol(sym: symbol): string;
  }
}
