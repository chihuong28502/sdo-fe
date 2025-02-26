'use client'
import { useEffect, useState } from "react";
import { generateAllProject } from "./services/ai";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const route = useRouter()
  const [listProject, setListProject] = useState([])
  useEffect(() => {
    const getProject = async () => {
      const data: any = await generateAllProject()
      setListProject(data)
    }
    getProject()
  }, [])
  const handleClick = (id: any) => {
    route.push(`/tree?id=${ id }`)
  }
  return (
    <main>
      {listProject.map((project: any) => (
        <Button onClick={() => handleClick(project._id)} className="bg-[#999]" key={project._id} >{project.name}</Button>
      ))}
    </main>
  );
}