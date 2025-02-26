import { TreeNode } from "./ai";

export function findNode(tree: TreeNode[], id: string): TreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getNodePath(tree: TreeNode[], id: string): TreeNode[] {
  const path: TreeNode[] = [];

  function search(node: TreeNode): boolean {
    path.push(node);
    if (node.id === id) return true;

    if (node.children) {
      for (const child of node.children) {
        if (search(child)) return true;
      }
    }

    path.pop();
    return false;
  }

  for (const node of tree) {
    if (search(node)) return path;
  }

  return [];
}

export function addNode(nodes: TreeNode[], parentId: string, newNode: TreeNode): TreeNode[] {
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode]
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addNode(node.children, parentId, newNode)
      };
    }
    return node;
  });
}

export function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes.filter(node => {
    if (node.id === id) return false;
    if (node.children) {
      node.children = deleteNode(node.children, id);
    }
    return true;
  });
}

export function updateNode(nodes: TreeNode[], id: string, updates: Partial<TreeNode>): TreeNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNode(node.children, id, updates)
      };
    }
    return node;
  });
}