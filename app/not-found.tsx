import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <Logo className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-destructive">?</span>
            </div>
          </div>
        </div>

        <h1 className="text-7xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Ops! A página que você está procurando não existe ou foi movida. Verifique se o endereço está correto ou volte
          para a página inicial.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Página Inicial
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <Link href="/">
              <Search className="w-4 h-4" />
              Buscar Tutoriais
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Links úteis:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="text-primary hover:underline">
              Em Alta
            </Link>
            <Link href="/" className="text-primary hover:underline">
              Perguntas
            </Link>
            <Link href="/criar" className="text-primary hover:underline">
              Criar Tutorial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
