// components/TreeDiagram.tsx
'use client'
import { createNodeByAi, createNodeNormal, deleteNodeApi, eidtNodeApi, generateProjectById } from '@/app/services/ai';
import { deleteNode, findNode, getNodePath } from '@/app/services/tree';
import { transformData } from '@/app/utils/transformData';
import type { TreeNode as TreeNodeType } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TreeNode } from './TreeNode';
import { InputModal } from './InputModal';
import { useSearchParams } from 'next/navigation';

export function TreeDiagram() {
  // State
  const searchParams = useSearchParams();
  const [treeData, setTreeData] = useState<TreeNodeType>({
    id: 'root',
    name: 'Đang tải...',
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
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      const projectId = searchParams.get('id');
      if (projectId) {
        const data = await generateProjectById(projectId);
        console.log('🚀 ~ fetchData ~ data:', data);

        if (data) {
          // Chuyển đổi dữ liệu từ backend sang định dạng TreeNode
          const transformedData = transformData(data);
          setTreeData(transformedData);
        }
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {

    fetchData();
  }, [searchParams]);

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

  const handleDelete = useCallback(async (id: string) => {
    if (id === treeData.id) return; // Prevent deleting root node

    if (window.confirm('Bạn có chắc chắn muốn xóa node này và tất cả node con?')) {
      const node = await deleteNodeApi(id);
      if (node) {
        setTreeData(prev => {
          // Nếu node được xóa là con trực tiếp của root
          if (prev.children?.some(child => child.id === id)) {
            return {
              ...prev,
              children: prev.children.filter(child => child.id !== id)
            };
          }

          // Nếu node ở sâu hơn
          const updateChildren = (children: TreeNodeType[]): TreeNodeType[] => {
            return children.map(child => {
              if (child.children?.some(grandChild => grandChild.id === id)) {
                return {
                  ...child,
                  children: child.children.filter(grandChild => grandChild.id !== id)
                };
              }
              if (child.children) {
                return {
                  ...child,
                  children: updateChildren(child.children)
                };
              }
              return child;
            });
          };

          return {
            ...prev,
            children: prev.children ? updateChildren(prev.children) : []
          };
        });
      }
    }
  }, [treeData]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleModalConfirm = useCallback(async (value: string) => {
    if (!value.trim()) return;

    try {
      setIsLoading(true);
      const { parentId, useAI, editingId }: any = modalState;
      const data = await eidtNodeApi(value, editingId)
      // Handle editing existing node
      if (editingId && data) {
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

      // Handle adding new node
      const parentNode = findNode([treeData], parentId);
      if (!parentNode) return;

      if (useAI) {
        // Gọi API tạo node bằng AI
        const aiNodes = await createNodeByAi({ prompt: value, idChildrent: parentId });
        if (aiNodes)
          await fetchData()

      }
      else {
        const nodeNormal = await createNodeNormal(value, parentId)
        if (nodeNormal)
          await fetchData()
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
        {isDataLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div className="tree">
            <div
              style={{
                transform: `scale(${ zoom }) translate(${ position.x }px, ${ position.y }px)`,
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
        )}
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