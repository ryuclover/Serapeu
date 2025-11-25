"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ThumbsUp,
  BookOpen,
  Clock,
  User,
  Share2,
  Bookmark,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Send,
  X,
} from "lucide-react"
import type { Tutorial, UserType, TutorialProblem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface TutorialTemplateProps {
  tutorial: Tutorial | null
  user: UserType | null
  onUpvote: () => void
  problems: TutorialProblem[]
  onReportProblem: (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => void
}

function TutorialNotFound() {
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto text-center">
      <div className="bg-card rounded-2xl p-10 shadow-sm border border-border">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Tutorial não encontrado</h1>
        <p className="text-muted-foreground mb-6">O tutorial que você procura não existe ou foi removido.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Home
        </Link>
      </div>
    </div>
  )
}

function TutorialHeader({ tutorial }: { tutorial: Tutorial }) {
  const { user, toggleSaveTutorial } = useAuth()
  const isSaved = user?.savedTutorials?.includes(tutorial.id)

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Category & Status */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium rounded-full">
          {tutorial.category}
        </span>
        {tutorial.approved && (
          <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verificado
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">{tutorial.title}</h1>

      {/* Description */}
      <p className="text-lg text-muted-foreground mb-6">{tutorial.description}</p>

      {/* Author info */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
            {tutorial.authorName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{tutorial.authorName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {tutorial.createdAt}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleSaveTutorial(tutorial.id)}
            className={`p-2 hover:bg-secondary rounded-lg transition-colors ${isSaved ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-foreground"}`}
            title={isSaved ? "Remover dos salvos" : "Salvar tutorial"}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

function TutorialSteps({ steps }: { steps: string[] }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        Passo a Passo
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 bg-secondary/50 rounded-xl border border-border/50 hover:border-amber-500/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                {index + 1}
              </div>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-foreground leading-relaxed">{step}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TutorialProblems({
  tutorial,
  user,
  problems,
  onReportProblem,
}: {
  tutorial: Tutorial
  user: UserType | null
  problems: TutorialProblem[]
  onReportProblem: (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [description, setDescription] = useState("")

  const tutorialProblems = problems.filter((p) => p.tutorialId === tutorial.id)

  const handleSubmit = () => {
    if (!user || !description.trim()) return

    onReportProblem({
      tutorialId: tutorial.id,
      userId: user.id,
      userName: user.name,
      stepNumber: selectedStep,
      description: description.trim(),
    })

    setDescription("")
    setSelectedStep(null)
    setIsOpen(false)
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Problemas Relatados
          {tutorialProblems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm rounded-full">
              {tutorialProblems.length}
            </span>
          )}
        </h2>
        {user && (
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="outline"
            size="sm"
            className="gap-2 border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
          >
            <AlertTriangle className="w-4 h-4" />
            Relatar Problema
          </Button>
        )}
      </div>

      {/* Formulário de relato */}
      {isOpen && user && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Relatar um problema</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Em qual passo? (opcional)</label>
              <select
                value={selectedStep ?? ""}
                onChange={(e) => setSelectedStep(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Problema geral do tutorial</option>
                {tutorial.steps.map((_, index) => (
                  <option key={index} value={index + 1}>
                    Passo {index + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descreva o problema</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: O comando não funcionou no meu sistema..."
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!description.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Relato
            </Button>
          </div>
        </div>
      )}

      {/* Lista de problemas */}
      {tutorialProblems.length > 0 ? (
        <div className="space-y-3">
          {tutorialProblems.map((problem) => (
            <div
              key={problem.id}
              className={`p-4 rounded-xl border ${
                problem.resolved ? "bg-green-500/10 border-green-500/30" : "bg-secondary/50 border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {problem.userName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-sm">{problem.userName}</span>
                    <span className="text-muted-foreground text-xs ml-2">{problem.createdAt}</span>
                  </div>
                </div>
                {problem.stepNumber && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                    Passo {problem.stepNumber}
                  </span>
                )}
                {problem.resolved && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Resolvido
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-secondary/30 rounded-xl">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-muted-foreground">Nenhum problema relatado ainda.</p>
          <p className="text-muted-foreground text-sm">Teve alguma dificuldade? Nos avise!</p>
        </div>
      )}

      {!user && (
        <div className="mt-4 text-center py-4 bg-secondary/30 rounded-xl">
          <p className="text-muted-foreground text-sm mb-2">Entre para relatar problemas</p>
          <Link
            href="/entrar"
            className="inline-flex px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Entrar
          </Link>
        </div>
      )}
    </div>
  )
}

function TutorialComments({ user }: { user: UserType | null }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        Comentários
      </h2>

      {user ? (
        <div className="flex gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Escreva um comentário..."
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              rows={3}
            />
            <button className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
              Comentar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-secondary/30 rounded-xl">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-3">Entre para deixar um comentário</p>
          <Link
            href="/entrar"
            className="inline-flex px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
          >
            Entrar
          </Link>
        </div>
      )}

      <p className="text-center text-muted-foreground py-4">Nenhum comentário ainda. Seja o primeiro!</p>
    </div>
  )
}

function TutorialSidebar({
  tutorial,
  onUpvote,
}: {
  tutorial: Tutorial
  onUpvote: () => void
}) {
  const { user, toggleSaveTutorial } = useAuth()
  const isSaved = user?.savedTutorials?.includes(tutorial.id)

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border sticky top-24 animate-in fade-in slide-in-from-right-2 duration-300">
      <h3 className="font-semibold text-foreground mb-4">Este tutorial foi útil?</h3>

      <button
        onClick={onUpvote}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-400 rounded-xl hover:from-amber-500/30 hover:to-amber-600/30 transition-all font-medium mb-3"
      >
        <ThumbsUp className="w-5 h-5" />
        {tutorial.upvotes} Votos Úteis
      </button>

      {user && (
        <button
          onClick={() => toggleSaveTutorial(tutorial.id)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium mb-4 ${
            isSaved
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          {isSaved ? "Salvo" : "Salvar Tutorial"}
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="p-3 bg-secondary/50 rounded-xl">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
          <span className="text-foreground font-medium">{tutorial.steps.length}</span>
          <p className="text-muted-foreground">Passos</p>
        </div>
        <div className="p-3 bg-secondary/50 rounded-xl">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
          <span className="text-foreground font-medium">~{tutorial.steps.length * 2}</span>
          <p className="text-muted-foreground">min</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">Compartilhar</h4>
        <div className="flex gap-2">
          <button className="flex-1 p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </button>
          <button className="flex-1 p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </button>
          <button className="flex-1 p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.452-4.434-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TutorialTemplate({
  tutorial,
  user,
  onUpvote,
  problems,
  onReportProblem,
}: TutorialTemplateProps) {
  const router = useRouter()

  if (!tutorial) {
    return <TutorialNotFound />
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <article className="lg:col-span-2 space-y-6">
          <TutorialHeader tutorial={tutorial} />
          <TutorialSteps steps={tutorial.steps} />
          <TutorialProblems tutorial={tutorial} user={user} problems={problems} onReportProblem={onReportProblem} />
          <TutorialComments user={user} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <TutorialSidebar tutorial={tutorial} onUpvote={onUpvote} />
        </aside>
      </div>
    </div>
  )
}
