// your own abstraction, not the real DocumentFragment
export class PersistentDocumentFragment {
  private markerStart: Comment;
  private markerEnd: Comment;
  private _children: ChildNode[];

  constructor(...children: ChildNode[]) {
    this.markerStart = document.createComment("frag-start");
    this.markerEnd = document.createComment("frag-end");
    this._children = [...children];
  }

  mount(parent: Node) {
    for (const child of this._children) {
      parent.insertBefore(child, null);
    }
  }

  remove(){
    for (const child of this._children){
      child.remove();
    }
  }

  asDocumentFragment(): DocumentFragment{
    const fragment = document.createDocumentFragment();
    this.mount(fragment);
    return fragment;
  }

  addChild(child: ChildNode) {
    this._children.push(child);
  }

  removeChild(child: ChildNode) {
    if (this._children.includes(child)) {
      const index = this._children.indexOf(child);
      this._children.splice(index, 1);
      child.remove();
    }
  }
}
