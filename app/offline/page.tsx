"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { WifiOff, RefreshCw, Home } from "lucide-react"

export default function Offline() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <Logo className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Você está offline</h1>
        <h2 className="text-xl text-muted-foreground mb-6">Sem conexão com a internet</h2>

        <p className="text-muted-foreground mb-8">
          Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
        </p>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="font-medium mb-3">Dicas para reconectar:</h3>
          <ul className="text-sm text-muted-foreground text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Verifique se o Wi-Fi está ativado
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Reinicie seu roteador
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Tente usar dados móveis
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2">
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
      </div>
    </div>
  )
}
