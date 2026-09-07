"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { User, BookOpen, ThumbsUp, Calendar, ChevronLeft, Shield, Loader2 } from "lucide-react"
import { TutorialCard } from "@/components/tutorial-card"
import type { Tutorial } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface PublicProfile {
  id: string
  name: string
  role: string
  createdAt: string
  totalTutorials: number
  totalUpvotes: number
}

export default function PublicProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/users/${id}`)
        const data = await res.json()
        if (isMounted) {
          if (data.success) {
            setProfile(data.profile)
            setTutorials(data.tutorials || [])
          } else {
            setProfile(null)
          }
        }
      } catch (err) {
        if (isMounted) setProfile(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p>Carregando perfil público...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] py-16 px-4">
        <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground mb-2">Usuário não encontrado</h2>
          <p className="text-muted-foreground text-sm mb-6">
            O perfil que você tentou acessar não existe ou foi excluído.
          </p>
          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
              <ChevronLeft className="w-4 h-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb / Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Home
        </Link>

        {/* Card do Perfil */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg flex-shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.name}</h1>
                {profile.role === "ADMIN" && (
                  <span className="inline-flex items-center self-center sm:self-auto gap-1 px-2.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Membro desde {profile.createdAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  {profile.totalTutorials} {profile.totalTutorials === 1 ? "tutorial publicado" : "tutoriais publicados"}
                </span>
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-amber-500" />
                  {profile.totalUpvotes} votos recebidos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tutoriais do autor */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Tutoriais de {profile.name}
          </h2>

          {tutorials.length > 0 ? (
            <div className="space-y-4">
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">Este autor ainda não publicou tutoriais aprovados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
