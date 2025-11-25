import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Wrench, Clock, Home } from "lucide-react"

export default function Maintenance() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Logo className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Em Manutenção</h1>
        <h2 className="text-xl text-muted-foreground mb-6">Voltamos em breve!</h2>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-2 text-primary mb-3">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Tempo estimado</span>
          </div>
          <p className="text-2xl font-bold">~30 minutos</p>
        </div>

        <p className="text-muted-foreground mb-8">
          Estamos realizando melhorias para oferecer uma experiência ainda melhor. Agradecemos sua paciência!
        </p>

        <Button asChild className="gap-2 mb-6">
          <Link href="/">
            <Home className="w-4 h-4" />
            Página Inicial
          </Link>
        </Button>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Enquanto isso, siga-nos nas redes sociais para atualizações:</p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              Twitter
            </a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              Discord
            </a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
