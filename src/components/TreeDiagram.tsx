// app/components/TreeDiagram.tsx
'use client'
import { generateNodes } from '@/app/services/ai';
import { addNode, deleteNode, findNode, getNodePath, updateNode } from '@/app/services/tree';
import type { TreeNode as TreeNodeType } from '@/types';
import { useCallback, useRef, useState } from 'react';
import { TreeDialog } from './TreeDialog';
import { TreeNode } from './TreeNode';
export function TreeDiagram() {
  // State
  const [treeData, setTreeData] = useState<TreeNodeType>({
    id: '1',
    name: 'Nhập tên',
    level: 1,
    children: []
  });
  console.log("🚀 ~ treeData:", treeData)

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    parentId: '',
    useAI: false,
    isEditing: false
  });
  console.log("🚀 ~ dialog:", dialog)

  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Node context handlers
  const getNodeContext = (nodeId: string) => {
    const path = getNodePath([treeData], nodeId);
    return path.map(node => ({
      text: node.name,
      level: node.level
    }));
  };

  // Event handlers
  const handleAdd = useCallback((parentId: string, useAI: boolean) => {
    setDialog({
      isOpen: true,
      title: useAI ? 'Thêm node tự động bằng AI' : 'Thêm node mới',
      parentId,
      useAI,
      isEditing: false
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    const node = findNode([treeData], id);
    if (node) {
      setDialog({
        isOpen: true,
        title: 'Sửa node',
        parentId: id,
        useAI: false,
        isEditing: true
      });
    }
  }, [treeData]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa node này và tất cả node con của nó?')) {
      setTreeData(prev => ({
        ...prev,
        children: deleteNode(prev.children || [], id)
      }));
    }
  }, []);

  const handleDialogConfirm = useCallback(async (value: string) => {
    if (!value.trim()) return;

    try {
      setIsLoading(true);

      if (dialog.isEditing) {
        // Handle editing
        setTreeData(prev => updateNode([prev], dialog.parentId, { name: value })[0]);
      } else if (dialog.useAI) {
        // Handle AI node generation
        const parentNode = findNode([treeData], dialog.parentId);
        if (!parentNode) return;

        const contexts = getNodeContext(dialog.parentId);
        const generatedNodes = await generateNodes(value, contexts);

        if (generatedNodes) {
          // Tạo array các node mới
          const newNodes = generatedNodes.map(name => ({
            id: Math.random().toString(),
            name,
            level: parentNode.level + 1,
            children: []
          }));

          // Cập nhật treeData với tất cả node mới một lần
          setTreeData(prev => {
            // Tìm parent node và thêm tất cả children mới vào
            const updateNodeChildren = (node: TreeNodeType): TreeNodeType => {
              if (node.id === dialog.parentId) {
                return {
                  ...node,
                  children: [...(node.children || []), ...newNodes]
                };
              }

              if (node.children) {
                return {
                  ...node,
                  children: node.children.map(child => updateNodeChildren(child))
                };
              }

              return node;
            };

            return updateNodeChildren(prev);
          });
        }
      } else {
        // Handle manual node addition
        const parentNode = findNode([treeData], dialog.parentId);
        if (!parentNode) return;

        const newNode = {
          id: Math.random().toString(),
          name: value,
          level: parentNode.level + 1,
          children: []
        };

        // Cập nhật tương tự như trên
        setTreeData(prev => {
          const updateNodeChildren = (node: TreeNodeType): TreeNodeType => {
            if (node.id === dialog.parentId) {
              return {
                ...node,
                children: [...(node.children || []), newNode]
              };
            }

            if (node.children) {
              return {
                ...node,
                children: node.children.map(child => updateNodeChildren(child))
              };
            }

            return node;
          };

          return updateNodeChildren(prev);
        });
      }
    } catch (error) {
      console.error('Error in handleDialogConfirm:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setDialog(prev => ({ ...prev, isOpen: false }));
    }
  }, [dialog, treeData, getNodeContext]);

  // Pan and zoom handlers
  const handleStartDrag = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('input'))) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleStopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(z + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(z - 0.1, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-[#080B1A] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-pink-500/10 via-transparent to-transparent translate-x-full" />
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent translate-y-full" />
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid-white/5 opacity-20" />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-full min-h-screen p-8 cursor-grab active:cursor-grabbing"
        onMouseDown={handleStartDrag}
        onMouseMove={handleDrag}
        onMouseUp={handleStopDrag}
        onMouseLeave={handleStopDrag}
      >
        <div
          className="inline-block transition-transform duration-100"
          style={{
            transform: `scale(${ zoom }) translate(${ position.x }px, ${ position.y }px)`
          }}
        >
          <TreeNode
            node={treeData}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-8 right-8 flex gap-2 p-2 bg-white/5 backdrop-blur-lg rounded-lg border border-white/20">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-500/20
                   border border-white/20 text-white transition-colors"
          onClick={handleZoomIn}
          title="Phóng to"
        >
          +
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-purple-500/20
                   border border-white/20 text-white transition-colors"
          onClick={handleResetZoom}
          title="Đặt lại"
        >
          ⟳
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-500/20
                   border border-white/20 text-white transition-colors"
          onClick={handleZoomOut}
          title="Thu nhỏ"
        >
          -
        </button>
      </div>

      {/* Dialog */}
      <TreeDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDialogConfirm}
        title={dialog.title}
        isLoading={isLoading}
      />
    </div>
  );
}