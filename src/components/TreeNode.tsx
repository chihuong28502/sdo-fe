// components/TreeNode.tsx
import React from 'react';
import type { TreeNode as TreeNodeType } from '@/types';

interface TreeNodeProps {
  node: TreeNodeType;
  onAdd: (parentId: string, useAI: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TreeNode({ 
  node,
  onAdd,
  onEdit,
  onDelete 
}: TreeNodeProps) {
  return (
    <li>
      <div className="node-wrapper" data-node-id={node.id}>
        <div className={`node level-${node.level}`}>
          <span>{node.name}</span>
          
          <div className="node-actions">
            <button 
              className="action-btn add-ai"
              onClick={() => onAdd(node.id, true)}
              title="Thêm node tự động với AI"
            >
              +
            </button>
            <button 
              className="action-btn add-simple"
              onClick={() => onAdd(node.id, false)}
              title="Thêm node thông thường"
            >
              •
            </button>
            <button 
              className="action-btn edit"
              onClick={() => onEdit(node.id)}
              title="Sửa nội dung"
            >
              ✎
            </button>
            {node.id !== 'root' && (
              <button 
                className="action-btn delete"
                onClick={() => onDelete(node.id)}
                title="Xóa node"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}