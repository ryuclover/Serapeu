"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import TutorialTemplate from "@/components/tutorial-template"
import type { TutorialProblem } from "@/lib/types"

export default function TutorialPage() {
  const params = useParams()
  const id = params.id as string
  const { tutorials, user, problems, setProblems, incrementTutorialUpvotes, createComment } = useAuth()

  const tutorial = tutorials.find((t) => t.id === id) || null

  const handleUpvote = async () => {
    if (!tutorial) {
      return
    }

    try {
      await incrementTutorialUpvotes(id)
    } catch (error) {
      console.error('Erro ao registrar upvote:', error)
    }
  }

  const handleReportProblem = (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => {
    const newProblem: TutorialProblem = {
      ...problem,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString("pt-BR"),
      resolved: false,
    }
    setProblems([...problems, newProblem])
  }

  const handleCreateComment = async (content: string) => {
    if (!tutorial) return
    await createComment(tutorial.id, content)
  }

  return (
    <TutorialTemplate
      tutorial={tutorial}
      user={user}
      onUpvote={handleUpvote}
      problems={problems}
      onReportProblem={handleReportProblem}
      onCreateComment={handleCreateComment}
    />
  )
}
