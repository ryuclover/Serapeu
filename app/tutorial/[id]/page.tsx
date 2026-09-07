"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import TutorialTemplate from "@/components/tutorial-template"
import type { Tutorial, TutorialProblem } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function TutorialPage() {
  const params = useParams()
  const id = params.id as string
  const { tutorials, user, problems, incrementTutorialUpvotes, createComment, reportProblem } = useAuth()

  const [tutorial, setTutorial] = useState<Tutorial | null>(() => {
    return tutorials.find((t) => t.id === id) || null
  })
  const [loading, setLoading] = useState(!tutorial)

  useEffect(() => {
    const memoryTutorial = tutorials.find((t) => t.id === id)
    if (memoryTutorial) {
      setTutorial(memoryTutorial)
      setLoading(false)
      return
    }

    let isMounted = true
    async function fetchTutorial() {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/tutorials/${id}`)
        const data = await res.json()
        if (isMounted) {
          if (data.success && data.tutorial) {
            setTutorial(data.tutorial)
          } else {
            setTutorial(null)
          }
        }
      } catch (err) {
        if (isMounted) setTutorial(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTutorial()
    return () => {
      isMounted = false
    }
  }, [id, tutorials])

  const handleUpvote = async () => {
    if (!tutorial) return

    try {
      await incrementTutorialUpvotes(id)
      setTutorial(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null)
    } catch (error) {
      console.error('Erro ao registrar upvote:', error)
    }
  }

  const handleReportProblem = async (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => {
    if (!user) return
    try {
      await reportProblem(problem)
    } catch (error) {
      console.error('Erro ao relatar problema:', error)
    }
  }

  const handleCreateComment = async (content: string) => {
    if (!tutorial) return
    try {
      await createComment(tutorial.id, content)
      // Recarrega comentários
      const res = await fetch(`/api/tutorials/${id}`)
      const data = await res.json()
      if (data.success && data.tutorial) {
        setTutorial(data.tutorial)
      }
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p>Carregando tutorial...</p>
        </div>
      </div>
    )
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
