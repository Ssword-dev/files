import { EffectFlags } from "./effectFlags";
import { createEffectNode, createFunctionalComponentElement } from "./factories";
import { EffectNode, ElementNode, FunctionComponentNode, SymbolicNode, VirtualNode } from "./types";

function startRenderWorkOnIntrinsicNode(node: ElementNode, parent: Node, effects: EffectNode<VirtualNode>){

}

function startRenderWorkOnSymbolicNode(node: SymbolicNode, parent: Node, effects: EffectNode<VirtualNode>){
}

function startRenderWorkOnComponentNode(node: FunctionComponentNode, parent: Node, effects: EffectNode<VirtualNode>){
        // initial render.
    if (!node.alternate){
        const stateNode = node.type(node.properties);

        node.stateNode = stateNode;

        // children is safe to pass as props as side effect of it being merged in .properties.
        const alternate = createFunctionalComponentElement(node.type, node.properties);

        // bind the alternates.
        node.alternate = alternate;
        alternate.alternate = node;

        // bind alternate's state node.
        alternate.stateNode = stateNode;
        
        const effect = createEffectNode(node);
        effect.flag |= EffectFlags.Placement;

        effects.nextEffect = effect;
    }

    else {}
}

function startRenderWork(node: VirtualNode, parent: Node, effects: EffectNode<VirtualNode>){
    switch(typeof node.type){
        case "string":
           startRenderWorkOnIntrinsicNode(node as ElementNode, parent,effects);
           break;
        
        case "symbol":
            startRenderWorkOnSymbolicNode(node as SymbolicNode, parent, effects);
            break;
        
        case "function":
            startRenderWorkOnComponentNode(node as FunctionComponentNode, parent, effects);
            break;

        default:
            break;
    }
}