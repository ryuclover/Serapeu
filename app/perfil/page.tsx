"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Mail,
  Save,
  Loader2,
  Shield,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  Trash2,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { profileUpdateSchema } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, tutorials, requests, deleteTutorial, deleteComment } = useAuth()
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setName(user.name)
    } else {
      router.push("/entrar")
    }
  }, [user, router])

  // Tutoriais criados pelo usuário
  const myTutorials = useMemo(() => {
    if (!user) return []
    return tutorials.filter((t) => t.authorId === user.id)
  }, [tutorials, user])

  // Comentários feitos pelo usuário em todos os tutoriais
  const myComments = useMemo(() => {
    if (!user) return []
    const list: Array<{
      id: string
      content: string
      createdAt: string
      tutorialId: string
      tutorialTitle: string
      tutorialCategory: string
    }> = []

    for (const t of tutorials) {
      for (const c of t.comments || []) {
        if (c.userId === user.id) {
          list.push({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            tutorialId: t.id,
            tutorialTitle: t.title,
            tutorialCategory: t.category,
          })
        }
      }
    }
    return list
  }, [tutorials, user])

  // Perguntas feitas pelo usuário
  const myRequests = useMemo(() => {
    if (!user) return []
    return requests.filter((r) => r.userId === user.id)
  }, [requests, user])

  // Total de upvotes recebidos nos tutoriais
  const totalUpvotes = useMemo(() => {
    return myTutorials.reduce((acc, t) => acc + (t.upvotes || 0), 0)
  }, [myTutorials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setErrors({})

    const validation = profileUpdateSchema.safeParse({ name })

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        const path = error.path[0]?.toString()
        if (path) {
          fieldErrors[path] = error.message
        }
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    const { error } = await updateProfile(name)

    if (error) {
      setMessage({ type: "error", text: "Erro ao atualizar perfil. Tente novamente." })
    } else {
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
    }
    setIsLoading(false)
  }

  const handleDeleteTutorial = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o tutorial "${title}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteTutorial(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteComment = async (tutorialId: string, commentId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este comentário?")) {
      return
    }

    setDeletingId(commentId)
    try {
      await deleteComment(tutorialId, commentId)
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Cabeçalho do Perfil */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{user.name}</h1>
                  {user.role === "ADMIN" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
                      <Shield className="w-3.5 h-3.5" />
                      Administrador
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Ações Rápidas do Topo */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link href="/criar" className="flex-1 md:flex-initial">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Tutorial
                </Button>
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="flex-1 md:flex-initial">
                  <Button variant="outline" className="w-full gap-2 border-amber-600/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                    <Shield className="w-4 h-4" />
                    Painel Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="bg-secondary/40 rounded-xl p-4">
              <span className="text-xs text-muted-foreground block font-medium">Meus Tutoriais</span>
              <span className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                {myTutorials.length}
              </span>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4">
              <span className="text-xs text-muted-foreground block font-medium">Comentários Feitos</span>
              <span className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                {myComments.length}
              </span>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4">
              <span className="text-xs text-muted-foreground block font-medium">Upvotes Recebidos</span>
              <span className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                {totalUpvotes}
              </span>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4">
              <span className="text-xs text-muted-foreground block font-medium">Perguntas Abertas</span>
              <span className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-500" />
                {myRequests.length}
              </span>
            </div>
          </div>
        </div>

        {/* Abas de Navegação do Perfil */}
        <Tabs defaultValue="tutorials" className="w-full">
          <TabsList className="bg-card border border-border p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-6">
            <TabsTrigger
              value="tutorials"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Meus Tutoriais</span>
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-secondary/80 font-bold">
                {myTutorials.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Meus Comentários</span>
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-secondary/80 font-bold">
                {myComments.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Minhas Perguntas</span>
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-secondary/80 font-bold">
                {myRequests.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <User className="w-4 h-4" />
              <span>Dados da Conta</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. Aba: Meus Tutoriais */}
          <TabsContent value="tutorials" className="space-y-4">
            {myTutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full">
                          {tutorial.category}
                        </span>
                        {tutorial.approved ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Em Análise
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-foreground line-clamp-2 hover:text-amber-600 transition-colors">
                        <Link href={`/tutorial/${tutorial.id}`}>{tutorial.title}</Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {tutorial.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {tutorial.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {(tutorial.comments || []).length}
                        </span>
                        <span>{tutorial.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/tutorial/${tutorial.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === tutorial.id}
                          onClick={() => handleDeleteTutorial(tutorial.id, tutorial.title)}
                          className="h-8 gap-1 text-xs"
                        >
                          {deletingId === tutorial.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">Você ainda não publicou nenhum tutorial</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                  Compartilhe seu conhecimento passo a passo com a comunidade do Serapeu.
                </p>
                <Link href="/criar">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Meu Primeiro Tutorial
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 2. Aba: Meus Comentários */}
          <TabsContent value="comments" className="space-y-4">
            {myComments.length > 0 ? (
              <div className="space-y-3">
                {myComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-2">
                          <span>Comentado em:</span>
                          <Link
                            href={`/tutorial/${comment.tutorialId}`}
                            className="font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 truncate max-w-md"
                          >
                            {comment.tutorialTitle}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </Link>
                          <span className="px-2 py-0.5 bg-secondary text-foreground rounded-full text-[11px]">
                            {comment.tutorialCategory}
                          </span>
                          <span>•</span>
                          <span>{comment.createdAt}</span>
                        </div>

                        <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 text-sm text-foreground">
                          "{comment.content}"
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === comment.id}
                        onClick={() => handleDeleteComment(comment.tutorialId, comment.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 flex-shrink-0 h-8 px-2"
                        title="Excluir comentário"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">Nenhum comentário realizado ainda</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                  Explore os tutoriais da plataforma e participe com dúvidas, sugestões e elogios!
                </p>
                <Link href="/">
                  <Button variant="outline">Explorar Tutoriais</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 3. Aba: Minhas Perguntas */}
          <TabsContent value="requests" className="space-y-4">
            {myRequests.length > 0 ? (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full">
                          {req.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{req.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-foreground text-base">{req.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-xl text-xs font-semibold flex-shrink-0">
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
                      {req.upvotes} votos
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">Nenhuma pergunta enviada ainda</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                  Tem alguma dúvida ou gostaria de sugerir um tema para a comunidade?
                </p>
                <Link href="/perguntas">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Fazer uma Pergunta
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 4. Aba: Dados da Conta */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border max-w-2xl">
              <h2 className="text-xl font-bold text-foreground mb-2">Configurações da Conta</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Atualize o nome de exibição do seu perfil na plataforma.
              </p>

              {message && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm ${
                    message.type === "success"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Cadastrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="pl-10 bg-secondary/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">O e-mail de acesso não pode ser alterado diretamente.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`pl-10 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="Seu nome"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || name === user.name}
                    className="bg-amber-600 hover:bg-amber-700 text-white h-10 gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
