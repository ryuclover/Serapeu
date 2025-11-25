"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

export default function EmailConfirmedPage() {
  const { user } = useAuth()
  
  useEffect(() => {
    // Força uma verificação de sessão ao carregar a página
    const supabase = createClient()
    supabase.auth.refreshSession()
  }, [])

  return (
    <div className="bg-background flex items-center justify-center p-4 py-24">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-xl border border-border text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">E-mail Confirmado!</h1>
        <p className="text-muted-foreground mb-8">
          Sua conta foi verificada com sucesso. Agora você tem acesso completo à plataforma Serapeu.
        </p>

        <Link href="/">
          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-lg gap-2 rounded-xl font-medium shadow-lg shadow-amber-600/20">
            Ir para a Página Inicial
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
