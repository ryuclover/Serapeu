"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import TutorialTemplate from "@/components/tutorial-template"
import type { TutorialProblem } from "@/lib/types"

export default function TutorialPage() {
  const params = useParams()
  const id = params.id as string
  const { tutorials, user, problems, setProblems, incrementTutorialUpvotes, createComment, reportProblem } = useAuth()

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

  const handleReportProblem = async (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => {
    if (!user) {
      return
    }

    try {
      await reportProblem(problem)
    } catch (error) {
      console.error('Erro ao relatar problema:', error)
    }
  }

  const handleCreateComment = async (content: string) => {
    if (!tutorial) {
      return
    }

    try {
      await createComment(tutorial.id, content)
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
    }
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
