"use client"

import {
  BookOpen,
  Github,
  Heart,
  Users,
  Shield,
  Globe,
  Code,
  ExternalLink,
  MessageCircle,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Coffee,
  Sparkles,
  Target,
  Lightbulb,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function SobrePage() {
  return (
    <main className="min-h-screen pt-20 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-800/20 dark:from-amber-600/10 dark:to-amber-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Conhecimento para todos
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Sobre o <span className="text-amber-600 dark:text-amber-400">Serapeu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Uma plataforma colaborativa criada para democratizar o conhecimento, permitindo que qualquer pessoa
              aprenda e ensine de forma simples e segura.
            </p>
          </div>
        </div>
      </section>

      {/* O que é o Serapeu */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">O que é o Serapeu?</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  O <strong className="text-foreground">Serapeu</strong> é um projeto com a missão de espalhar
                  conhecimento e permitir que todos tenham como aprender e tirar dúvidas sobre algo novo da forma mais
                  simples possível.
                </p>
                <p>
                  Aqui você não precisa entrar em sites duvidosos, não precisa baixar arquivos maliciosos ou assistir
                  tutoriais com 30 minutos de enrolação. O conhecimento é compartilhado de forma direta, passo a passo,
                  pela própria comunidade.
                </p>
                <p>
                  Acreditamos que o conhecimento deve ser livre e acessível a todos, independente de onde você esteja ou
                  quanto dinheiro você tenha.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-amber-700 shadow-2xl">
                <Image
                  src="/ancient-library-with-scrolls-and-books--warm-light.jpg"
                  alt="Biblioteca do conhecimento"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover mix-blend-overlay opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origem do Nome */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 to-amber-800 shadow-2xl">
                <Image
                  src="/ancient-egyptian-serapeum-temple--columns--mystica.jpg"
                  alt="Serapeum - Templo do Conhecimento"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <GraduationCap className="w-16 h-16 mb-4" />
                  <h3 className="text-2xl font-bold text-center">Serapeum</h3>
                  <p className="text-sm text-center text-white/80 mt-2">Templos do Conhecimento da Antiguidade</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-foreground mb-6">A Origem do Nome</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  O nome <strong className="text-amber-600 dark:text-amber-400">Serapeu</strong> vem dos
                  <strong className="text-foreground"> Serapeums</strong> (ou Serapeia), templos da antiguidade
                  dedicados ao deus Serápis, que ficaram famosos por abrigarem grandes bibliotecas e centros de estudo.
                </p>
                <p>
                  O mais conhecido foi o <strong className="text-foreground">Serapeum de Alexandria</strong>, que fazia
                  parte do complexo da lendária Biblioteca de Alexandria - um dos maiores repositórios de conhecimento
                  da história antiga.
                </p>
                <p>
                  Assim como os antigos Serapeums eram templos dedicados à preservação e disseminação do conhecimento,
                  nosso Serapeu moderno tem a mesma missão: ser um espaço onde o saber é compartilhado livremente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Valores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Os pilares que guiam tudo o que fazemos no Serapeu
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Acessibilidade</h3>
              <p className="text-sm text-muted-foreground">
                Conhecimento gratuito e acessível para todos, sem barreiras
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Sem links duvidosos, sem downloads maliciosos, conteúdo verificado
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Comunidade</h3>
              <p className="text-sm text-muted-foreground">Construído pela comunidade, para a comunidade</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Simplicidade</h3>
              <p className="text-sm text-muted-foreground">Tutoriais diretos, sem enrolação, passo a passo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas removed */}

      {/* Open Source */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                <Code className="w-4 h-4" />
                Open Source
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Código Aberto</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  O Serapeu é um projeto de <strong className="text-foreground">código aberto</strong>! Isso significa
                  que qualquer pessoa pode contribuir para melhorar a plataforma.
                </p>
                <p>
                  Se você é desenvolvedor e quer ajudar a tornar o Serapeu ainda melhor, acesse nosso repositório no
                  GitHub. Toda contribuição é bem-vinda, desde correção de bugs até novas funcionalidades.
                </p>
                <p>Juntos podemos construir a melhor plataforma de conhecimento colaborativo da internet!</p>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button asChild className="gap-2">
                  <a href="https://github.com/seu-usuario/serapeu" target="_blank" rel="noopener noreferrer">
                    <Github className="w-5 h-5" />
                    Ver no GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild className="gap-2 bg-transparent">
                  <a href="https://github.com/seu-usuario/serapeu/issues" target="_blank" rel="noopener noreferrer">
                    <Target className="w-5 h-5" />
                    Reportar Bug
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{`# Clone o repositório
git clone https://github.com/seu-usuario/serapeu.git

# Entre na pasta
cd serapeu

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apoie o Projeto */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-600 dark:text-pink-400 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Apoie o Projeto
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Ajude o Serapeu a Crescer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O Serapeu é mantido por voluntários e sua contribuição ajuda a manter o projeto vivo e continuar
              oferecendo conhecimento gratuito para todos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Doação via Livepix</h3>
              <p className="text-muted-foreground mb-6">
                Doe qualquer valor para ajudar a manter o servidor e o desenvolvimento do projeto.
              </p>
              <Button asChild className="w-full gap-2 bg-green-600 hover:bg-green-700">
                <a href="https://livepix.gg/serapeu" target="_blank" rel="noopener noreferrer">
                  <Heart className="w-5 h-5" />
                  Doar via Livepix
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Contribua com Conteúdo</h3>
              <p className="text-muted-foreground mb-6">
                Crie tutoriais, responda perguntas e ajude outros usuários a aprender.
              </p>
              <Button asChild variant="outline" className="w-full gap-2 bg-transparent">
                <Link href="/criar">
                  <BookOpen className="w-5 h-5" />
                  Criar Tutorial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Criador do Projeto */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Criador do Projeto</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Conheça quem está por trás do Serapeu</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-amber-500/20">
                <Image
                  src="/developer-avatar-portrait.png"
                  alt="Foto do criador"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Gabriel M</h3>
              <p className="text-amber-600 dark:text-amber-400 font-medium mb-4">Fundador & Desenvolvedor</p>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Apaixonado por tecnologia e pela ideia de democratizar o conhecimento. Criei o Serapeu para ser o lugar
                que eu gostaria que existisse quando estava aprendendo.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://github.com/ryuclover"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-muted rounded-full text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="mailto:seu@email.com"
                  className="p-3 bg-muted rounded-full text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comunidade Discord */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-700 dark:to-indigo-600 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Entre na Nossa Comunidade</h2>
                <p className="text-indigo-100 mb-6">
                  Participe do nosso servidor no Discord! Tire dúvidas em tempo real, conheça outros membros, sugira
                  melhorias e fique por dentro das novidades.
                </p>
                <Button asChild size="lg" className="gap-2 bg-white text-indigo-600 hover:bg-indigo-50">
                  <a href="https://discord.gg/seu-servidor" target="_blank" rel="noopener noreferrer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                    </svg>
                    Entrar no Discord
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle className="w-24 h-24 text-white/90" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                    500+
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">Dúvidas comuns sobre o Serapeu</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "O Serapeu é gratuito?",
                a: "Sim! O Serapeu é completamente gratuito e sempre será. Acreditamos que o conhecimento deve ser acessível a todos.",
              },
              {
                q: "Como posso contribuir?",
                a: "Você pode contribuir criando tutoriais, respondendo perguntas, reportando bugs no GitHub, ou fazendo uma doação para ajudar a manter o projeto.",
              },
              {
                q: "Preciso ter conta para usar?",
                a: "Não! Você pode acessar todos os tutoriais sem precisar de conta. Porém, para criar tutoriais, comentar ou votar, é necessário se registrar.",
              },
              {
                q: "Os tutoriais são verificados?",
                a: "Sim! Todos os tutoriais passam por uma moderação antes de serem publicados para garantir a qualidade e segurança do conteúdo.",
              },
              {
                q: "Posso usar o código do Serapeu?",
                a: "Sim! O Serapeu é open source. Você pode usar, modificar e distribuir o código seguindo a licença do projeto.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Pronto para Começar?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se à nossa comunidade e comece a aprender ou ensinar hoje mesmo. O conhecimento é a única coisa que
            aumenta quando compartilhado.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/registrar">
                <Users className="w-5 h-5" />
                Criar Conta Grátis
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
              <Link href="/">
                <BookOpen className="w-5 h-5" />
                Explorar Tutoriais
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
