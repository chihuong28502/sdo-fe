'use client'
import {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Hàm chuyển đổi dữ liệu từ backend sang React Flow
const transformDataToFlow = (rootData: any) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Tạo node gốc
  const rootNode: Node = {
    id: rootData._id,
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: rootData.name },
    sourcePosition: Position.Bottom,
  };
  nodes.push(rootNode);

  // Vị trí ban đầu cho các node cấp 2
  let baseX = -500;
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 200;

  // Xử lý các node cấp 2
  rootData.children.forEach((secondLevelNode: any, index: number) => {
    const parentNode: Node = {
      id: secondLevelNode._id,
      type: 'default',
      position: {
        x: baseX + index * HORIZONTAL_SPACING,
        y: VERTICAL_SPACING,
      },
      data: { label: secondLevelNode.name },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
    nodes.push(parentNode);

    // Tạo cạnh nối với node gốc
    edges.push({
      id: `edge_root_${ secondLevelNode._id }`,
      source: rootData._id,
      target: secondLevelNode._id,
      type: 'smoothstep',
    });

    // Xử lý các node con (cấp 3)
    if (secondLevelNode.children && secondLevelNode.children.length > 0) {
      secondLevelNode.children.forEach((childNode: any, childIndex: number) => {
        const child: Node = {
          id: childNode._id,
          type: 'default',
          position: {
            x:
              parentNode.position.x +
              (childIndex - secondLevelNode.children.length / 2) * 150,
            y: parentNode.position.y + VERTICAL_SPACING,
          },
          data: { label: childNode.name },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        };
        nodes.push(child);

        // Tạo cạnh nối với node cha
        edges.push({
          id: `edge_${ secondLevelNode._id }_${ childNode._id }`,
          source: secondLevelNode._id,
          target: childNode._id,
          type: 'smoothstep',
        });
      });
    }
  });

  return { nodes, edges };
};

function MusicGenreFlow() {
  // Dữ liệu gốc
  const rootData = {
    "_id": "67bee5be4097afd9b4bb6e88",
    "name": "Ca nhạc",
    "level": 1,
    "parent": [],
    "createdAt": "2025-02-26T09:58:22.245Z",
    "updatedAt": "2025-02-26T09:58:22.245Z",
    "__v": 0,
    "children": [
      {
        "_id": "67bee6784097afd9b4bb6e9f",
        "name": "Pop",
        "level": 2,
        "parent": [
          "67bee5be4097afd9b4bb6e88"
        ],
        "__v": 0,
        "createdAt": "2025-02-26T10:01:28.605Z",
        "updatedAt": "2025-02-26T10:01:28.605Z",
        "children": [
          {
            "_id": "67bee6834097afd9b4bb6eb3",
            "name": "K-Pop",
            "level": 3,
            "parent": [
              "67bee6784097afd9b4bb6e9f"
            ],
            "__v": 0,
            "createdAt": "2025-02-26T10:01:39.166Z",
            "updatedAt": "2025-02-26T10:01:39.166Z",
            "children": []
          },
          {
            "_id": "67bee6834097afd9b4bb6eb4",
            "name": "US Pop",
            "level": 3,
            "parent": [
              "67bee6784097afd9b4bb6e9f"
            ],
            "__v": 0,
            "createdAt": "2025-02-26T10:01:39.167Z",
            "updatedAt": "2025-02-26T10:01:39.167Z",
            "children": []
          },
          {
            "_id": "67bee6834097afd9b4bb6eb5",
            "name": "Latin Pop",
            "level": 3,
            "parent": [
              "67bee6784097afd9b4bb6e9f"
            ],
            "__v": 0,
            "createdAt": "2025-02-26T10:01:39.167Z",
            "updatedAt": "2025-02-26T10:01:39.167Z",
            "children": []
          },
          {
            "_id": "67bee6834097afd9b4bb6eb6",
            "name": "Dance Pop",
            "level": 3,
            "parent": [
              "67bee6784097afd9b4bb6e9f"
            ],
            "__v": 0,
            "createdAt": "2025-02-26T10:01:39.167Z",
            "updatedAt": "2025-02-26T10:01:39.167Z",
            "children": []
          },
          {
            "_id": "67bee6834097afd9b4bb6eb7",
            "name": "Pop Rock",
            "level": 3,
            "parent": [
              "67bee6784097afd9b4bb6e9f"
            ],
            "__v": 0,
            "createdAt": "2025-02-26T10:01:39.167Z",
            "updatedAt": "2025-02-26T10:01:39.167Z",
            "children": []
          },
          {
            "_id": "67bee6834097afd9b4bb6eb8",
            "name": "Indie Pop",
            "level": 3,
            "parent": [
              "67bee6784097afd9b4bb6e9f"
            ],
            "__v": 0,
            "createdAt": "2025-02-26T10:01:39.167Z",
            "updatedAt": "2025-02-26T10:01:39.167Z",
            "children": []
          }
        ]
      },
      {
        "_id": "67bee6784097afd9b4bb6ea0",
        "name": "Rock",
        "level": 2,
        "parent": [
          "67bee5be4097afd9b4bb6e88"
        ],
        "__v": 0,
        "createdAt": "2025-02-26T10:01:28.605Z",
        "updatedAt": "2025-02-26T10:01:28.605Z",
        "children": []
      },
      {
        "_id": "67bee6784097afd9b4bb6ea1",
        "name": "Jazz",
        "level": 2,
        "parent": [
          "67bee5be4097afd9b4bb6e88"
        ],
        "__v": 0,
        "createdAt": "2025-02-26T10:01:28.605Z",
        "updatedAt": "2025-02-26T10:01:28.605Z",
        "children": []
      },
      {
        "_id": "67bee6784097afd9b4bb6ea2",
        "name": "Cổ điển",
        "level": 2,
        "parent": [
          "67bee5be4097afd9b4bb6e88"
        ],
        "__v": 0,
        "createdAt": "2025-02-26T10:01:28.605Z",
        "updatedAt": "2025-02-26T10:01:28.605Z",
        "children": []
      },
      {
        "_id": "67bee6784097afd9b4bb6ea3",
        "name": "Nhạc điện tử",
        "level": 2,
        "parent": [
          "67bee5be4097afd9b4bb6e88"
        ],
        "__v": 0,
        "createdAt": "2025-02-26T10:01:28.605Z",
        "updatedAt": "2025-02-26T10:01:28.605Z",
        "children": []
      },
      {
        "_id": "67bee6784097afd9b4bb6ea4",
        "name": "R&B",
        "level": 2,
        "parent": [
          "67bee5be4097afd9b4bb6e88"
        ],
        "__v": 0,
        "createdAt": "2025-02-26T10:01:28.605Z",
        "updatedAt": "2025-02-26T10:01:28.605Z",
        "children": []
      }
    ]
  }

  // Chuyển đổi dữ liệu
  const { nodes: initialNodes, edges: initialEdges } =
    transformDataToFlow(rootData);

  // Quản lý state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Render
  return (
    <div style={{ height: '100vh', width: '100vw', color: 'black' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#ffffff" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default MusicGenreFlow;
