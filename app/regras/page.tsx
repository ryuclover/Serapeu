import { Metadata } from "next"
import { HeartHandshake, CheckSquare, ShieldBan, Flag } from "lucide-react"

export const metadata: Metadata = {
  title: "Regras da Comunidade | Serapeu",
  description: "Regras da Comunidade do Serapeu",
}

export default function RegrasPage() {
  const sections = [
    {
      icon: HeartHandshake,
      title: "Respeito e Empatia",
      content: "Trate todos os membros com respeito. O Serapeu é um ambiente de aprendizado seguro. Não toleramos discurso de ódio, assédio ou qualquer forma de discriminação."
    },
    {
      icon: CheckSquare,
      title: "Qualidade do Conteúdo",
      content: "Esforce-se para criar tutoriais claros e úteis. Ao fazer perguntas, seja específico e forneça o contexto necessário para que outros possam ajudá-lo."
    },
    {
      icon: ShieldBan,
      title: "Sem Spam ou Autopromoção",
      content: "Não publique conteúdo irrelevante, repetitivo ou puramente comercial. Links para recursos úteis são permitidos desde que adicionem valor real à discussão."
    },
    {
      icon: Flag,
      title: "Ajude a Moderar",
      content: "Se você encontrar conteúdo que viole nossas regras, use as ferramentas de denúncia para alertar nossa equipe de moderação."
    }
  ]

  return (
    <div className="bg-background min-h-screen">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600 py-16 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-white animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/20 p-3 rounded-2xl">
            <HeartHandshake className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Regras da Comunidade</h1>
            <p className="text-amber-100 mt-2 text-lg">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-12 px-4 -mt-8 relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-10 animate-in fade-in duration-700">
          <div className="grid gap-8 md:grid-cols-2">
            {sections.map((section, index) => (
              <div key={index} className="bg-background p-6 rounded-xl border border-border hover:border-amber-500/50 transition-colors">
                <div className="flex items-center gap-3 text-foreground mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{index + 1}. {section.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
