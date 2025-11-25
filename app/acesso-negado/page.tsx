import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldX, Home, LogIn } from "lucide-react"

export default function AccessDenied() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-16 h-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-destructive mb-2">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground mb-8">
          Você não tem permissão para acessar esta página. Se você acredita que isso é um erro, faça login com uma conta
          autorizada.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/entrar">
              <LogIn className="w-4 h-4" />
              Fazer Login
            </Link>
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
            Precisa de acesso?{" "}
            <Link href="/registrar" className="text-primary hover:underline">
              Crie uma conta
            </Link>{" "}
            ou entre em contato com um administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
