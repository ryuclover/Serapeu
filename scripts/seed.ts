import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('⚠️ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para o seed.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

async function seed() {
  console.log('🌱 Iniciando seed de dados para desenvolvimento...')

  // 1. Buscar perfil existente no banco para ser o autor do seed
  const { data: existingProfiles } = await supabase.from('profiles').select('id, name').limit(1)
  let authorId = existingProfiles?.[0]?.id
  let authorName = existingProfiles?.[0]?.name || 'Serapeu Mestre'

  if (!authorId) {
    authorId = '00000000-0000-0000-0000-000000000001'
    await supabase.from('profiles').upsert({
      id: authorId,
      email: 'demo@serapeu.com',
      name: authorName,
      role: 'ADMIN',
      banned: false,
    })
  }

  // 2. Tutoriais de exemplo
  const sampleTutorials = [
    {
      title: 'Instalando Node.js via NVM no Linux e macOS',
      description: 'A forma mais recomendada e segura de gerenciar múltiplas versões do Node.js sem conflitos de permissão.',
      category: 'Tecnologia',
      steps: [
        'Abra o terminal e execute: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
        'Feche e reabra o terminal ou execute: source ~/.bashrc',
        'Instale a versão LTS do Node: nvm install --lts',
        'Verifique a instalação: node -v && npm -v',
      ],
      author_id: authorId,
      approved: true,
      upvotes: 12,
    },
    {
      title: 'Como fazer Pão Caseiro Fácil e Macio',
      description: 'Receita infalível de pão caseiro usando poucos ingredientes e sem precisar de batedeira profissional.',
      category: 'Culinária',
      steps: [
        'Misture 500g de farinha de trigo, 10g de sal e 7g de fermento biológico seco.',
        'Acrescente 300ml de água morna aos poucos e 2 colheres de sopa de azeite.',
        'Sove na bancada por cerca de 10 minutos até a massa ficar lisa.',
        'Deixe crescer em tigela coberta por 1 hora.',
        'Modele o pão e asse em forno pré-aquecido a 200°C por 30 a 35 minutos.',
      ],
      author_id: authorId,
      approved: true,
      upvotes: 8,
    },
    {
      title: 'Dicas para Cultivar Suculentas e Cactos em Apartamento',
      description: 'Como regar, escolher o substrato ideal e garantir que suas plantas fiquem saudáveis dentro de casa.',
      category: 'Casa e Jardim',
      steps: [
        'Escolha vasos com furos de drenagem na base para evitar acúmulo de água nas raízes.',
        'Utilize um substrato próprio com terra vegetal, areia grossa e perlita.',
        'Posicione próximo a janelas que recebam ao menos 4 horas de luz solar direta ou difusa.',
        'Regue apenas quando o solo estiver completamente seco (teste com o palito de madeira).',
      ],
      author_id: authorId,
      approved: true,
      upvotes: 5,
    },
    {
      title: 'Organização Pessoal com a Técnica Pomodoro',
      description: 'Aprenda a focar melhor nos estudos e no trabalho dividindo seu tempo em blocos produtivos.',
      category: 'Estilo de Vida',
      steps: [
        'Escolha a tarefa que você deseja realizar no momento.',
        'Coloque um timer para 25 minutos e trabalhe focado sem interrupções.',
        'Quando o alarme tocar, faça uma pausa obrigatória de 5 minutos.',
        'A cada 4 ciclos (pomodoros), faça uma pausa mais longa de 15 a 30 minutos.',
      ],
      author_id: authorId,
      approved: true,
      upvotes: 15,
    }
  ]

  for (const tut of sampleTutorials) {
    const { data: existing } = await supabase
      .from('tutorials')
      .select('id')
      .eq('title', tut.title)
      .maybeSingle()

    if (!existing) {
      const { data: inserted, error } = await supabase.from('tutorials').insert(tut).select().single()
      if (error) {
        console.error('Erro ao inserir tutorial:', error.message)
      } else {
        console.log(`✅ Tutorial inserido: "${tut.title}"`)
        // Inserir comentário inicial
        await supabase.from('comments').insert({
          tutorial_id: inserted.id,
          user_id: authorId,
          user_name: authorName,
          content: 'Dica extra: se tiver qualquer dúvida sobre esse passo a passo, deixe uma mensagem aqui!',
        })
      }
    }
  }

  // 3. Requisições de exemplo
  const sampleRequests = [
    {
      title: 'Como configurar Docker no Windows 11 com WSL2?',
      description: 'Gostaria de ver um tutorial passo a passo sobre como habilitar o WSL2 e instalar o Docker Desktop sem lentidão.',
      category: 'Tecnologia',
      user_id: authorId,
      upvotes: 4,
      answered: false,
    },
    {
      title: 'Receita simples de Bolo de Cenoura com cobertura crocante',
      description: 'Alguém pode compartilhar uma receita que não fique pesada e tenha aquela calda de chocolate que endurece?',
      category: 'Culinária',
      user_id: authorId,
      upvotes: 9,
      answered: false,
    }
  ]

  for (const req of sampleRequests) {
    const { data: existing } = await supabase
      .from('tutorial_requests')
      .select('id')
      .eq('title', req.title)
      .maybeSingle()

    if (!existing) {
      await supabase.from('tutorial_requests').insert(req)
      console.log(`✅ Pergunta/Requisição inserida: "${req.title}"`)
    }
  }

  console.log('✨ Seed concluído com sucesso!')
}

seed().catch((err) => {
  console.error('Falha no seed:', err)
  process.exit(1)
})
