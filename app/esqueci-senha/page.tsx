"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Logo } from "@/components/logo"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!email) {
      setError("Informe seu e-mail para redefinir a senha.")
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setIsLoading(false)

    if (error) {
      setError("Não foi possível enviar o e-mail de redefinição.")
    } else {
      setMessage("Enviamos um link de redefinição para o seu e-mail.")
    }
  }

  return (
    <div className="bg-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Logo className="w-14 h-14 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Esqueci minha senha</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Informe o e-mail da sua conta e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Enviar link de redefinição"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Lembrou a senha? {""}
            <button
              type="button"
              className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
              onClick={() => router.push("/entrar")}
            >
              Voltar para o login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
