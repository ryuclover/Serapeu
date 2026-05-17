import { Metadata } from "next"
import { Shield, Database, Lock, Eye } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacidade | Serapeu",
  description: "Política de Privacidade do Serapeu",
}

export default function PrivacidadePage() {
  const sections = [
    {
      icon: Database,
      title: "Coleta de Dados",
      content: "Coletamos as informações que você nos fornece diretamente, como nome, endereço de e-mail e informações de perfil quando você cria uma conta no Serapeu."
    },
    {
      icon: Eye,
      title: "Uso das Informações",
      content: "Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, além de personalizar sua experiência na plataforma e comunicar atualizações importantes."
    },
    {
      icon: Lock,
      title: "Compartilhamento de Dados",
      content: "Não vendemos suas informações pessoais a terceiros. Podemos compartilhar dados apenas quando necessário para fornecer nossos serviços (ex: infraestrutura de hospedagem) ou quando exigido por lei."
    },
    {
      icon: Shield,
      title: "Segurança",
      content: "Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição."
    }
  ]

  return (
    <div className="bg-background min-h-screen">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600 py-16 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-white animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Política de Privacidade</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-12 px-4 -mt-8 relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-10 animate-in fade-in duration-700">
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3 text-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <section.icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-semibold">{index + 1}. {section.title}</h2>
                </div>
                <p className="pl-11">
                  {section.content}
                </p>
                {index < sections.length - 1 && <div className="h-px bg-border/50 w-full mt-8" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
