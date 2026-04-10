"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserType, Tutorial, TutorialProblem, TutorialRequest, Comment, AdminLog } from "./types"
import { initialTutorials, initialRequests } from "./types"
import { createClient } from "@/lib/supabase/client"
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

export const ADMIN_CREDENTIALS = {
  email: "admin@serapeu.com",
  password: "admin123",
}

interface AuthContextType {
  user: UserType | null
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
  approveTutorial: (tutorialId: string) => Promise<void>
  deleteTutorial: (tutorialId: string) => Promise<void>
  incrementTutorialUpvotes: (tutorialId: string) => Promise<void>
  toggleSaveTutorial: (tutorialId: string) => Promise<void>
  refreshData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [problems, setProblems] = useState<TutorialProblem[]>([])
  const [requests, setRequests] = useState<TutorialRequest[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    // Check for auth code in URL (handling redirect from Supabase)
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      window.location.href = `/auth/callback${window.location.search}`
    }
  }, [])

  const refreshData = async () => {
    // Fetch Tutorials
    let { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    // Fallback: se houver recursao de policy em profiles, busca sem join.
    if ((tutorialsError as SupabaseError | null)?.code === '42P17') {
      const fallback = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false })

      tutorialsData = fallback.data
      tutorialsError = fallback.error
    }

    if (tutorialsError) {
      if (isProfilesPolicyRecursion(tutorialsError as SupabaseError)) {
        setTutorials([])
        setRequests([])
        setUsers([])
        return
      }

      console.warn('Erro ao carregar tutoriais:', tutorialsError)
      toast.error('Não foi possível carregar os tutoriais.')
      const formattedTutorials: Tutorial[] = initialTutorials.map((t) => ({
        ...t,
        createdAt: t.createdAt || new Date().toLocaleDateString('pt-BR'),
      }))
      setTutorials(formattedTutorials)
    } else {
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
      setTutorials(formattedTutorials)
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
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      if (!isProfilesPolicyRecursion(usersError as SupabaseError)) {
        console.warn('Erro ao carregar usuários:', usersError)
      }
      setUsers(initialUsers)
    } else if (usersData) {
      const formattedUsers: UserType[] = (usersData as SupabaseProfileRow[]).map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "USER" | "ADMIN",
        createdAt: new Date(u.created_at).toLocaleDateString('pt-BR'),
        banned: Boolean(u.banned),
      }))
      setUsers(formattedUsers)
    }
  }

  useEffect(() => {
    refreshData()

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch saved tutorials
        const { data: savedData } = await supabase
          .from('saved_tutorials')
          .select('tutorial_id')
          .eq('user_id', session.user.id)
        
        const savedIds = savedData ? savedData.map((s: any) => s.tutorial_id) : []

        // Fetch voted tutorials
        const { data: votedData } = await supabase
          .from('tutorial_votes')
          .select('tutorial_id')
          .eq('user_id', session.user.id)

        const votedIds = votedData ? votedData.map((v: any) => v.tutorial_id) : []

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email!.split('@')[0],
          role: session.user.user_metadata.role || "USER",
          createdAt: session.user.created_at,
          banned: false,
          savedTutorials: savedIds,
          votedTutorials: votedIds,
        })
      }
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch saved tutorials on auth change too
        const { data: savedData } = await supabase
          .from('saved_tutorials')
          .select('tutorial_id')
          .eq('user_id', session.user.id)
        
        const savedIds = savedData ? savedData.map((s: any) => s.tutorial_id) : []

        const { data: votedData } = await supabase
          .from('tutorial_votes')
          .select('tutorial_id')
          .eq('user_id', session.user.id)

        const votedIds = votedData ? votedData.map((v: any) => v.tutorial_id) : []

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email!.split('@')[0],
          role: session.user.user_metadata.role || "USER",
          createdAt: session.user.created_at,
          banned: false,
          savedTutorials: savedIds,
          votedTutorials: votedIds,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
          role: "USER",
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
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateTutorialInState = (tutorialId: string, updater: (tutorial: Tutorial) => Tutorial) => {
    setTutorials((prev) => prev.map((tutorial) => (tutorial.id === tutorialId ? updater(tutorial) : tutorial)))
  }

  const approveTutorial = async (tutorialId: string) => {
    const { error } = await supabase
      .from('tutorials')
      .update({ approved: true })
      .eq('id', tutorialId)

    if (error) {
      toast.error('Não foi possível aprovar o tutorial.')
      throw error
    }

    updateTutorialInState(tutorialId, (tutorial) => ({ ...tutorial, approved: true }))
  }

  const deleteTutorial = async (tutorialId: string) => {
    const { error } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', tutorialId)

    if (error) {
      toast.error('Não foi possível excluir o tutorial.')
      throw error
    }

    setTutorials((prev) => prev.filter((tutorial) => tutorial.id !== tutorialId))
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
          console.error("[toggleSaveTutorial] Insert Error:", error)
          throw error
        }
        console.log("[toggleSaveTutorial] Added successfully")
        toast.success("Tutorial salvo com sucesso!")
      }
    } catch (error: any) {
      console.error('Erro ao salvar tutorial:', error)
      toast.error(`Erro ao salvar: ${error.message || "Tente novamente"}`)
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
      console.error('Erro ao criar comentário:', error)
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
      console.error('Erro ao deletar comentário:', error)
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
      console.error('Erro ao relatar problema:', error)
      toast.error('Não foi possível relatar o problema.')
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
      console.error('Erro ao marcar problema como resolvido:', error)
      toast.error('Não foi possível resolver o problema.')
      return
    }

    setProblems((prev) => prev.map((p) => (p.id === problemId ? { ...p, resolved: true } : p)))
  }

  const deleteProblem = async (problemId: string) => {
    const { error } = await supabase
      .from('tutorial_problems')
      .delete()
      .eq('id', problemId)

    if (error) {
      console.error('Erro ao deletar problema:', error)
      toast.error('Não foi possível excluir o problema.')
      return
    }

    setProblems((prev) => prev.filter((p) => p.id !== problemId))
  }

  const deleteRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('tutorial_requests')
      .delete()
      .eq('id', requestId)

    if (error) {
      console.error('Erro ao deletar requisição:', error)
      toast.error('Não foi possível excluir a requisição.')
      return
    }

    setRequests((prev) => prev.filter((request) => request.id !== requestId))
  }

  const banUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ banned: true })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao banir usuário:', error)
      toast.error('Não foi possível banir o usuário.')
      return
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: true } : u)))
  }

  const unbanUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ banned: false })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao desbanir usuário:', error)
      toast.error('Não foi possível desbanir o usuário.')
      return
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: false } : u)))
  }

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao promover usuário a admin:', error)
      toast.error('Não foi possível promover o usuário.')
      return
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'ADMIN' as const } : u)))
  }

  const demoteFromAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'USER' })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao rebaixar usuário de admin:', error)
      toast.error('Não foi possível rebaixar o usuário.')
      return
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'USER' as const } : u)))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
        approveTutorial,
        deleteTutorial,
        incrementTutorialUpvotes,
        resolveProblem,
        deleteProblem,
        deleteRequest,
        refreshData,
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
