import { Metadata } from "next"
import { Mail, MapPin, MessageSquare, Send } from "lucide-react"

export const metadata: Metadata = {
  title: "Contato | Serapeu",
  description: "Entre em contato com o Serapeu",
}

export default function ContatoPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600 py-16 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-white animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/20 p-3 rounded-2xl">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Fale Conosco</h1>
            <p className="text-amber-100 mt-2 text-lg">Estamos aqui para ajudar com dúvidas e sugestões</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-12 px-4 -mt-8 relative z-10">
        <div className="grid gap-8 md:grid-cols-5 animate-in fade-in duration-700">
          
          {/* Informações de contato */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-6 h-full">
              <h3 className="text-xl font-semibold mb-6">Informações</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">E-mail</h4>
                    <p className="text-sm text-muted-foreground mt-1">suporte@serapeu.com</p>
                    <p className="text-sm text-muted-foreground">contato@serapeu.com</p>
                  </div>
                </div>
                
                <div className="h-px bg-border/50 w-full" />
                
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">Localização</h4>
                    <p className="text-sm text-muted-foreground mt-1">Operando remotamente</p>
                    <p className="text-sm text-muted-foreground">no Brasil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulário */}
          <div className="md:col-span-3">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6">Envie uma mensagem</h3>
              
              <form className="flex flex-col gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Nome</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-colors" 
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-colors" 
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-sm font-medium">Assunto</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-colors" 
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-medium">Mensagem</label>
                  <textarea 
                    id="message" 
                    className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-colors resize-y" 
                    placeholder="Escreva sua mensagem aqui..."
                  />
                </div>
                
                <button 
                  type="button" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all bg-amber-600 text-white hover:bg-amber-700 h-11 px-6 mt-2 shadow-md hover:shadow-lg w-full sm:w-auto self-end"
                >
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
