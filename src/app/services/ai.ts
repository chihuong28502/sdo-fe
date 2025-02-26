// app/services/ai.ts

import axios from "axios";

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
// src/services/ai.ts

export async function generateNodes(prompt: string, contexts: NodeContext[] = []): Promise<string[] | null> {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  try {
    const contextString = contexts
      .map(ctx => `Level ${ ctx.level }: "${ ctx.text }"`)
      .join(' -> ');

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY || ''
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tôi đang tạo một sơ đồ phân cấp. Đây là đường dẫn ngữ cảnh hiện tại:
                ${ contextString }
                Yêu cầu của người dùng để tạo các node con: "${ prompt }"
                
                Dựa trên ngữ cảnh này, hãy tạo 4-6 node con liên quan.
                Node con phải có liên quan đến cả node cha trực tiếp và toàn bộ ngữ cảnh.
                
                Chỉ trả về một mảng JSON chứa tên các node, ví dụ: ["Node 1", "Node 2", "Node 3"].
                Ví dụ: nếu ngữ cảnh là Công nghệ -> Phần mềm -> Phát triển, và input là "Công cụ",
                thì trả về: ["IDE", "Hệ thống quản lý phiên bản", "Build tools", "Debugging"]
                
                CHỈ trả về mảng JSON, không thêm nội dung khác.`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text.trim();
      try {
        const parsedNodes = JSON.parse(text);
        if (Array.isArray(parsedNodes)) {
          return parsedNodes;
        }
      } catch (e) {
        const match = text.match(/\[([^\]]+)\]/);
        if (match) {
          try {
            const parsedNodes = JSON.parse(match[0]);
            if (Array.isArray(parsedNodes)) {
              return parsedNodes;
            }
          } catch (e2) {
            console.error('Error parsing matched JSON:', e2);
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}


export async function generateAllProject(): Promise<any> {
  const res = await axios.get(`${ process.env.NEXT_PUBLIC_API_SERVER }/tree/get-all-projects`);
  console.log("res.data", res.data);

  return res.data.data;
}

export async function generateProjectById(id: any): Promise<any> {
  const res = await axios.get(`${ process.env.NEXT_PUBLIC_API_SERVER }/tree/get-project/${ id }`);
  console.log("res.data", res.data);

  return res.data.data;
}

export async function createNodeByAi({ prompt, idChildrent }: any): Promise<any> {
  const res = await axios.post(`${ process.env.NEXT_PUBLIC_API_SERVER }/tree/generate-nodes`, { prompt, idChildrent });

  return res.data.data;
}
export async function createNodeNormal(prompt: string, idChildrent: string): Promise<any> {
  const res = await axios.post(`${ process.env.NEXT_PUBLIC_API_SERVER }/tree/generate-nodes-noAi`, {
    prompt,
    idChildrent
  });

  return res.data;
}

export async function eidtNodeApi(name: string, idNode: string): Promise<any> {
  const res = await axios.post(`${ process.env.NEXT_PUBLIC_API_SERVER }/tree/edit/node`, {
    name,
    idNode
  });

  return res.data;
}

export async function deleteNodeApi(id: string): Promise<any> {
  const res = await axios.delete(`${ process.env.NEXT_PUBLIC_API_SERVER }/tree/delete/node/${ id }`);

  return res.data;
}
// src/services/tree.ts
