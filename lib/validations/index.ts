import { z } from 'zod'

export const createCommentSchema = z.object({
  tutorialId: z.string().uuid('ID do tutorial inválido.'),
  content: z
    .string()
    .trim()
    .min(1, 'O comentário não pode ser vazio.')
    .max(2000, 'O comentário deve ter no máximo 2000 caracteres.'),
})

export const editCommentSchema = z.object({
  tutorialId: z.string().uuid('ID do tutorial inválido.'),
  commentId: z.string().uuid('ID do comentário inválido.'),
  content: z
    .string()
    .trim()
    .min(1, 'O comentário não pode ser vazio.')
    .max(2000, 'O comentário deve ter no máximo 2000 caracteres.'),
})

export const deleteCommentSchema = z.object({
  tutorialId: z.string().uuid('ID do tutorial inválido.'),
  commentId: z.string().uuid('ID do comentário inválido.'),
})

export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título deve ter pelo menos 3 caracteres.')
    .max(150, 'O título deve ter no máximo 150 caracteres.'),
  description: z
    .string()
    .trim()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres.')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres.'),
  category: z.string().min(1, 'Selecione uma categoria.'),
})

export const reportProblemSchema = z.object({
  tutorialId: z.string().uuid('ID do tutorial inválido.'),
  stepNumber: z.number().int().positive().nullable().optional(),
  description: z
    .string()
    .trim()
    .min(5, 'Descreva o problema com pelo menos 5 caracteres.')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.'),
})

export const createTutorialSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título deve ter pelo menos 3 caracteres.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  description: z
    .string()
    .trim()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres.')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.'),
  category: z.string().min(1, 'Selecione uma categoria.'),
  steps: z
    .array(z.string().trim().min(1, 'O passo não pode ser vazio.'))
    .min(1, 'Adicione pelo menos um passo no tutorial.'),
})
