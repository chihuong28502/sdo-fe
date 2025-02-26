// components/TreeDiagram.tsx
'use client'
import { generateNodes, generateNodesFromDb, generateProjectById } from '@/app/services/ai';
import { deleteNode, findNode, getNodePath } from '@/app/services/tree';
import type { TreeNode as TreeNodeType } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TreeNode } from './TreeNode';
import { InputModal } from './InputModal';
import { useSearchParams } from 'next/navigation';

export function TreeDiagram() {
  // State
  const searchParams= useSearchParams()
  const [treeData, setTreeData] = useState<TreeNodeType>({
    id: 'root',
    name: 'Nhập tên',
    level: 1,
    children: []
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    parentId: '',
    useAI: false,
    editingId: null as string | null,
    initialValue: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [nodes,setNodes] = useState([])
  console.log("🚀 ~ nodes:", nodes)
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const getProjectById = async () => {
    const data = await generateProjectById(searchParams.get('id'))
    setNodes(data)
  }
  getProjectById()
 },[])
  // Event Handlers
  const handleAdd = useCallback((parentId: string, useAI: boolean) => {
    setModalState({
      isOpen: true,
      title: useAI ? 'Thêm node với AI' : 'Thêm node mới',
      parentId,
      useAI,
      editingId: null,
      initialValue: ''
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    const node = findNode([treeData], id);
    if (!node) return;

    setModalState({
      isOpen: true,
      title: 'Sửa node',
      parentId: node.id,
      useAI: false,
      editingId: id,
      initialValue: node.name
    });
  }, [treeData]);

  const handleDelete = useCallback((id: string) => {
    if (id === 'root') return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa node này và tất cả node con?')) {
      setTreeData(prev => ({
        ...prev,
        children: deleteNode(prev.children || [], id)
      }));
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleModalConfirm = useCallback(async (value: string) => {
    if (!value.trim()) return;

    try {
      setIsLoading(true);
      const { parentId, useAI, editingId } = modalState;

      // Handle editing
      if (editingId) {
        setTreeData(prev => {
          const updateNode = (node: TreeNodeType): TreeNodeType => {
            if (node.id === editingId) {
              return { ...node, name: value };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map(updateNode)
              };
            }
            return node;
          };
          return updateNode(prev);
        });
        return;
      }

      // Handle adding new nodes
      const parentNode = findNode([treeData], parentId);
      if (!parentNode) return;

      if (useAI) {
        const contexts = getNodePath([treeData], parentId).map(node => ({
          text: node.name,
          level: node.level
        }));

        const generatedNodes = await generateNodes(value, contexts);
        
        if (generatedNodes?.length) {
          const newNodes = generatedNodes.map(name => ({
            id: Math.random().toString(),
            name,
            level: parentNode.level + 1,
            children: []
          }));

          setTreeData(prev => {
            const addNodes = (node: TreeNodeType): TreeNodeType => {
              if (node.id === parentId) {
                return {
                  ...node,
                  children: [...(node.children || []), ...newNodes]
                };
              }
              if (node.children) {
                return {
                  ...node,
                  children: node.children.map(addNodes)
                };
              }
              return node;
            };
            return addNodes(prev);
          });
        }
      } else {
        const newNode = {
          id: Math.random().toString(),
          name: value,
          level: parentNode.level + 1,
          children: []
        };

        setTreeData(prev => {
          const addNode = (node: TreeNodeType): TreeNodeType => {
            if (node.id === parentId) {
              return {
                ...node,
                children: [...(node.children || []), newNode]
              };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map(addNode)
              };
            }
            return node;
          };
          return addNode(prev);
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      handleModalClose();
    }
  }, [modalState, treeData]);

  // Pan and Zoom handlers
  const handleStartDrag = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('input') ||
        e.target.closest('.node-actions'))) {
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
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s ease'
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

      <InputModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        initialValue={modalState.initialValue}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        isLoading={isLoading}
      />

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