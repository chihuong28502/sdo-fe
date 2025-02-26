// app/utils/transformData.ts
import type { TreeNode } from '@/types';

// Kiểu dữ liệu từ backend
interface BackendNode {
  _id: string;
  name: string;
  level: number;
  parent: string[];
  children: BackendNode[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Hàm chuyển đổi dữ liệu từ định dạng backend sang định dạng TreeNode
export const transformData = (data: any): TreeNode => {
  // Nếu data là array, lấy phần tử đầu tiên
  const rootNode = Array.isArray(data) ? data[0] : data;
  
  // Hàm đệ quy để chuyển đổi node và tất cả node con
  const convertNode = (node: BackendNode): TreeNode => {
    return {
      id: node._id,
      name: node.name,
      level: node.level,
      children: node.children ? node.children.map(convertNode) : []
    };
  };
  
  return convertNode(rootNode);
};