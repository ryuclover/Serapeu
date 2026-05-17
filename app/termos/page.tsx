import { Metadata } from "next"
import { Scale, BookOpen, Users, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Uso | Serapeu",
  description: "Termos de uso do Serapeu",
}

export default function TermosPage() {
  const sections = [
    {
      icon: Scale,
      title: "Aceitação dos Termos",
      content: "Ao acessar e usar o Serapeu, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma."
    },
    {
      icon: BookOpen,
      title: "Uso da Plataforma",
      content: "O Serapeu é uma plataforma comunitária de aprendizado. Você concorda em usar a plataforma apenas para fins legais e de maneira que não infrinja os direitos de terceiros ou restrinja o uso da plataforma por outros usuários."
    },
    {
      icon: Users,
      title: "Conteúdo do Usuário",
      content: "Ao publicar tutoriais ou responder perguntas, você mantém os direitos autorais do seu conteúdo, mas concede ao Serapeu uma licença mundial, não exclusiva e isenta de royalties para usar, reproduzir e exibir esse conteúdo."
    },
    {
      icon: AlertCircle,
      title: "Modificações",
      content: "Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas aos usuários."
    }
  ]

  return (
    <div className="bg-background min-h-screen">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600 py-16 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-white animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Termos de Uso</h1>
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
