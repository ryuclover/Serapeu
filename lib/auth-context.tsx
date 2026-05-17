"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserType, Tutorial, TutorialProblem, TutorialRequest, Comment, AdminLog } from "./types"
import { initialTutorials, initialRequests } from "./types"
import { createClient } from "@/lib/supabase/client"
import { logError, getUserFriendlyErrorMessage } from "@/lib/utils"
import { toast } from "sonner"

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

type SupabaseCommentRow = {
  id: string
  tutorial_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

type SupabaseProblemRow = {
  id: string
  tutorial_id: string
  user_id: string
  user_name: string
  step_number: number | null
  description: string
  created_at: string
  resolved: boolean
}

type SupabaseError = {
  code?: string
  message?: string
}

const isProfilesPolicyRecursion = (error: SupabaseError | null | undefined) => error?.code === "42P17"



const initialUsers: UserType[] = [
  { id: "1", email: "bob@expert.com", name: "Bob Expert", role: "USER", createdAt: "01/01/2023", banned: false },
  { id: "2", email: "maria@chef.com", name: "Maria Chef", role: "USER", createdAt: "15/02/2023", banned: false },
  { id: "3", email: "carlos@email.com", name: "Carlos Silva", role: "USER", createdAt: "10/03/2023", banned: false },
  { id: "4", email: "ana@email.com", name: "Ana Costa", role: "USER", createdAt: "20/05/2023", banned: false },
  { id: "5", email: "pedro@email.com", name: "Pedro Santos", role: "USER", createdAt: "05/08/2023", banned: false },
]

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

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [problems, setProblems] = useState<TutorialProblem[]>([])
  const [requests, setRequests] = useState<TutorialRequest[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])
  
  const supabase = createClient()

  const applySessionToUser = async (session: any) => {
    console.log('[Auth] Applying session to user:', session.user.id)

    const meResponse = await fetch('/api/auth/me', {
      credentials: 'include',
    })

    let profile: { name?: string; role?: string; banned?: boolean } | null = null

    if (meResponse.ok) {
      const meJson = await meResponse.json().catch(() => null)
      profile = meJson?.user || null
    } else {
      console.warn('[Auth] Failed to load profile from /api/auth/me')
    }
    
    setUser({
      id: session.user.id,
      email: session.user.email!,
      name: profile?.name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
      role: profile?.role === "ADMIN" ? "ADMIN" : "USER",
      createdAt: session.user.created_at,
      banned: Boolean(profile?.banned),
      savedTutorials: [],
      votedTutorials: [],
    })

    // Fetch saved/voted tutorials
    const { data: savedData } = await supabase
      .from('saved_tutorials')
      .select('tutorial_id')
      .eq('user_id', session.user.id)

    const { data: votedData } = await supabase
      .from('tutorial_votes')
      .select('tutorial_id')
      .eq('user_id', session.user.id)

    setUser((prev) =>
      prev
        ? {
            ...prev,
            savedTutorials: savedData ? savedData.map((s: any) => s.tutorial_id) : [],
            votedTutorials: votedData ? votedData.map((v: any) => v.tutorial_id) : [],
          }
        : prev,
    )
  }

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('[Auth] Failed to get initial session:', error)
          return
        }

        if (session?.user) {
          await applySessionToUser(session)
        }
      } catch (err) {
        console.error('[Auth] Exception during initial session load:', err)
      } finally {
        setAuthReady(true)
      }
    }

    initializeSession()
    refreshData() // Load data for normal users (RLS)
    refreshDataFromServer() // Load data for admins (Service Role)

    // Setup auth state listener - ONLY ONE, SIMPLE LISTENER
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session?.user?.id)
      
      if (session?.user) {
        await applySessionToUser(session)
      } else {
        console.log('[Auth] Logged out')
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe?.()
  }, [])

  const refreshDataFromServer = async () => {
    console.log('[refreshDataFromServer] Fetching data from server endpoint...')

    try {
      const response = await fetch('/api/admin/data')
      const result = await response.json()

      console.log('[refreshDataFromServer] Response:', result)

      if (result.success) {
        console.log('[refreshDataFromServer] Setting data from server')
        setTutorials(result.tutorials || [])
        setUsers(result.users || [])
        setProblems(result.problems || [])
        setRequests(result.requests || [])
      } else {
        console.warn('[refreshDataFromServer] Server error:', result.error)
      }
    } catch (err) {
      console.error('[refreshDataFromServer] Exception:', err)
    }
  }

  const refreshData = async () => {
    console.log('[refreshData] Starting data refresh...')

    // Fetch Tutorials
    console.log('[refreshData] Fetching tutorials...')
    let { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    console.log('[refreshData] Tutorials response:', { count: tutorialsData?.length, error: tutorialsError })

    // Fallback: se houver recursao de policy em profiles, busca sem join.
    if ((tutorialsError as SupabaseError | null)?.code === '42P17') {
      console.log('[refreshData] Got 42P17 error, trying fallback query...')
      const fallback = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false })

      tutorialsData = fallback.data
      tutorialsError = fallback.error
      console.log('[refreshData] Fallback response:', { count: tutorialsData?.length, error: tutorialsError })
    }

    if (tutorialsError) {
      if (isProfilesPolicyRecursion(tutorialsError as SupabaseError)) {
        console.log('[refreshData] Profile recursion policy error, clearing data')
        setTutorials([])
        setRequests([])
        setUsers([])
        return
      }

      console.warn('[refreshData] Tutorial error:', tutorialsError)
      toast.error('Não foi possível carregar os tutoriais.')
      const formattedTutorials: Tutorial[] = initialTutorials.map((t) => ({
        ...t,
        createdAt: t.createdAt || new Date().toLocaleDateString('pt-BR'),
      }))
      setTutorials(formattedTutorials)
    } else {
      console.log('[refreshData] Processing tutorials:', tutorialsData?.length || 0)
      const formattedTutorials: Tutorial[] = ((tutorialsData || []) as SupabaseTutorialRow[]).map((t) => {
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
      
      // If we got 0 tutorials from DB, fallback to initialTutorials for demo/dev
      if (formattedTutorials.length === 0) {
        console.log('[refreshData] No tutorials in DB, using initialTutorials')
        setTutorials(initialTutorials)
      } else {
        console.log('[refreshData] Setting tutorials from DB:', formattedTutorials.length)
        setTutorials(formattedTutorials)
      }
    }

    // Fetch Comments
    const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*')
    const commentsByTutorial = (commentsData || []).reduce<Record<string, Comment[]>>((acc, comment: any) => {
      if (!acc[comment.tutorial_id]) acc[comment.tutorial_id] = []
      acc[comment.tutorial_id].push({
        id: comment.id,
        tutorialId: comment.tutorial_id,
        userId: comment.user_id,
        userName: comment.user_name,
        content: comment.content,
        createdAt: new Date(comment.created_at).toLocaleDateString('pt-BR'),
      })
      return acc
    }, {})

    if (commentsError) {
      console.warn('Erro ao carregar comentários:', commentsError)
    }

    setTutorials((prev) =>
      prev.map((tutorial) => ({
        ...tutorial,
        comments: commentsByTutorial[tutorial.id] || tutorial.comments || [],
      })),
    )

    // Fetch Problems
    const { data: problemsData, error: problemsError } = await supabase.from('tutorial_problems').select('*')
    if (problemsError) {
      console.warn('Erro ao carregar problemas:', problemsError)
    } else {
      const formattedProblems: TutorialProblem[] = (problemsData || []).map((problem: any) => ({
        id: problem.id,
        tutorialId: problem.tutorial_id,
        userId: problem.user_id,
        userName: problem.user_name,
        stepNumber: problem.step_number,
        description: problem.description,
        createdAt: new Date(problem.created_at).toLocaleDateString('pt-BR'),
        resolved: problem.resolved,
      }))
      setProblems(formattedProblems)
    }

    // Fetch Requests
    let { data: requestsData, error: requestsError } = await supabase
      .from('tutorial_requests')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    // Fallback: se houver recursao de policy em profiles, busca sem join.
    if ((requestsError as SupabaseError | null)?.code === '42P17') {
      const fallback = await supabase
        .from('tutorial_requests')
        .select('*')
        .order('created_at', { ascending: false })

      requestsData = fallback.data
      requestsError = fallback.error
    }

    if (requestsError) {
      if (isProfilesPolicyRecursion(requestsError as SupabaseError)) {
        setRequests([])
        setUsers([])
        return
      }

      console.warn('Erro ao carregar requisições:', requestsError)
      setRequests(initialRequests)
    } else if (requestsData) {
      const formattedRequests: TutorialRequest[] = requestsData.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.profiles?.name || 'Usuário',
        title: r.title,
        description: r.description,
        category: r.category,
        createdAt: new Date(r.created_at).toLocaleDateString('pt-BR'),
        upvotes: r.upvotes,
        upvotedBy: r.upvoted_by || [],
        answered: r.answered,
        answeredTutorialId: r.answered_tutorial_id,
      }))
      setRequests(formattedRequests)
    }

    // Fetch Users
    console.log('[refreshData] Fetching users...')
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('[refreshData] Users response:', { count: usersData?.length, error: usersError })

    if (usersError) {
      if (!isProfilesPolicyRecursion(usersError as SupabaseError)) {
        console.warn('[refreshData] User error:', usersError)
      }
      setUsers(initialUsers)
    } else if (usersData) {
      console.log('[refreshData] Processing users:', usersData.length)
      const formattedUsers: UserType[] = (usersData as SupabaseProfileRow[]).map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "USER" | "ADMIN",
        createdAt: new Date(u.created_at).toLocaleDateString('pt-BR'),
        banned: Boolean(u.banned),
      }))
      console.log('[refreshData] Setting users:', formattedUsers.length)
      setUsers(formattedUsers)
    }
    console.log('[refreshData] Finished data refresh')
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  const updateProfile = async (name: string) => {
    if (!user) return { error: "No user" }

    // Update in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)

    if (!error) {
      // Update local state
      setUser(prev => prev ? { ...prev, name } : null)
      
      // Update metadata (optional but good for consistency)
      await supabase.auth.updateUser({
        data: { name }
      })
    }

    return { error }
  }

  const logout = async () => {
    try {
      console.log('[Auth] Logging out user')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[Auth] Logout error from Supabase:', error)
        // Still clear user state even if signOut fails
      } else {
        console.log('[Auth] Signout successful')
      }
      
      // Always clear user state
      setUser(null)
    } catch (err) {
      console.error('[Auth] Exception during logout:', err)
      // Still clear user state even if exception
      setUser(null)
    }
  }

  const updateTutorialInState = (tutorialId: string, updater: (tutorial: Tutorial) => Tutorial) => {
    setTutorials((prev) => prev.map((tutorial) => (tutorial.id === tutorialId ? updater(tutorial) : tutorial)))
  }

  const approveTutorial = async (tutorialId: string) => {
    try {
      const res = await fetch('/api/admin/tutorials/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tutorialId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao aprovar tutorial')
      }

      updateTutorialInState(tutorialId, (tutorial) => ({ ...tutorial, approved: true }))
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tutorialId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao excluir tutorial')
      }

      setTutorials((prev) => prev.filter((tutorial) => tutorial.id !== tutorialId))
      toast.success('Tutorial excluído.')
    } catch (error: any) {
      logError('deleteTutorial', error, { tutorialId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir o tutorial.')
      throw error
    }
  }

  const incrementTutorialUpvotes = async (tutorialId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para votar.')
      return
    }

    const currentTutorial = tutorials.find((tutorial) => tutorial.id === tutorialId)
    if (!currentTutorial) {
      return
    }

    const hasVoted = user.votedTutorials?.includes(tutorialId)
    const nextUpvotes = hasVoted ? currentTutorial.upvotes - 1 : currentTutorial.upvotes + 1
    const nextVotedTutorials = hasVoted
      ? user.votedTutorials?.filter((id) => id !== tutorialId) ?? []
      : [...(user.votedTutorials || []), tutorialId]

    updateTutorialInState(tutorialId, (tutorial) => ({ ...tutorial, upvotes: nextUpvotes }))
    setUser({ ...user, votedTutorials: nextVotedTutorials })

    try {
      if (hasVoted) {
        const { error } = await supabase
          .from('tutorial_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('tutorial_id', tutorialId)

        if (error) throw error
        const { error: updateError } = await supabase
          .from('tutorials')
          .update({ upvotes: nextUpvotes })
          .eq('id', tutorialId)

        if (updateError) throw updateError
      } else {
        const { error } = await supabase
          .from('tutorial_votes')
          .insert({ user_id: user.id, tutorial_id: tutorialId })

        if (error) throw error
        const { error: updateError } = await supabase
          .from('tutorials')
          .update({ upvotes: nextUpvotes })
          .eq('id', tutorialId)

        if (updateError) throw updateError
      }
    } catch (error) {
      updateTutorialInState(tutorialId, (tutorial) => ({ ...tutorial, upvotes: currentTutorial.upvotes }))
      setUser({ ...user, votedTutorials: user.votedTutorials || [] })
      toast.error('Não foi possível registrar o voto.')
      throw error
    }
  }

  const toggleSaveTutorial = async (tutorialId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar tutoriais.")
      return
    }

    const isSaved = user.savedTutorials?.includes(tutorialId)
    let newSavedTutorials = user.savedTutorials || []

    console.log(`[toggleSaveTutorial] Tutorial: ${tutorialId}, User: ${user.id}, Currently Saved: ${isSaved}`)

    // Otimistic Update (Atualiza a tela antes do banco responder)
    if (isSaved) {
      newSavedTutorials = newSavedTutorials.filter(id => id !== tutorialId)
    } else {
      newSavedTutorials = [...newSavedTutorials, tutorialId]
    }
    setUser({ ...user, savedTutorials: newSavedTutorials })

    try {
      if (isSaved) {
        // Unsave
        console.log("[toggleSaveTutorial] Removing from DB...")
        const { error } = await supabase
          .from('saved_tutorials')
          .delete()
          .eq('user_id', user.id)
          .eq('tutorial_id', tutorialId)
        
        if (error) {
          console.error("[toggleSaveTutorial] Delete Error:", error)
          throw error
        }
        console.log("[toggleSaveTutorial] Removed successfully")
        toast.success("Tutorial removido dos salvos.")
      } else {
        // Save
        console.log("[toggleSaveTutorial] Adding to DB...")
        const { error } = await supabase
          .from('saved_tutorials')
          .insert({ user_id: user.id, tutorial_id: tutorialId })
        
        if (error) {
          logError('toggleSaveTutorial:insert', error, { tutorialId, action: 'insert' })
          throw error
        }
        console.log("[toggleSaveTutorial] Added successfully")
        toast.success("Tutorial salvo com sucesso!")
      }
    } catch (error: any) {
      logError('toggleSaveTutorial', error, { tutorialId, save })
      toast.error('Não foi possível atualizar sua lista de salvos. Tente novamente.')
      // Reverte se der erro
      setUser(prev => prev ? { ...prev, savedTutorials: user.savedTutorials } : null)
    }
  }

  const addAdminLog = (log: Omit<AdminLog, "id" | "createdAt">) => {
    const newLog: AdminLog = {
      ...log,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString("pt-BR"),
    }
    setAdminLogs((prev) => [newLog, ...prev])
  }

  const addCommentToTutorial = (tutorialId: string, comment: Comment) => {
    setTutorials((prev) =>
      prev.map((t) => {
        if (t.id === tutorialId) {
          return {
            ...t,
            comments: [...(t.comments || []), comment],
          }
        }
        return t
      }),
    )
  }

  const createComment = async (tutorialId: string, content: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar.')
      return
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        tutorial_id: tutorialId,
        user_id: user.id,
        user_name: user.name,
        content,
      })
      .select('*')
      .single()

    if (error || !data) {
      logError('createComment', error, { tutorialId, userName: user.name })
      toast.error('Não foi possível postar o comentário.')
      return
    }

    const newComment: Comment = {
      id: data.id,
      tutorialId: data.tutorial_id,
      userId: data.user_id,
      userName: data.user_name,
      content: data.content,
      createdAt: new Date(data.created_at).toLocaleDateString('pt-BR'),
    }

    addCommentToTutorial(tutorialId, newComment)
  }

  const deleteComment = async (tutorialId: string, commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('tutorial_id', tutorialId)

    if (error) {
      logError('deleteComment', error, { commentId, tutorialId })
      toast.error('Não foi possível deletar o comentário.')
      return
    }

    setTutorials((prev) =>
      prev.map((t) => {
        if (t.id === tutorialId && t.comments) {
          return {
            ...t,
            comments: t.comments.filter((c) => c.id !== commentId),
          }
        }
        return t
      }),
    )
  }

  const reportProblem = async (problem: Omit<TutorialProblem, "id" | "createdAt" | "resolved">) => {
    if (!user) {
      toast.error('Você precisa estar logado para relatar um problema.')
      return
    }

    const { data, error } = await supabase
      .from('tutorial_problems')
      .insert({
        tutorial_id: problem.tutorialId,
        user_id: problem.userId,
        user_name: problem.userName,
        step_number: problem.stepNumber,
        description: problem.description,
        resolved: false,
      })
      .select('*')
      .single()

    if (error || !data) {
      logError('reportProblem', error, { tutorialId, stepNumber, userId: user?.id })
      toast.error('Não foi possível relatar o problema. Tente novamente.')
      return
    }

    setProblems((prev) => [
      ...prev,
      {
        id: data.id,
        tutorialId: data.tutorial_id,
        userId: data.user_id,
        userName: data.user_name,
        stepNumber: data.step_number,
        description: data.description,
        createdAt: new Date(data.created_at).toLocaleDateString('pt-BR'),
        resolved: data.resolved,
      },
    ])
  }

  const resolveProblem = async (problemId: string) => {
    const { error } = await supabase
      .from('tutorial_problems')
      .update({ resolved: true })
      .eq('id', problemId)

    if (error) {
      logError('resolveProblem', error, { problemId })
      toast.error('Não foi possível resolver o problema.')
      return
    }

    setProblems((prev) => prev.map((p) => (p.id === problemId ? { ...p, resolved: true } : p)))
  }

  const deleteProblem = async (problemId: string) => {
    try {
      const res = await fetch('/api/admin/problems/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: problemId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao excluir problema')
      }

      setProblems((prev) => prev.filter((p) => p.id !== problemId))
      toast.success('Problema excluído.')
    } catch (error: any) {
      logError('deleteProblem', error, { problemId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir o problema.')
    }
  }

  const deleteRequest = async (requestId: string) => {
    try {
      const res = await fetch('/api/admin/requests/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao excluir requisição')
      }

      setRequests((prev) => prev.filter((request) => request.id !== requestId))
      toast.success('Requisição excluída.')
    } catch (error: any) {
      logError('deleteRequest', error, { requestId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir a requisição.')
    }
  }

  const banUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ban: true }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao banir usuário')
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: true } : u)))
      toast.success('Usuário banido.')
    } catch (error: any) {
      logError('banUser', error, { userId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível banir o usuário.')
    }
  }

  const unbanUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ban: false }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao desbanir usuário')
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: false } : u)))
      toast.success('Usuário desbanido.')
    } catch (error: any) {
      logError('unbanUser', error, { userId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível desbanir o usuário.')
    }
  }

  const promoteToAdmin = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao promover usuário')
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'ADMIN' as const } : u)))
      toast.success('Usuário promovido a admin.')
    } catch (error: any) {
      logError('promoteToAdmin', error, { userId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível promover o usuário.')
    }
  }

  const demoteFromAdmin = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao rebaixar usuário')
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'USER' as const } : u)))
      toast.success('Usuário rebaixado de admin.')
    } catch (error: any) {
      logError('demoteFromAdmin', error, { userId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível rebaixar o usuário.')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao excluir usuário')
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success('Usuário excluído.')
    } catch (error: any) {
      logError('deleteUser', error, { userId })
      toast.error(getUserFriendlyErrorMessage(error) || 'Não foi possível excluir o usuário.')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        signIn,
        signUp,
        updateProfile,
        logout,
        toggleSaveTutorial,
        darkMode,
        setDarkMode,
        tutorials,
        setTutorials,
        problems,
        setProblems,
        requests,
        setRequests,
        users,
        setUsers,
        adminLogs,
        addAdminLog,
        createComment,
        deleteComment,
        reportProblem,
        banUser,
        unbanUser,
        promoteToAdmin,
        demoteFromAdmin,
        deleteUser,
        approveTutorial,
        deleteTutorial,
        incrementTutorialUpvotes,
        resolveProblem,
        deleteProblem,
        deleteRequest,
        refreshData,
        refreshDataFromServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
