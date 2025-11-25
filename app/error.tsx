"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-destructive" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-destructive mb-2">Erro Inesperado</h1>
        <h2 className="text-xl font-semibold mb-4">Algo deu errado</h2>
        <p className="text-muted-foreground mb-8">
          Desculpe, ocorreu um erro inesperado ao processar sua solicitação. Nossa equipe foi notificada e está
          trabalhando para resolver o problema.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted px-3 py-2 rounded-md">
            Código do erro: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <Link href="/">
              <Home className="w-4 h-4" />
              Página Inicial
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Se o problema persistir, entre em contato com o{" "}
            <Link href="/" className="text-primary hover:underline">
              suporte
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
