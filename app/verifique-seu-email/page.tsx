import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <div className="bg-background flex items-center justify-center p-4 py-24">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-xl border border-border text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Verifique seu E-mail</h1>
        <p className="text-muted-foreground mb-8">
          Enviamos um link de confirmação para o seu endereço de e-mail. Clique nele para ativar sua conta e fazer login automaticamente.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Não recebeu? Verifique sua caixa de spam ou tente se registrar novamente com outro e-mail.
          </p>
          
          <Link href="/entrar">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
