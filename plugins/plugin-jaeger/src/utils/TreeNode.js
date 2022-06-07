// TreeNode is necessary to sort the spans, so children follow parents, and siblings are sorted by start time.
// See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/utils/TreeNode.js
// eslint-disable-next-line @typescript-eslint/naming-convention
export default class TreeNode {
  static iterFunction(fn, depth = 0) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return (node) => fn(node.value, node, depth);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static searchFunction(search) {
    if (typeof search === 'function') {
      return search;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return (value, node) => (search instanceof TreeNode ? node === search : value === search);
  }

  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get depth() {
    return this.children.reduce((depth, child) => Math.max(child.depth + 1, depth), 1);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get size() {
    let i = 0;
    this.walk(() => i++);
    return i;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  addChild(child) {
    this.children.push(child instanceof TreeNode ? child : new TreeNode(child));
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  find(search) {
    const searchFn = TreeNode.iterFunction(TreeNode.searchFunction(search));
    if (searchFn(this)) {
      return this;
    }
    for (let i = 0; i < this.children.length; i++) {
      const result = this.children[i].find(search);
      if (result) {
        return result;
      }
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getPath(search) {
    const searchFn = TreeNode.iterFunction(TreeNode.searchFunction(search));

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const findPath = (currentNode, currentPath) => {
      // skip if we already found the result
      const attempt = currentPath.concat([currentNode]);
      // base case: return the array when there is a match
      if (searchFn(currentNode)) {
        return attempt;
      }
      for (let i = 0; i < currentNode.children.length; i++) {
        const child = currentNode.children[i];
        const match = findPath(child, attempt);
        if (match) {
          return match;
        }
      }
      return null;
    };

    return findPath(this, []);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  walk(fn, depth = 0) {
    const nodeStack = [];
    let actualDepth = depth;
    nodeStack.push({ depth: actualDepth, node: this });
    while (nodeStack.length) {
      const { node, depth: nodeDepth } = nodeStack.pop();
      fn(node.value, node, nodeDepth);
      actualDepth = nodeDepth + 1;
      let i = node.children.length - 1;
      while (i >= 0) {
        nodeStack.push({ depth: actualDepth, node: node.children[i] });
        i--;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  paths(fn) {
    const stack = [];
    stack.push({ childIndex: 0, node: this });
    const paths = [];
    while (stack.length) {
      const { node, childIndex } = stack[stack.length - 1];
      if (node.children.length >= childIndex + 1) {
        stack[stack.length - 1].childIndex++;
        stack.push({ childIndex: 0, node: node.children[childIndex] });
      } else {
        if (node.children.length === 0) {
          const path = stack.map((item) => item.node.value);
          fn(path);
        }
        stack.pop();
      }
    }
    return paths;
  }
}
