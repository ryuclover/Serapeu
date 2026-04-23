"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const params = new URLSearchParams(window.location.search)
      const next = params.get("next") ?? "/"
      const code = params.get("code")

      if (!code) {
        router.replace(next)
        return
      }

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setError(error.message)
          return
        }

        const session = data?.session
        if (!session) {
          setError("Falha ao obter sessão de login")
          return
        }

        window.location.replace(next)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message || "Erro desconhecido ao finalizar login")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-foreground mb-4">Processando login</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Aguarde enquanto finalizamos sua autenticação.
        </p>
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Ocorreu um erro ao finalizar o login: {error}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Spinner className="h-10 w-10 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  )
}
