"use client"

import Link from "next/link"
import { BookOpen, ThumbsUp, Bookmark } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Tutorial } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TutorialCardProps {
  tutorial: Tutorial
  className?: string
}

export function TutorialCard({ tutorial, className }: TutorialCardProps) {
  const { user, toggleSaveTutorial } = useAuth()

  const isSaved = !!user?.savedTutorials?.includes(tutorial.id)

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleSaveTutorial(tutorial.id)
  }

  return (
    <Link
      href={`/tutorial/${tutorial.id}`}
      className={cn(
        "block bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300 relative",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleToggleSave}
        className={cn(
          "absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/80 backdrop-blur text-muted-foreground hover:text-amber-600 hover:border-amber-500 transition-colors",
          !user && "cursor-not-allowed opacity-70",
        )}
        aria-label={isSaved ? "Remover dos salvos" : "Salvar tutorial"}
      >
        <Bookmark className={cn("w-4 h-4", isSaved && "fill-amber-500 text-amber-500")} />
      </button>

      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="text-amber-600 dark:text-amber-400 font-medium">{tutorial.authorName}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{tutorial.createdAt}</span>
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
          Resposta
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{tutorial.title}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{tutorial.description}</p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          {tutorial.upvotes} Votos Úteis
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {tutorial.steps.length} Passos
        </span>
      </div>
    </Link>
  )
}
