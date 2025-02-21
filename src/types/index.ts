// src/types/index.ts
export interface NodeContext {
  text: string;
  level: number;
}

export interface TreeNode {
  id: string;
  name: string;
  level: number;
  children?: TreeNode[];
}