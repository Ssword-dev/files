let activeEffect = null;
const effectStack = [];

function effect(fn) {
  const reactiveEffect = () => {
    cleanup(reactiveEffect);
    pushEffect(reactiveEffect);
    fn();
    popEffect();
  };
  reactiveEffect.deps = [];
  reactiveEffect();
}

function pushEffect(effect) {
  effectStack.push(effect);
  activeEffect = effect;
}

function popEffect() {
  effectStack.pop();
  activeEffect = effectStack[effectStack.length - 1] || null;
}

function isComponentType(type) {
  return typeof type === "function";
}

function isValidElementType(type) {
  return (
    typeof type === "function" ||
    typeof type === "string" ||
    typeof type === "symbol"
  );
}

function createElement(type, props, children) {
  if (!isValidElementType(type)) {
    throw new Error(`Invalid element type: ${typeof type}`);
  }

  if (isComponentType(type)) {
    return {
      componentFn: type,
      props: props,
      children: children,
      componentInstance: null,
    };
  }
}
