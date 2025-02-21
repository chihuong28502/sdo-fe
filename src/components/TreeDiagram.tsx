// components/TreeDiagram.tsx
'use client'
import { generateNodes } from '@/app/services/ai';
import { deleteNode, findNode, getNodePath } from '@/app/services/tree';
import type { TreeNode as TreeNodeType } from '@/types';
import { useCallback, useRef, useState } from 'react';
import { TreeNode } from './TreeNode';

export function TreeDiagram() {
  const [treeData, setTreeData] = useState<TreeNodeType>({
    id: '1',
    name: 'Nhập tên',
    level: 1,
    children: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputFormRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Event handlers
  const handleAdd = useCallback(async (parentId: string, useAI: boolean) => {
    const parentNode = findNode([treeData], parentId);
    if (!parentNode) return;

    // Show input form
    if (inputFormRef.current && inputRef.current) {
      const rect = (event?.target as HTMLElement)?.getBoundingClientRect();
      if (rect) {
        inputFormRef.current.style.display = 'block';
        inputFormRef.current.style.left = `${ rect.right + 5 }px`;
        inputFormRef.current.style.top = `${ rect.top }px`;
        inputRef.current.value = '';
        inputRef.current.focus();
        inputRef.current.dataset.useAi = useAI ? 'true' : 'false';
        inputRef.current.dataset.parentId = parentId;
      }
    }
  }, [treeData]);

  const handleEdit = useCallback((id: string) => {
    const node = findNode([treeData], id);
    if (!node) return;

    // Tìm đúng `.node-wrapper` theo `data-node-id`
    const nodeWrapper = document.querySelector(`.node-wrapper[data-node-id="${ id }"]`);
    if (!nodeWrapper) return;

    // Tìm `span` chứa tên node
    const textElement = nodeWrapper.querySelector("span");
    if (!textElement) return;

    // Bật chế độ chỉnh sửa
    textElement.setAttribute("contenteditable", "true");
    textElement.classList.add("editing");
    textElement.focus();

    // Hàm lưu dữ liệu khi Enter hoặc mất focus
    const saveEdit = () => {
      const newValue = textElement.textContent?.trim() || node.name;
      textElement.removeAttribute("contenteditable");
      textElement.classList.remove("editing");

      // Cập nhật state
      setTreeData((prev) => {
        const updateNode = (node: TreeNodeType): TreeNodeType => {
          if (node.id === id) {
            return { ...node, name: newValue };
          }
          return node.children ? { ...node, children: node.children.map(updateNode) } : node;
        };
        return updateNode(prev);
      });
    };

    // Lưu thay đổi khi nhấn Enter
    textElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveEdit();
      }
    });

    // Lưu thay đổi khi mất focus
    textElement.addEventListener("blur", saveEdit);
  }, [treeData]);


  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa node này và tất cả node con của nó?')) {
      setTreeData(prev => ({
        ...prev,
        children: deleteNode(prev.children || [], id)
      }));
    }
  }, []);

  const handleInputConfirm = useCallback(async () => {
    if (!inputRef.current) return;

    const value = inputRef.current.value.trim();
    const useAI = inputRef.current.dataset.useAi === 'true';
    const parentId = inputRef.current.dataset.parentId;

    if (!value || !parentId) return;

    try {
      setIsLoading(true);

      if (useAI) {
        const parentNode = findNode([treeData], parentId);
        if (!parentNode) return;

        const contexts = getNodePath([treeData], parentId).map(node => ({
          text: node.name,
          level: node.level
        }));

        const generatedNodes = await generateNodes(value, contexts);

        if (generatedNodes) {
          const newNodes = generatedNodes.map(name => ({
            id: Math.random().toString(),
            name,
            level: parentNode.level + 1,
            children: []
          }));

          setTreeData(prev => {
            const updateNodeChildren = (node: TreeNodeType): TreeNodeType => {
              if (node.id === parentId) {
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
        const parentNode = findNode([treeData], parentId);
        if (!parentNode) return;

        const newNode = {
          id: Math.random().toString(),
          name: value,
          level: parentNode.level + 1,
          children: []
        };

        setTreeData(prev => {
          const updateNodeChildren = (node: TreeNodeType): TreeNodeType => {
            if (node.id === parentId) {
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
      console.error('Error:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      if (inputFormRef.current) {
        inputFormRef.current.style.display = 'none';
      }
    }
  }, [treeData]);

  // Pan and zoom handlers
  const handleStartDrag = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('input') ||
        e.target.closest('.node-actions') || e.target.closest('.add-buttons'))) {
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

  return (
    <div className="min-h-screen bg-[#080B1A] overflow-hidden">
      <div className="abstract-bg"></div>
      <div className="grid-pattern"></div>

      <div className="container" ref={containerRef}
        onMouseDown={handleStartDrag}
        onMouseMove={handleDrag}
        onMouseUp={handleStopDrag}
        onMouseLeave={handleStopDrag}
      >
        <div className="tree">
          <div
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
      </div>

      {/* Input Form */}
      <div className="input-form" ref={inputFormRef}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Nhập yêu cầu của bạn"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleInputConfirm();
            if (e.key === 'Escape') inputFormRef.current!.style.display = 'none';
          }}
        />
        <button onClick={handleInputConfirm}>OK</button>
        <button onClick={() => inputFormRef.current!.style.display = 'none'}>Hủy</button>
      </div>

      {/* Loading */}
      <div className="loading" style={{ display: isLoading ? 'block' : 'none' }} />

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>+</button>
        <button onClick={() => {
          setZoom(1);
          setPosition({ x: 0, y: 0 });
        }}>⟳</button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>-</button>
      </div>

    </div>
  );
}