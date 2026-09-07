import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Ler variáveis de .env.local
const envContent = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const communityUsers = [
  { name: 'Lucas Tech', email: 'lucas.tech@serapeu.dev' },
  { name: 'Chef Camila', email: 'camila.culinaria@serapeu.dev' },
  { name: 'Beatriz Verde', email: 'beatriz.jardim@serapeu.dev' },
  { name: 'Marcos Finanças', email: 'marcos.financas@serapeu.dev' },
  { name: 'Mariana Foco', email: 'mariana.prod@serapeu.dev' },
  { name: 'Rafaela Design', email: 'rafaela.design@serapeu.dev' },
  { name: 'André Café', email: 'andre.barista@serapeu.dev' },
]

async function getOrCreateUsers() {
  console.log('👥 Garantindo usuários da comunidade...')
  const authorProfiles = []

  // 1. Buscar perfis já existentes no banco
  const { data: existingProfiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, name, email')

  if (fetchErr) {
    console.error('Erro ao buscar perfis existentes:', fetchErr.message)
  } else if (existingProfiles && existingProfiles.length > 0) {
    authorProfiles.push(...existingProfiles)
  }

  // 2. Criar os novos usuários se não existirem
  for (const user of communityUsers) {
    const existing = authorProfiles.find(p => p.email === user.email)
    if (existing) {
      continue
    }

    try {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'SerapeuSecurePassword2026!',
        email_confirm: true,
        user_metadata: { name: user.name },
      })

      if (error) {
        // Se já existir no auth mas não no profiles por algum motivo
        console.log(`⚠️ Usuário ${user.email} já existe ou erro: ${error.message}`)
      } else if (created?.user) {
        console.log(`✅ Usuário criado: ${user.name} (${created.user.id})`)
        // Garantir no profiles caso o trigger demore
        await supabase.from('profiles').upsert({
          id: created.user.id,
          name: user.name,
          email: user.email,
          role: 'USER',
          banned: false,
        })
        authorProfiles.push({ id: created.user.id, name: user.name, email: user.email })
      }
    } catch (err) {
      console.error(`Erro ao criar ${user.email}:`, err)
    }
  }

  return authorProfiles
}

const tutorialsData = [
  {
    title: 'Configurando Docker e WSL2 no Windows 11 para Alta Performance',
    description: 'Guia definitivo para habilitar o WSL2, instalar o Ubuntu e rodar containers Docker com máxima velocidade e sem travar a máquina.',
    category: 'Tecnologia',
    upvotes: 47,
    steps: [
      'Abra o PowerShell como Administrador e execute: wsl --install -d Ubuntu. Reinicie o computador se for solicitado.',
      'Após o reinício, crie seu usuário e senha no terminal do Ubuntu que abrirá automaticamente.',
      'Baixe e instale o Docker Desktop oficial para Windows marcando a opção "Use the WSL 2 based engine".',
      'Nas configurações do Docker Desktop, acesse Resources -> WSL Integration e ative o switch para a sua distribuição Ubuntu.',
      'Abra o terminal Ubuntu e teste: docker run hello-world. Pronto! Seu ambiente agora roda com virtualização nativa e baixa latência.',
    ],
  },
  {
    title: 'Como Criar uma API REST Moderna com Next.js 15, TypeScript e Zod',
    description: 'Aprenda a estruturar endpoints protegidos, validar schemas no runtime e tratar erros de forma robusta e tipada.',
    category: 'Tecnologia',
    upvotes: 38,
    steps: [
      'Crie seu schema de validação com Zod na pasta lib/validations/ (ex: const userSchema = z.object({ email: z.string().email() })).',
      'No Route Handler (app/api/users/route.ts), faça o parse assíncrono do corpo: const body = await request.json().',
      'Valide com safeParse: const result = userSchema.safeParse(body). Se falhar, retorne NextResponse.json({ error: result.error.errors }, { status: 400 }).',
      'Realize as operações de banco de dados e envolva tudo em um bloco try/catch para capturar exceções não esperadas.',
      'Retorne a resposta no formato padrão com NextResponse.json({ success: true, data }).',
    ],
  },
  {
    title: 'Pão Italiano Artesanal de Fermentação Lenta (Sem Sovar)',
    description: 'A receita mais fácil e crocante de pão rústico que você fará na vida, usando apenas 4 ingredientes e uma panela de ferro.',
    category: 'Culinária',
    upvotes: 64,
    steps: [
      'Em uma tigela grande, misture 400g de farinha de trigo, 8g de sal e 1g de fermento biológico seco (apenas uma ponta de colher de café).',
      'Adicione 300ml de água em temperatura ambiente e misture com uma espátula por 1 minuto até formar uma massa pegajosa.',
      'Cubra a tigela com filme plástico e deixe descansar em temperatura ambiente de 14 a 18 horas para fermentar lentamente.',
      'Pré-aqueça o forno a 230°C junto com uma panela de ferro tampada por 30 minutos.',
      'Transfira a massa para papel manteiga, coloque dentro da panela quente, tampe e asse por 30 minutos. Retire a tampa e asse por mais 15 minutos até dourar.',
    ],
  },
  {
    title: 'Risoto de Cogumelos Perfeito: Técnicas para Cremosisdade sem Erro',
    description: 'Os segredos dos chefs italianos para o risoto ideal: temperatura do caldo, tostatura do arroz e a técnica da mantecatura.',
    category: 'Culinária',
    upvotes: 32,
    steps: [
      'Mantenha 1 litro de caldo de legumes de boa qualidade fervendo suavemente em uma panela ao lado.',
      'Refogue 300g de cogumelos fatiados (shimeji e paris) com manteiga e alho em fogo alto até dourarem. Reserve metade para a finalização.',
      'Na mesma panela, adicione azeite e refogue cebola picada em fogo baixo. Adicione 1 xícara de arroz arbóreo ou carnaroli e toste por 2 minutos.',
      'Regue com 100ml de vinho branco seco e mexa até evaporar o álcool.',
      'Vá adicionando conchas de caldo quente uma a uma, mexendo sempre, até o arroz ficar al dente (cerca de 18 minutos).',
      'Desligue o fogo e faça a mantecatura: adicione 2 colheres de manteiga gelada e queijo parmesão ralado na hora. Misture vigorosamente e sirva.',
    ],
  },
  {
    title: 'Como Fazer Café Filtrado Especial na V60: Proporção e Extração',
    description: 'Descubra a moagem correta, temperatura da água e o método das 3 infusões para extrair o melhor aroma de grãos especiais.',
    category: 'Culinária',
    upvotes: 29,
    steps: [
      'Utilize a proporção áurea de 1:15 (20g de café moído médio-fino para 300g de água filtrada a 92°C).',
      'Escalde o filtro de papel com água quente para retirar o gosto residual e descarte a água da jarra.',
      'Coloque o café no filtro, nivele a superfície e faça a pré-infusão com 60g de água em movimentos circulares por 40 segundos.',
      'Despeje a segunda água até atingir 180g de peso na balança com fluxo contínuo e suave do centro para as bordas.',
      'Finalize o despejo restante até 300g. O tempo total de extração deve ficar entre 2:30 e 3:00 minutos. Sirva imediatamente.',
    ],
  },
  {
    title: 'Como Montar uma Horta de Temperos Frescos em Apartamento',
    description: 'Cultive manjericão, alecrim, hortelã e cebolinha na sua varanda ou janela sem complicação e com poucos cuidados.',
    category: 'Casa e Jardim',
    upvotes: 41,
    steps: [
      'Escolha vasos com furos de drenagem e coloque uma camada de argila expandida no fundo com uma manta geotêxtil.',
      'Use substrato rico em matéria orgânica com proporção de 70% terra vegetal e 30% húmus de minhoca.',
      'Plante alecrim em vaso separado do manjericão, pois o alecrim prefere solo mais seco e o manjericão adora umidade constante.',
      'Garanta que seus vasos recebam no mínimo 4 horas de sol direto por dia (a luz solar é indispensável para ervas aromáticas).',
      'Regue sempre na base e pela manhã, evitando molhar as folhas para prevenir fungos.',
    ],
  },
  {
    title: 'Guia de Cuidados com Suculentas e Cactos: Rega, Substrato e Luz Solar',
    description: 'Diga adeus às plantas que apodrecem ou estiolam. Saiba exatamente quando regar e como montar o substrato ideal.',
    category: 'Casa e Jardim',
    upvotes: 25,
    steps: [
      'Prepare o substrato drenante: 50% de terra e 50% de areia grossa de construção ou perlita expandida.',
      'A regra de ouro da rega: regue com abundância até sair água pelos furos e só volte a regar quando o solo estiver 100% seco.',
      'Para saber se o solo secou, espete um palito de madeira até o fundo do vaso. Se sair limpo, é hora de regar.',
      'Adapte suas plantas ao sol pleno gradualmente para evitar queimaduras nas folhas carnudas.',
    ],
  },
  {
    title: 'Método Pomodoro Avançado: Foco Profundo sem Exaustão Mental',
    description: 'Vá além do básico dos 25 minutos e adapte a técnica para programadores, estudantes e profissionais criativos.',
    category: 'Produtividade',
    upvotes: 56,
    steps: [
      'Liste as 3 tarefas prioritárias do dia antes de ligar o primeiro cronômetro.',
      'Para tarefas complexas de raciocínio, utilize ciclos de 50 minutos de foco com 10 minutos de pausa ativa (sem telas).',
      'Elimine distrações visuais: silencie notificações do celular e feche abas desnecessárias no navegador.',
      'A cada 3 ciclos longos, faça um descanso prolongado de 30 minutos caminhando ou fazendo um lanche leve.',
      'No fim do dia, anote quantos blocos de foco foram completados e ajuste a estimativa para o dia seguinte.',
    ],
  },
  {
    title: 'Como Construir um Segundo Cérebro Digital com Notion ou Obsidian',
    description: 'Organize suas notas, estudos e projetos utilizando o framework P.A.R.A. (Projetos, Áreas, Recursos e Arquivos).',
    category: 'Produtividade',
    upvotes: 68,
    steps: [
      'Crie a pasta PROJETOS para coisas com prazo e objetivo claro (ex: Lançar site do Serapeu).',
      'Crie a pasta ÁREAS para responsabilidades contínuas sem prazo de entrega (ex: Saúde, Finanças, Carreira).',
      'Crie a pasta RECURSOS para tópicos de interesse que você pesquisa e quer consultar no futuro (ex: Receitas, Artigos de IA).',
      'Crie a pasta ARQUIVO para itens inativos dos três grupos anteriores que você não usa mais mas quer preservar histórico.',
      'Crie o hábito da Revisão Semanal para arquivar projetos concluídos e organizar anotações soltas na caixa de entrada.',
    ],
  },
  {
    title: 'Como Montar sua Reserva de Emergência Passo a Passo do Zero',
    description: 'O primeiro e mais fundamental pilar da tranquilidade financeira: onde guardar, quanto juntar e como começar.',
    category: 'Finanças',
    upvotes: 82,
    steps: [
      'Calcule seu custo de vida mensal essencial (aluguel, alimentação, saúde e contas básicas).',
      'Multiplique esse custo por 6 meses se você for CLT estável, ou por 12 meses se for autônomo/PJ.',
      'Abra conta em uma corretora confiável ou banco digital com liquidez diária e rendimento de 100% do CDI ou Tesouro Selic.',
      'Automatize uma transferência mensal no dia do seu salário antes de gastar com lazer.',
      'Lembre-se: reserva de emergência não é para buscar rentabilidade alta, mas sim segurança e liquidez imediata.',
    ],
  },
  {
    title: 'Orçamento 50-30-20 na Prática: Controle Gastos sem Sofrimento',
    description: 'Um método matemático simples e intuitivo para nunca mais chegar no vermelho e investir todos os meses.',
    category: 'Finanças',
    upvotes: 49,
    steps: [
      'Destine 50% da sua renda líquida para Necessidades Básicas (moradia, transporte, mercado, contas de consumo).',
      'Destine 30% para Desejos Pessoais e Lazer (jantares fora, assinaturas de streaming, passeios e compras).',
      'Destine 20% impreterivelmente para o seu Futuro Financeiro (quitação de dívidas caras ou investimentos).',
      'Se suas necessidades superarem 50%, reduza temporariamente os desejos pessoais para equilibrar as contas.',
    ],
  },
  {
    title: 'Princípios de UI/UX Design: Como Criar Interfaces Limpas e Acessíveis',
    description: 'Dicas práticas sobre contraste de cores, hierarquia tipográfica e espaçamento consistente para desenvolvedores.',
    category: 'Design',
    upvotes: 37,
    steps: [
      'Utilize uma escala de espaçamento com múltiplos de 4 ou 8 (ex: 4px, 8px, 16px, 24px, 32px, 48px). Isso gera ritmo visual harmônico.',
      'Estabeleça hierarquia visual clara: o título deve ser notavelmente maior e mais pesado que o subtítulo e o texto base.',
      'Verifique a taxa de contraste (WCAG AA) para garantir que pessoas com baixa visão consigam ler seu texto em fundos claros e escuros.',
      'Use cores com propósito: reserve sua cor primária para botões de ação e links principais, evitando saturar a tela com muitos tons.',
      'Dê feedback imediato para toda ação do usuário: botões de loading, estados de hover e mensagens claras de sucesso ou erro.',
    ],
  },
]

const sampleComments = [
  'Excelente tutorial! Segui o passo a passo e funcionou de primeira aqui.',
  'Estava procurando por essa solução há dias. Muito obrigado pela didática!',
  'Dica valiosa! Só acrescentaria que no Windows 11 fica ainda mais rápido se desativar a telemetria pesada.',
  'Muito bem explicado. Parabéns pelo conteúdo didático e direto ao ponto!',
  'Fiz aqui em casa e deu super certo! Recomendo a todos da comunidade.',
  'Esse método mudou completamente minha rotina. O Serapeu tá ficando sensacional!',
]

const sampleRequests = [
  {
    title: 'Como configurar autenticação com Google e GitHub no Next.js com Supabase?',
    description: 'Gostaria de ver um tutorial mostrando como criar as chaves no Google Cloud Console e integrar com o Supabase Auth.',
    category: 'Tecnologia',
    upvotes: 18,
  },
  {
    title: 'Receita tradicional de Nhoque de Batata que não desmancha na água',
    description: 'Alguém tem uma receita com a proporção exata de farinha para o nhoque ficar leve sem se desmanchar no cozimento?',
    category: 'Culinária',
    upvotes: 12,
  },
  {
    title: 'Como eliminar moscas de fungo (fungus gnats) das plantas de vaso?',
    description: 'Minhas plantinhas de apartamento estão cheias de mosquitinhos na terra. Qual é a forma natural mais eficaz de acabar com eles?',
    category: 'Casa e Jardim',
    upvotes: 9,
  },
  {
    title: 'Como montar uma planilha automática de controle de gastos no Google Sheets?',
    description: 'Gostaria de aprender a criar categorias e gráficos que atualizam sozinhos ao preencher os gastos do dia a dia.',
    category: 'Finanças',
    upvotes: 23,
  },
]

async function populate() {
  console.log('🚀 Iniciando povoamento da plataforma Serapeu...')

  const authors = await getOrCreateUsers()
  console.log(`Encontrados ${authors.length} perfis de autor disponíveis.`)

  if (authors.length === 0) {
    console.error('Nenhum perfil disponível para ser autor.')
    process.exit(1)
  }

  // 1. Inserir Tutoriais
  console.log('\n📚 Inserindo tutoriais na base...')
  for (let i = 0; i < tutorialsData.length; i++) {
    const tut = tutorialsData[i]
    const author = authors[i % authors.length]

    const { data: existing } = await supabase
      .from('tutorials')
      .select('id')
      .eq('title', tut.title)
      .maybeSingle()

    let tutorialId = existing?.id

    if (!existing) {
      const { data: inserted, error } = await supabase
        .from('tutorials')
        .insert({
          title: tut.title,
          description: tut.description,
          category: tut.category,
          steps: tut.steps,
          upvotes: tut.upvotes,
          approved: true,
          author_id: author.id,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`❌ Erro ao criar tutorial "${tut.title}":`, error.message)
        continue
      }
      tutorialId = inserted.id
      console.log(`✅ Tutorial criado: "${tut.title}" por ${author.name}`)
    } else {
      console.log(`ℹ️ Tutorial já existe: "${tut.title}"`)
    }

    // Inserir 1 ou 2 comentários aleatórios de outros usuários
    if (tutorialId) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('tutorial_id', tutorialId)

      if (count === 0) {
        const commenter = authors[(i + 1) % authors.length]
        const randomComment = sampleComments[i % sampleComments.length]

        await supabase.from('comments').insert({
          tutorial_id: tutorialId,
          user_id: commenter.id,
          user_name: commenter.name || 'Membro da Comunidade',
          content: randomComment,
        })
      }
    }
  }

  // 2. Inserir Perguntas/Requisições
  console.log('\n❓ Inserindo pedidos e dúvidas da comunidade...')
  for (let i = 0; i < sampleRequests.length; i++) {
    const req = sampleRequests[i]
    const author = authors[(i + 2) % authors.length]

    const { data: existing } = await supabase
      .from('tutorial_requests')
      .select('id')
      .eq('title', req.title)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase.from('tutorial_requests').insert({
        title: req.title,
        description: req.description,
        category: req.category,
        upvotes: req.upvotes,
        answered: false,
        user_id: author.id,
      })

      if (error) {
        console.error(`❌ Erro ao criar requisição "${req.title}":`, error.message)
      } else {
        console.log(`✅ Pergunta criada: "${req.title}" por ${author.name}`)
      }
    } else {
      console.log(`ℹ️ Pergunta já existe: "${req.title}"`)
    }
  }

  console.log('\n🎉 Plataforma povoada com sucesso!')
}

populate().catch(err => {
  console.error('❌ Erro durante o povoamento:', err)
  process.exit(1)
})
