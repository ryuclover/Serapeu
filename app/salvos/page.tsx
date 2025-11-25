"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, ChevronRight, Clock, BookOpen, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function SavedTutorialsPage() {
  const { user, tutorials } = useAuth()
  const [savedList, setSavedList] = useState<typeof tutorials>([])

  useEffect(() => {
    if (user?.savedTutorials && tutorials.length > 0) {
      const filtered = tutorials.filter((t) => user.savedTutorials?.includes(t.id))
      setSavedList(filtered)
    } else {
      setSavedList([])
    }
  }, [user, tutorials])

  if (!user) {
    return (
      <div className="bg-background py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-sm border border-border">
          <Bookmark className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso necessário</h1>
          <p className="text-muted-foreground mb-6">
            Entre na sua conta para ver seus tutoriais salvos.
          </p>
          <Link href="/entrar">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Entrar Agora
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Bookmark className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tutoriais Salvos</h1>
            <p className="text-muted-foreground">Sua coleção pessoal de conhecimento</p>
          </div>
        </div>

        {savedList.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedList.map((tutorial) => (
              <Link
                key={tutorial.id}
                href={`/tutorial/${tutorial.id}`}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                      {tutorial.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tutorial.createdAt}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {tutorial.description}
                  </p>
                </div>

                <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{tutorial.steps.length} passos</span>
                  </div>
                  <span className="flex items-center text-amber-600 font-medium text-xs group-hover:translate-x-1 transition-transform">
                    Ler Tutorial <ChevronRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum tutorial salvo</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Você ainda não salvou nenhum tutorial. Navegue pela plataforma e clique no ícone de salvar para guardar seus favoritos aqui.
            </p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Explorar Tutoriais
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
