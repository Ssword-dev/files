import symbols from "./symbols";

// types here are modeled via OOP like manner.
// there is both composition and inheritance.
export interface ComponentFunction<P = object> {
    (props: P): VirtualNode;
}

export interface EffectNode<V extends VirtualNode | null>
{
    value: V;
    flag: number;
    nextEffect: EffectNode<VirtualNode> | null;
}

export interface VirtualNode<T extends string | symbol | ComponentFunction = string | symbol | ComponentFunction> {
    type: T;
    key?: any;
    alternate?: VirtualNode<T> | null;

    /** For tracking purposes. */
    parent: VirtualNode | null;
}

export interface ElementNode<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> extends VirtualNode<T> {
    properties: Record<string, any>;
    children: VirtualNode[];
    stateNode: HTMLElementTagNameMap[T] | null;
}

export interface FunctionComponentNode<T extends ComponentFunction = ComponentFunction> extends VirtualNode<T> {
    properties: Record<string | symbol, any>;
    
    /**
     * An FC's stateNode is another virtual node. like a fragment.
     */
    stateNode: VirtualNode | null;
}

export interface SymbolicNode<T extends symbol = symbol> extends VirtualNode<T> {
    properties: Record<string, any>;
    children: VirtualNode[];
}

export interface FragmentNode extends SymbolicNode<typeof symbols.fragment> {
    stateNode: DocumentFragment;
}