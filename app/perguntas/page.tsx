"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, ThumbsUp, Plus, X, Send, CheckCircle, TrendingUp, Filter, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { categories, type TutorialRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function PerguntasPage() {
  const { user, requests, setRequests, refreshData } = useAuth()
  const supabase = createClient()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "popular">("popular")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(categories[0])

  const filteredRequests = requests
    .filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || r.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.upvotes - a.upvotes
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const handleCreateRequest = async () => {
    if (!user || !title.trim() || !description.trim()) return

    const { error } = await supabase
      .from('tutorial_requests')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category
      })

    if (error) {
      console.error(error)
      return
    }

    await refreshData()
    setTitle("")
    setDescription("")
    setCategory(categories[0])
    setIsCreating(false)
  }

  const handleUpvote = (requestId: string) => {
    if (!user) return

    setRequests(
      requests.map((r) => {
        if (r.id === requestId) {
          const hasUpvoted = r.upvotedBy.includes(user.id)
          return {
            ...r,
            upvotes: hasUpvoted ? r.upvotes - 1 : r.upvotes + 1,
            upvotedBy: hasUpvoted ? r.upvotedBy.filter((id) => id !== user.id) : [...r.upvotedBy, user.id],
          }
        }
        return r
      }),
    )
  }

  return (
    <div className="bg-background">
      <div className="py-8 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm border border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <MessageCircle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                Perguntas e Requisições
              </h1>
              <p className="text-muted-foreground mt-1">
                Peça tutoriais que você gostaria de ver. A comunidade pode criar!
              </p>
            </div>
            {user ? (
              <Button onClick={() => setIsCreating(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Nova Requisição
              </Button>
            ) : (
              <Link href="/entrar">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">Entrar para Pedir</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Create Request Modal */}
        {isCreating && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl border border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Pedir um Tutorial</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">O que você quer aprender?</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Como configurar Docker no Windows"
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descreva melhor sua dúvida</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explique o que você precisa aprender e por quê..."
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    disabled={!title.trim() || !description.trim()}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 mb-6 shadow-sm border border-border">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar requisições..."
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Todas Categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy("popular")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  sortBy === "popular"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setSortBy("recent")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === "recent"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                Recentes
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`bg-card rounded-xl p-5 shadow-sm border transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  request.answered ? "border-green-500/50 bg-green-500/5" : "border-border hover:shadow-md"
                }`}
              >
                <div className="flex gap-4">
                  {/* Upvote */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleUpvote(request.id)}
                      disabled={!user}
                      className={`p-2 rounded-lg transition-colors ${
                        user && request.upvotedBy.includes(user.id)
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "hover:bg-secondary text-muted-foreground"
                      } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-foreground">{request.upvotes}</span>
                    <span className="text-xs text-muted-foreground">votos</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">
                        {request.category}
                      </span>
                      {request.answered && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Respondido
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">{request.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{request.description}</p>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {request.userName.charAt(0)}
                        </div>
                        <span className="text-muted-foreground">{request.userName}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{request.createdAt}</span>
                    </div>

                    {request.answered && request.answeredTutorialId && (
                      <Link
                        href={`/tutorial/${request.answeredTutorialId}`}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Ver Tutorial
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma requisição encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory
                  ? "Tente ajustar os filtros de busca."
                  : "Seja o primeiro a pedir um tutorial!"}
              </p>
              {user && (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Requisição
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-br from-amber-600/20 to-amber-500/10 rounded-xl p-6 border border-amber-500/30">
          <h3 className="font-bold text-foreground mb-2">Como funciona?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              Crie uma requisição descrevendo o que você quer aprender
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              Outros usuários votam nas requisições que também querem ver
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              Contribuidores da comunidade criam tutoriais para as mais votadas
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
