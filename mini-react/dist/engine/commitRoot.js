import commitWork from "./commitWork";
function commitRoot(root, state, host) {
    let nextEffect = root.firstEffect;
    while (nextEffect !== null) {
        commitWork(nextEffect, state, host);
        nextEffect = nextEffect.nextEffect;
    }
    root.firstEffect = null;
    root.lastEffect = null;
}
export default commitRoot;
