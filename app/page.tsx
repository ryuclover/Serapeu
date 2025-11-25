"use client"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { TrendingUp, MessageCircle, PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { categories } from "@/lib/types"
import { TutorialCard } from "@/components/tutorial-card"

export default function HomePage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const { user, tutorials } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const approvedTutorials = tutorials.filter((t) => t.approved)

  const filteredTutorials = approvedTutorials.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-background">
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Menu</h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Em Alta
                  </button>
                  <Link
                    href="/perguntas"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Perguntas
                  </Link>
                  {user && (
                    <Link
                      href="/criar"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Contribuir
                    </Link>
                  )}
                </nav>
              </div>

              <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Categorias
                </h3>
                <nav className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-card rounded-xl p-6 mb-6 shadow-sm border border-border animate-in fade-in duration-300">
              <h1 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao Serapeu</h1>
              <p className="text-muted-foreground">O lugar onde o conhecimento é compartilhado passo a passo.</p>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">
                {selectedCategory ? `Tutoriais de ${selectedCategory}` : "Tutoriais em Alta"}
              </h2>
            </div>

            <div className="space-y-4">
              {filteredTutorials.length > 0 ? (
                filteredTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))
              ) : (
                <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum tutorial encontrado.</p>
                </div>
              )}
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gradient-to-br from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600 rounded-xl p-5 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">Sobre o Serapeu</h3>
                <p className="text-amber-100 text-sm mb-4">
                  Uma comunidade colaborativa para compartilhar conhecimento prático. Pergunte, ensine e aprenda.
                </p>
                {user ? (
                  <Link
                    href="/criar"
                    className="block w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors text-center"
                  >
                    Criar Tutorial
                  </Link>
                ) : (
                  <Link
                    href="/entrar"
                    className="block w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors text-center"
                  >
                    Entrar para Contribuir
                  </Link>
                )}
              </div>

              <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
                <h3 className="font-bold text-foreground mb-3">Regras da Comunidade</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    Seja gentil e prestativo.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    Tutoriais precisam ser claros.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    Sem conteúdo ofensivo.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    Admin aprova novos tutoriais.
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
