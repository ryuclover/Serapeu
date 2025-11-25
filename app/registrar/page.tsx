"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { useAuth } from "@/lib/auth-context"
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Password strength
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (strengthScore < 2) {
      setError("A senha precisa ser mais forte")
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setError("Aceite os termos para continuar")
      setIsLoading(false)
      return
    }

    const { data, error } = await signUp(email, password, name)

    if (error) {
      setError(error.message || "Erro ao criar conta")
      setIsLoading(false)
      return
    }

    if (data?.user && !data.session) {
      router.push("/verifique-seu-email")
      return
    }

    router.push("/")
  }

  return (
    <div className="bg-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Logo className="w-14 h-14 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
            <p className="text-muted-foreground mt-2">Junte-se à comunidade Serapeu</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strengthScore >= level
                            ? strengthScore === 1
                              ? "bg-red-500"
                              : strengthScore === 2
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> 8+ caracteres
                    </span>
                    <span
                      className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Maiúscula
                    </span>
                    <span
                      className={`flex items-center gap-1 ${passwordStrength.hasNumber ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Número
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                    confirmPassword && confirmPassword !== password ? "border-destructive" : "border-border"
                  }`}
                  required
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-destructive mt-1">As senhas não coincidem</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-border text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-muted-foreground">
                Eu aceito os{" "}
                <button type="button" className="text-amber-600 dark:text-amber-400 hover:underline">
                  Termos de Uso
                </button>{" "}
                e{" "}
                <button type="button" className="text-amber-600 dark:text-amber-400 hover:underline">
                  Política de Privacidade
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link href="/entrar" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
