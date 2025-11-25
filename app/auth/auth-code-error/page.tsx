"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  // Note: Hash parameters are not accessible via useSearchParams on the server or initial render easily in all setups, 
  // but often Supabase puts errors in query params too. 
  // If they are in the hash, we might need client-side logic to read window.location.hash, 
  // but for now let's provide a generic helpful message.
  
  return (
    <div className="bg-background flex items-center justify-center p-4 py-24">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-xl border border-border text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Link Inválido ou Expirado</h1>
        <p className="text-muted-foreground mb-8">
          O link de confirmação que você clicou não é mais válido. Isso pode acontecer se ele já foi usado ou se expirou.
        </p>

        <div className="space-y-3">
          <Link href="/entrar" className="block">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-lg gap-2 rounded-xl font-medium shadow-lg shadow-amber-600/20">
              Tentar Entrar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full h-12 text-lg gap-2 rounded-xl font-medium">
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
