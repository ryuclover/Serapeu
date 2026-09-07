"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { UserType, Tutorial, TutorialProblem, TutorialRequest, Comment, AdminLog } from "./types"
import { initialTutorials } from "./types"
import { createClient, validateSupabaseConfig } from "@/lib/supabase/client"
import { logError, getUserFriendlyErrorMessage } from "@/lib/utils"
import { toast } from "sonner"

// ─── Tipos internos do Supabase ──────────────────────────────────────────────

type SupabaseTutorialRow = {
  id: string
  title: string
  description: string
  steps: string[]
  author_id: string
  category: string
  created_at: string
  approved: boolean
  upvotes: number
  profiles?: { name?: string } | { name?: string }[] | null
}

type SupabaseProfileRow = {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  banned: boolean | null
}

type SupabaseError = { code?: string; message?: string }

const isProfilesPolicyRecursion = (e: SupabaseError | null | undefined) => e?.code === "42P17"

// ─── Interface do contexto ────────────────────────────────────────────────────

interface AuthContextType {
  user: UserType | null
  authReady: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>
  updateProfile: (name: string) => Promise<{ error: any }>
  logout: () => Promise<void>
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  tutorials: Tutorial[]
  setTutorials: React.Dispatch<React.SetStateAction<Tutorial[]>>
  problems: TutorialProblem[]
  setProblems: React.Dispatch<React.SetStateAction<TutorialProblem[]>>
  requests: TutorialRequest[]
  setRequests: React.Dispatch<React.SetStateAction<TutorialRequest[]>>
  users: UserType[]
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>
  adminLogs: AdminLog[]
  addAdminLog: (log: Omit<AdminLog, "id" | "createdAt">) => void
  createComment: (tutorialId: string, content: string) => Promise<void>
  deleteComment: (tutorialId: string, commentId: string) => Promise<void>
  editComment: (tutorialId: string, commentId: string, content: string) => Promise<void>
  reportProblem: (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => Promise<void>
  resolveProblem: (problemId: string) => Promise<void>
  deleteProblem: (problemId: string) => Promise<void>
  deleteRequest: (requestId: string) => Promise<void>
  banUser: (userId: string) => void
  unbanUser: (userId: string) => void
  promoteToAdmin: (userId: string) => void
  demoteFromAdmin: (userId: string) => void
  deleteUser: (userId: string) => Promise<void>
  approveTutorial: (tutorialId: string) => Promise<void>
  deleteTutorial: (tutorialId: string) => Promise<void>
  incrementTutorialUpvotes: (tutorialId: string) => Promise<void>
  toggleSaveTutorial: (tutorialId: string) => Promise<void>
  refreshData: () => Promise<void>
  refreshDataFromServer: () => Promise<void>
}

// ─── Inicialização do cliente (singleton) ────────────────────────────────────

validateSupabaseConfig()
const AuthContext = createContext<AuthContextType | null>(null)

// Helpers para cache leve de perfil na UI
const getCachedUser = (): UserType | null => {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('serapeu-user-cache')
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const setCachedUser = (user: UserType | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('serapeu-user-cache', JSON.stringify(user))
  } else {
    localStorage.removeItem('serapeu-user-cache')
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<UserType | null>(() => getCachedUser())
  const [authReady, setAuthReady] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [problems, setProblems] = useState<TutorialProblem[]>([])
  const [requests, setRequests] = useState<TutorialRequest[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])

  // Ref para evitar múltiplas inicializações simultâneas
  const initializingRef = useRef(false)

  // ── Dark mode ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // ── Carrega perfil do usuário a partir da sessão ──────────────────────────

  const loadUserFromSession = async (session: any) => {
    if (!session?.user) return

    try {
      const meResponse = await fetch('/api/auth/me', { credentials: 'include' })
      if (meResponse.status === 403) {
        // Usuário banido: encerra sessão imediatamente
        toast.error('Sua conta foi suspensa pela moderação.')
        await supabase.auth.signOut()
        setUser(null)
        setCachedUser(null)
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/acesso-negado')) {
          window.location.href = '/acesso-negado'
        }
        return
      }

      let profile: { name?: string; role?: string; banned?: boolean } | null = null

      if (meResponse.ok) {
        const meJson = await meResponse.json().catch(() => null)
        profile = meJson?.user || null
      }

      const finalUser: UserType = {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
        role: (profile?.role === "ADMIN" ? "ADMIN" : "USER") as "USER" | "ADMIN",
        createdAt: session.user.created_at,
        banned: false,
        savedTutorials: [],
        votedTutorials: [],
      }
      
      setUser(finalUser)
      setCachedUser(finalUser)
      
      // Carrega dados adicionais (salvos/votados)
      const [{ data: savedData }, { data: votedData }] = await Promise.all([
        supabase.from('saved_tutorials').select('tutorial_id').eq('user_id', session.user.id),
        supabase.from('tutorial_votes').select('tutorial_id').eq('user_id', session.user.id),
      ])

      setUser(prev => {
        if (!prev) return prev
        const updated = {
          ...prev,
          savedTutorials: savedData?.map((s: any) => s.tutorial_id) ?? [],
          votedTutorials: votedData?.map((v: any) => v.tutorial_id) ?? [],
        }
        setCachedUser(updated)
        return updated
      })
    } catch (err) {
      console.error('[Auth] Erro ao carregar perfil do usuário:', err)
    }
  }

  // ── Boot: inicializa sessão + dados ──────────────────────────────────────────

  useEffect(() => {
    if (initializingRef.current) return
    initializingRef.current = true

    const safetyTimeout = setTimeout(() => setAuthReady(true), 6000)

    const boot = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadUserFromSession(session)
        } else {
          setUser(null)
          setCachedUser(null)
        }
        await refreshData()
      } catch (err) {
        console.error('[Auth] Erro durante inicialização:', err)
      } finally {
        clearTimeout(safetyTimeout)
        setAuthReady(true)
      }
    }

    boot()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Evento:', event, session?.user?.id ?? 'sem usuário')

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await loadUserFromSession(session)
          if (event !== 'TOKEN_REFRESHED') {
            await refreshData()
          }
        } else if (event === 'INITIAL_SESSION') {
          setUser(null)
          setCachedUser(null)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setCachedUser(null)
      }
    })

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Dados: tutoriais, comentários, requisições ───────────────────────────

  const refreshData = async () => {
    console.log('[Data] Carregando dados...')

    try {
      const response = await fetch('/api/public/data')
      const result = await response.json()
      
      if (result.success) {
        // Formatar tutoriais
        const formattedTutorials: Tutorial[] = (result.tutorials || []).map((t: any) => {
          const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            steps: t.steps || [],
            authorId: t.author_id,
            authorName: profile?.name || 'Usuário',
            category: t.category,
            createdAt: new Date(t.created_at).toLocaleDateString('pt-BR'),
            approved: t.approved,
            upvotes: t.upvotes ?? 0,
            comments: [],
          }
        })
        
        // Agrupar comentários
        const commentsByTutorial = ((result.comments || []) as any[]).reduce((acc: Record<string, Comment[]>, c: any) => {
          if (!acc[c.tutorial_id]) acc[c.tutorial_id] = []
          acc[c.tutorial_id].push({
            id: c.id,
            tutorialId: c.tutorial_id,
            userId: c.user_id,
            userName: c.user_name,
            content: c.content,
            createdAt: new Date(c.created_at).toLocaleDateString('pt-BR'),
          })
          return acc
        }, {})
        
        setTutorials(formattedTutorials.map(t => ({ ...t, comments: commentsByTutorial[t.id] || [] })))

        // Formatar problemas
        setProblems((result.problems || []).map((p: any) => ({
          id: p.id, tutorialId: p.tutorial_id, userId: p.user_id, userName: p.user_name,
          stepNumber: p.step_number, description: p.description,
          createdAt: new Date(p.created_at).toLocaleDateString('pt-BR'), resolved: p.resolved,
        })))

        // Formatar requisições
        setRequests((result.requests || []).map((r: any) => ({
          id: r.id, userId: r.user_id,
          userName: r.profiles?.name || 'Usuário',
          title: r.title, description: r.description, category: r.category,
          createdAt: new Date(r.created_at).toLocaleDateString('pt-BR'),
          upvotes: r.upvotes, upvotedBy: r.upvoted_by || [],
          answered: r.answered, answeredTutorialId: r.answered_tutorial_id,
        })))
      }
    } catch (err) {
      console.error('[Data] Erro ao carregar dados públicos:', err)
      setTutorials(initialTutorials)
    }

    // Usuários (profiles) - Somente admins precisam ver isso, mas tenta buscar
    const { data: usersData, error: usersError } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false })
    if (!usersError && usersData) {
      setUsers((usersData as SupabaseProfileRow[]).map(u => ({
        id: u.id, email: u.email, name: u.name, role: u.role as "USER" | "ADMIN",
        createdAt: new Date(u.created_at).toLocaleDateString('pt-BR'), banned: Boolean(u.banned),
      })))
    }
  }

  const refreshDataFromServer = async () => {
    try {
      const response = await fetch('/api/admin/data')
      const result = await response.json()
      if (result.success) {
        setTutorials(result.tutorials || [])
        setUsers(result.users || [])
        setProblems(result.problems || [])
        setRequests(result.requests || [])
      }
    } catch (err) {
      console.error('[Data] Erro ao buscar dados do servidor:', err)
    }
  }

  // ─── Autenticação ─────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Falha ao fazer login: ' + (error.message || 'Erro desconhecido'))
      return { error }
    }
    // onAuthStateChange cuida do resto (SIGNED_IN event)
    await refreshData()
    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  const updateProfile = async (name: string) => {
    if (!user) return { error: "No user" }
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id)
    if (!error) {
      setUser(prev => prev ? { ...prev, name } : null)
      await supabase.auth.updateUser({ data: { name } })
    }
    return { error }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      // onAuthStateChange cuida de setUser(null) via SIGNED_OUT event
    } catch (err) {
      console.error('[Auth] Erro no logout:', err)
      setUser(null)
    }
  }

  // ─── Ações de tutorial ────────────────────────────────────────────────────

  const updateTutorialInState = (tutorialId: string, updater: (t: Tutorial) => Tutorial) => {
    setTutorials(prev => prev.map(t => t.id === tutorialId ? updater(t) : t))
  }

  const approveTutorial = async (tutorialId: string) => {
    try {
      const res = await fetch('/api/admin/tutorials/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tutorialId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao aprovar tutorial')
      updateTutorialInState(tutorialId, t => ({ ...t, approved: true }))
      toast.success('Tutorial aprovado.')
    } catch (error: any) {
      logError('approveTutorial', error, { tutorialId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível aprovar o tutorial.')
      throw error
    }
  }

  const deleteTutorial = async (tutorialId: string) => {
    try {
      const res = await fetch('/api/admin/tutorials/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tutorialId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao excluir tutorial')
      setTutorials(prev => prev.filter(t => t.id !== tutorialId))
      toast.success('Tutorial excluído.')
    } catch (error: any) {
      logError('deleteTutorial', error, { tutorialId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir o tutorial.')
      throw error
    }
  }

  const incrementTutorialUpvotes = async (tutorialId: string) => {
    if (!user) { toast.error('Você precisa estar logado para votar.'); return }
    const current = tutorials.find(t => t.id === tutorialId)
    if (!current) return
    const hasVoted = user.votedTutorials?.includes(tutorialId)
    const nextUpvotes = hasVoted ? current.upvotes - 1 : current.upvotes + 1
    const nextVoted = hasVoted
      ? user.votedTutorials?.filter(id => id !== tutorialId) ?? []
      : [...(user.votedTutorials || []), tutorialId]
    updateTutorialInState(tutorialId, t => ({ ...t, upvotes: nextUpvotes }))
    setUser({ ...user, votedTutorials: nextVoted })
    try {
      if (hasVoted) {
        const { error: e1 } = await supabase.from('tutorial_votes').delete().eq('user_id', user.id).eq('tutorial_id', tutorialId)
        if (e1) throw e1
      } else {
        const { error: e1 } = await supabase.from('tutorial_votes').insert({ user_id: user.id, tutorial_id: tutorialId })
        if (e1) throw e1
      }
      const { error: e2 } = await supabase.from('tutorials').update({ upvotes: nextUpvotes }).eq('id', tutorialId)
      if (e2) throw e2
    } catch {
      updateTutorialInState(tutorialId, t => ({ ...t, upvotes: current.upvotes }))
      setUser({ ...user, votedTutorials: user.votedTutorials || [] })
      toast.error('Não foi possível registrar o voto.')
    }
  }

  const toggleSaveTutorial = async (tutorialId: string) => {
    if (!user) { toast.error("Você precisa estar logado para salvar tutoriais."); return }
    const isSaved = user.savedTutorials?.includes(tutorialId)
    const nextSaved = isSaved
      ? (user.savedTutorials || []).filter(id => id !== tutorialId)
      : [...(user.savedTutorials || []), tutorialId]
    setUser({ ...user, savedTutorials: nextSaved })
    try {
      if (isSaved) {
        const { error } = await supabase.from('saved_tutorials').delete().eq('user_id', user.id).eq('tutorial_id', tutorialId)
        if (error) throw error
        toast.success("Tutorial removido dos salvos.")
      } else {
        const { error } = await supabase.from('saved_tutorials').insert({ user_id: user.id, tutorial_id: tutorialId })
        if (error) throw error
        toast.success("Tutorial salvo com sucesso!")
      }
    } catch (error: any) {
      logError('toggleSaveTutorial', error, { tutorialId })
      toast.error('Não foi possível atualizar sua lista de salvos. Tente novamente.')
      setUser(prev => prev ? { ...prev, savedTutorials: user.savedTutorials } : null)
    }
  }

  // ─── Admin logs ────────────────────────────────────────────────────────────

  const addAdminLog = (log: Omit<AdminLog, "id" | "createdAt">) => {
    setAdminLogs(prev => [{ ...log, id: Date.now().toString(), createdAt: new Date().toLocaleString("pt-BR") }, ...prev])
  }

  // ─── Comentários ──────────────────────────────────────────────────────────

  const addCommentToTutorial = (tutorialId: string, comment: Comment) => {
    setTutorials(prev => prev.map(t => t.id === tutorialId ? { ...t, comments: [...(t.comments || []), comment] } : t))
  }

  const createComment = async (tutorialId: string, content: string) => {
    if (!user) { toast.error('Você precisa estar logado para comentar.'); return }
    try {
      const res = await fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorialId, content }), credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao postar comentário')
      const { comment: data } = await res.json()
      addCommentToTutorial(tutorialId, {
        id: data.id, tutorialId: data.tutorial_id, userId: data.user_id,
        userName: data.user_name, content: data.content,
        createdAt: new Date(data.created_at).toLocaleDateString('pt-BR'),
      })
    } catch (error: any) {
      logError('createComment', error, { tutorialId })
      toast.error('Não foi possível postar o comentário.')
    }
  }

  const deleteComment = async (tutorialId: string, commentId: string) => {
    try {
      const res = await fetch('/api/comments/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorialId, commentId }), credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao deletar comentário')
      setTutorials(prev => prev.map(t => t.id === tutorialId ? { ...t, comments: (t.comments || []).filter(c => c.id !== commentId) } : t))
    } catch (error: any) {
      logError('deleteComment', error, { commentId, tutorialId })
      toast.error('Não foi possível deletar o comentário.')
    }
  }

  const editComment = async (tutorialId: string, commentId: string, content: string) => {
    if (!user) { toast.error('Você precisa estar logado para editar comentários.'); return }
    try {
      const res = await fetch('/api/comments/edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorialId, commentId, content }), credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao editar comentário')
      const { comment: data } = await res.json()
      setTutorials(prev => prev.map(t => t.id === tutorialId
        ? { ...t, comments: (t.comments || []).map(c => c.id === commentId ? { ...c, content: data.content, createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString('pt-BR') : c.createdAt } : c) }
        : t
      ))
      toast.success('Comentário atualizado.')
    } catch (error: any) {
      logError('editComment', error, { tutorialId, commentId })
      toast.error('Não foi possível editar o comentário.')
    }
  }

  // ─── Problemas ────────────────────────────────────────────────────────────

  const reportProblem = async (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => {
    if (!user) { toast.error('Você precisa estar logado para relatar um problema.'); return }
    if (user.banned) { toast.error('Sua conta está suspensa.'); return }
    const { data, error } = await supabase.from('tutorial_problems').insert({
      tutorial_id: problem.tutorialId, user_id: user.id, user_name: user.name,
      step_number: problem.stepNumber, description: problem.description, resolved: false,
    }).select('*').single()
    if (error || !data) { toast.error('Não foi possível relatar o problema. Tente novamente.'); return }
    setProblems(prev => [...prev, {
      id: data.id, tutorialId: data.tutorial_id, userId: data.user_id, userName: data.user_name,
      stepNumber: data.step_number, description: data.description,
      createdAt: new Date(data.created_at).toLocaleDateString('pt-BR'), resolved: data.resolved,
    }])
  }

  const resolveProblem = async (problemId: string) => {
    const { error } = await supabase.from('tutorial_problems').update({ resolved: true }).eq('id', problemId)
    if (error) { toast.error('Não foi possível resolver o problema.'); return }
    setProblems(prev => prev.map(p => p.id === problemId ? { ...p, resolved: true } : p))
  }

  const deleteProblem = async (problemId: string) => {
    try {
      const res = await fetch('/api/admin/problems/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: problemId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao excluir problema')
      setProblems(prev => prev.filter(p => p.id !== problemId))
      toast.success('Problema excluído.')
    } catch (error: any) {
      logError('deleteProblem', error, { problemId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir o problema.')
    }
  }

  // ─── Requisições ──────────────────────────────────────────────────────────

  const deleteRequest = async (requestId: string) => {
    try {
      const res = await fetch('/api/admin/requests/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao excluir requisição')
      setRequests(prev => prev.filter(r => r.id !== requestId))
      toast.success('Requisição excluída.')
    } catch (error: any) {
      logError('deleteRequest', error, { requestId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir a requisição.')
    }
  }

  // ─── Ações de admin sobre usuários ───────────────────────────────────────

  const adminUserAction = async (url: string, body: object, onSuccess: () => void, errorMsg: string) => {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || errorMsg)
      onSuccess()
    } catch (error: any) {
      toast.error(getUserFriendlyErrorMessage(error) || errorMsg)
    }
  }

  const banUser = (userId: string) => adminUserAction(
    '/api/admin/users/ban', { id: userId, ban: true },
    () => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u)); toast.success('Usuário banido.') },
    'Não foi possível banir o usuário.'
  )

  const unbanUser = (userId: string) => adminUserAction(
    '/api/admin/users/ban', { id: userId, ban: false },
    () => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false } : u)); toast.success('Usuário desbanido.') },
    'Não foi possível desbanir o usuário.'
  )

  const promoteToAdmin = (userId: string) => adminUserAction(
    '/api/admin/users/promote', { id: userId },
    () => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'ADMIN' as const } : u)); toast.success('Usuário promovido a admin.') },
    'Não foi possível promover o usuário.'
  )

  const demoteFromAdmin = (userId: string) => adminUserAction(
    '/api/admin/users/demote', { id: userId },
    () => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'USER' as const } : u)); toast.success('Usuário rebaixado de admin.') },
    'Não foi possível rebaixar o usuário.'
  )

  const deleteUser = async (userId: string) => adminUserAction(
    '/api/admin/users/delete', { id: userId },
    () => { setUsers(prev => prev.filter(u => u.id !== userId)); toast.success('Usuário excluído.') },
    'Não foi possível excluir o usuário.'
  )

  // ─── Provider value ───────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      user, authReady, signIn, signUp, updateProfile, logout,
      darkMode, setDarkMode,
      tutorials, setTutorials, problems, setProblems,
      requests, setRequests, users, setUsers,
      adminLogs, addAdminLog,
      createComment, deleteComment, editComment,
      reportProblem, resolveProblem, deleteProblem,
      deleteRequest,
      banUser, unbanUser, promoteToAdmin, demoteFromAdmin, deleteUser,
      approveTutorial, deleteTutorial, incrementTutorialUpvotes,
      toggleSaveTutorial, refreshData, refreshDataFromServer,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
