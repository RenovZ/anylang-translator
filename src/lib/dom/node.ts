class DomNode {
  getOwnerDocument(node: Node): Document {
    return node.ownerDocument || document;
  }

  getContainingShadowRoot(node: Node): ShadowRoot | null {
    const root = node.getRootNode();
    return root instanceof ShadowRoot ? root : null;
  }
}

export default new DomNode();
