export type Role = "USER" | "ADMIN"

export interface UserType {
  id: string
  email: string
  name: string
  role: Role
  createdAt?: string
  banned?: boolean
  savedTutorials?: string[] // IDs dos tutoriais salvos
  votedTutorials?: string[] // IDs dos tutoriais votados
}

export const PINNED_TUTORIAL_ID = "b44e3074-fe49-4a16-b007-e3a9db859171"

export interface Tutorial {
  id: string
  title: string
  description: string
  steps: string[]
  authorId: string
  authorName: string
  category: string
  createdAt: string
  approved: boolean
  upvotes: number
  pinned?: boolean
  comments?: Comment[]
}

export interface TutorialProblem {
  id: string
  tutorialId: string
  userId: string
  userName: string
  stepNumber: number | null // null se for problema geral
  description: string
  createdAt: string
  resolved: boolean
}

export interface TutorialRequest {
  id: string
  userId: string
  userName: string
  title: string
  description: string
  category: string
  createdAt: string
  created_at?: string
  upvotes: number
  upvotedBy: string[]
  answered: boolean
  answeredTutorialId?: string
}

export interface Comment {
  id: string
  tutorialId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface AdminLog {
  id: string
  adminId: string
  adminName: string
  action: string
  targetType: "tutorial" | "comment" | "user" | "problem" | "request"
  targetId: string
  targetName: string
  createdAt: string
}

export const categories = ["Tecnologia", "Culinária", "Casa e Jardim", "Estilo de Vida"]

export const initialTutorials: Tutorial[] = [
  {
    id: "1",
    title: "Instalando Node via NVM",
    description: "A forma mais segura de instalar Node no Linux.",
    steps: [
      "Abra o terminal do Linux e baixe o instalador oficial do NVM:\n```bash\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\n```",
      "Recarregue as variáveis de ambiente do seu terminal para habilitar o comando `nvm`:\n```bash\nsource ~/.bashrc\n```",
      "Instale e ative a versão LTS mais recente do Node.js executando:\n```bash\nnvm install --lts\nnode -v && npm -v\n```",
    ],
    authorId: "1",
    authorName: "Bob Expert",
    category: "Tecnologia",
    createdAt: "25/10/2023",
    approved: true,
    upvotes: 1,
    comments: [
      {
        id: "c1",
        tutorialId: "1",
        userId: "3",
        userName: "Carlos Silva",
        content: "Muito útil! Funcionou perfeitamente no meu Ubuntu.",
        createdAt: "26/10/2023",
      },
      {
        id: "c2",
        tutorialId: "1",
        userId: "4",
        userName: "Ana Costa",
        content: "Dica: se der erro de permissão, tente rodar com sudo.",
        createdAt: "27/10/2023",
      },
    ],
  },
  {
    id: "2",
    title: "Como fazer pão caseiro",
    description: "Receita simples de pão caseiro macio e delicioso.",
    steps: [
      "Misture 500g de farinha, 10g de sal e 7g de fermento seco",
      "Adicione 300ml de água morna e misture até formar uma massa",
      "Sove por 10 minutos e deixe descansar por 1 hora",
      "Asse em forno pré-aquecido a 200°C por 30 minutos",
    ],
    authorId: "2",
    authorName: "Maria Chef",
    category: "Culinária",
    createdAt: "20/10/2023",
    approved: true,
    upvotes: 5,
    comments: [
      {
        id: "c3",
        tutorialId: "2",
        userId: "5",
        userName: "Pedro Santos",
        content: "Ficou delicioso! Minha família adorou.",
        createdAt: "21/10/2023",
      },
    ],
  },
]

export const initialRequests: TutorialRequest[] = [
  {
    id: "1",
    userId: "3",
    userName: "Carlos Silva",
    title: "Como configurar Docker no Windows?",
    description: "Preciso de um tutorial passo a passo para instalar e configurar Docker no Windows 11 com WSL2.",
    category: "Tecnologia",
    created_at: "2025-11-22T10:00:00.000Z",
    createdAt: "22/11/2025",
    upvotes: 3,
    upvotedBy: ["4", "5", "6"],
    answered: false,
  },
  {
    id: "2",
    userId: "4",
    userName: "Ana Costa",
    title: "Receita de bolo de chocolate sem glúten",
    description: "Alguém pode fazer um tutorial de bolo de chocolate que seja sem glúten e fácil de fazer?",
    category: "Culinária",
    created_at: "2025-11-20T10:00:00.000Z",
    createdAt: "20/11/2025",
    upvotes: 7,
    upvotedBy: ["1", "2", "3", "5", "6", "7", "8"],
    answered: false,
  },
]

// Schemas Zod para validações
import { z } from 'zod'

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(/^[a-zA-Z\s]+$/, 'Nome deve conter apenas letras e espaços'),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
