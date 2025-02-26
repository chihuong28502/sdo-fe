import { TreeDiagram } from "@/components/TreeDiagram";
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}> 
      <TreeDiagram />
      </Suspense>
    </main>
  );
}