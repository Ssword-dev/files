// symbols.js
export const symbols = {
  element: Symbol.for("element"),
  portal: Symbol.for("portal"),
  fragment: Symbol.for("fragment"),
  strict_mode: Symbol.for("strict_mode"),
  profiler: Symbol.for("profiler"),
  provider: Symbol.for("provider"),
  context: Symbol.for("context"),
  forward_ref: Symbol.for("forward_ref"),
  suspense: Symbol.for("suspense"),
  memo: Symbol.for("memo"),
  lazy: Symbol.for("lazy"),

  // other stuff i added
  fiberRootNode: Symbol.for("fiber.root"),
  fiberNode: Symbol.for("fiber.node"),
};
