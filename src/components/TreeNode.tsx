// app/components/TreeNode.tsx
'use client'

import React from 'react';

interface TreeNodeProps {
  node: {
    id: string;
    name: string;
    level: number;
    children?: TreeNodeProps['node'][];
  };
  onAdd: (parentId: string, useAI: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onAdd,
  onEdit,
  onDelete
}) => {
  const getLevelColor = (level: number) => {
    const colors = [
      'bg-gradient-to-r from-cyan-500/30 to-purple-500/30',  // level 1
      'bg-gradient-to-r from-green-500/30 to-cyan-500/30',   // level 2 
      'bg-gradient-to-r from-yellow-500/30 to-green-500/30', // level 3
      'bg-gradient-to-r from-orange-500/30 to-yellow-500/30',// level 4
      'bg-gradient-to-r from-purple-500/30 to-orange-500/30',// level 5
      'bg-gradient-to-r from-red-500/30 to-purple-500/30',   // level 6
    ];
    return colors[(level - 1) % colors.length];
  };

  return (
    <div className="relative group">
      <div className="flex items-center mb-4">
        <div className={`
          min-w-[200px] p-3 rounded-lg
          backdrop-blur-lg border border-white/20
          ${getLevelColor(node.level)}
          group relative
        `}>
          <div className="flex items-center justify-between">
            <span className="text-white">{node.name}</span>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500
                         border border-white/20 transition-colors"
                onClick={() => onAdd(node.id, true)}
                title="Thêm node tự động bằng AI"
              >
                +
              </button>
              
              <button
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-500/20 hover:border-purple-500
                         border border-white/20 transition-colors"
                onClick={() => onAdd(node.id, false)}
                title="Thêm node thông thường"
              >
                •
              </button>

              <button
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-green-500/20 hover:border-green-500
                         border border-white/20 transition-colors"
                onClick={() => onEdit(node.id)}
                title="Sửa"
              >
                ✎
              </button>

              <button
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 hover:border-red-500
                         border border-white/20 transition-colors"
                onClick={() => onDelete(node.id)}
                title="Xóa"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-8 pl-8 border-l border-white/10">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};