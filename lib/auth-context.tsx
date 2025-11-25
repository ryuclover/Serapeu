"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserType, Tutorial, TutorialProblem, TutorialRequest, AdminLog } from "./types"
import { initialTutorials, initialRequests } from "./types"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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
  deleteComment: (tutorialId: string, commentId: string) => void
  banUser: (userId: string) => void
  unbanUser: (userId: string) => void
  promoteToAdmin: (userId: string) => void
  demoteFromAdmin: (userId: string) => void
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
    const { data: tutorialsData } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    if (tutorialsData) {
      const formattedTutorials: Tutorial[] = tutorialsData.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        steps: t.steps,
        authorId: t.author_id,
        authorName: t.profiles?.name || 'Usuário',
        category: t.category,
        createdAt: new Date(t.created_at).toLocaleDateString('pt-BR'),
        approved: t.approved,
        upvotes: t.upvotes,
        comments: []
      }))
      setTutorials(formattedTutorials)
    }

    // Fetch Requests
    const { data: requestsData } = await supabase
      .from('tutorial_requests')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    if (requestsData) {
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
        answeredTutorialId: r.answered_tutorial_id
      }))
      setRequests(formattedRequests)
    }

    // Fetch Users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersData) {
      const formattedUsers: UserType[] = usersData.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: new Date(u.created_at).toLocaleDateString('pt-BR'),
        banned: u.banned
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

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email!.split('@')[0],
          role: session.user.user_metadata.role || "USER",
          createdAt: session.user.created_at,
          banned: false,
          savedTutorials: savedIds
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

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email!.split('@')[0],
          role: session.user.user_metadata.role || "USER",
          createdAt: session.user.created_at,
          banned: false,
          savedTutorials: savedIds
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

  const deleteComment = (tutorialId: string, commentId: string) => {
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

  const banUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: true } : u)))
  }

  const unbanUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned: false } : u)))
  }

  const promoteToAdmin = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: "ADMIN" as const } : u)))
  }

  const demoteFromAdmin = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: "USER" as const } : u)))
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
        deleteComment,
        banUser,
        unbanUser,
        promoteToAdmin,
        demoteFromAdmin,
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
