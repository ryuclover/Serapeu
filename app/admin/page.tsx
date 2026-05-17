"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Check,
  Trash2,
  ChevronLeft,
  BookOpen,
  Users,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Settings,
  Clock,
  Ban,
  UserCheck,
  UserX,
  Crown,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/pagination"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"

type TabType = "dashboard" | "tutorials" | "comments" | "users" | "problems" | "requests" | "logs" | "settings"

export default function AdminPage() {
  const router = useRouter()
  const {
    user,
    authReady,
    tutorials,
    problems,
    setProblems,
    requests,
    setRequests,
    users,
    adminLogs,
    addAdminLog,
    deleteComment,
    resolveProblem,
    deleteProblem,
    deleteRequest,
    deleteUser,
    banUser,
    unbanUser,
    promoteToAdmin,
    demoteFromAdmin,
    approveTutorial,
    deleteTutorial,
    refreshDataFromServer,
  } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>("tutorials")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("pending")

  // Estados para confirmação de delete
  const didLoadAdminData = useRef(false)

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: "tutorial" | "comment" | "user" | "problem" | "request" | null
    id: string | null
    name: string | null
    tutorialId?: string // Para comentários
  }>({
    isOpen: false,
    type: null,
    id: null,
    name: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState({
    tutorials: 1,
    comments: 1,
    users: 1,
    problems: 1,
    requests: 1,
  })
  const ITEMS_PER_PAGE = 10
  const usersTableRef = useRef<HTMLDivElement | null>(null)
  const usersTabulatorRef = useRef<any>(null)
  const currentUserId = user?.id ?? null

  const getFilteredUsers = () =>
    users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  useEffect(() => {
    if (activeTab !== "users" || !currentUserId) {
      return
    }

    let disposed = false

    const initializeTabulator = async () => {
      if (!usersTableRef.current) return

      const filteredUsersData = getFilteredUsers()
      const tabulatorModule = await import("tabulator-tables")
      const Tabulator =
        (tabulatorModule as any).default ??
        (tabulatorModule as any).TabulatorFull ??
        (tabulatorModule as any)

      if (typeof Tabulator !== "function") {
        console.error("[Admin] Tabulator constructor not found", tabulatorModule)
        return
      }

      const escapeHtml = (value: string) =>
        value.replace(/[&<>'"]/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[char] as string)

      const formatStatus = (isBanned: boolean) =>
        `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          isBanned
            ? "bg-red-500/15 text-red-600 dark:text-red-400"
            : "bg-green-500/15 text-green-600 dark:text-green-400"
        }">${isBanned ? "Banido" : "Ativo"}</span>`

      const table = new Tabulator(usersTableRef.current, {
        data: filteredUsersData,
        layout: "fitColumns",
        placeholder: "Nenhum usuário encontrado",
        height: "100%",
        pagination: "local",
        paginationSize: ITEMS_PER_PAGE,
        paginationSizeSelector: [10, 20, 50],
        reactiveData: false,
        columns: [
          {
            title: "Usuário",
            field: "name",
            headerSort: true,
            minWidth: 240,
            formatter: (cell: any) => {
              const row = cell.getRow().getData()
              const initial = String(row.name || "U").charAt(0).toUpperCase()
              const name = escapeHtml(String(row.name || "Usuário"))
              const roleIcon = row.role === "ADMIN" ? `<span class="ml-2 text-amber-500">★</span>` : ""

              return `
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 font-bold text-white">
                    ${escapeHtml(initial)}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1 truncate font-medium text-foreground">
                      <span class="truncate">${name}</span>
                      ${roleIcon}
                    </div>
                    <div class="text-xs text-muted-foreground md:hidden">${escapeHtml(String(row.email || ""))}</div>
                  </div>
                </div>
              `
            },
          },
          {
            title: "Email",
            field: "email",
            minWidth: 240,
            responsive: 2,
            formatter: (cell: any) => `<span class="text-muted-foreground">${escapeHtml(String(cell.getValue() || ""))}</span>`,
          },
          {
            title: "Data",
            field: "createdAt",
            minWidth: 140,
            responsive: 3,
            formatter: (cell: any) => `<span class="text-muted-foreground">${escapeHtml(String(cell.getValue() || ""))}</span>`,
          },
          {
            title: "Status",
            field: "banned",
            hozAlign: "left",
            width: 120,
            formatter: (cell: any) => formatStatus(Boolean(cell.getValue())),
          },
          {
            title: "Ações",
            hozAlign: "right",
            headerSort: false,
            widthGrow: 2,
            minWidth: 220,
            formatter: (cell: any) => {
              const row = cell.getRow().getData()
              const isCurrentUser = row.id === currentUserId
              return `
                <div class="flex justify-end gap-2">
                  <button data-action="${row.banned ? "unban" : "ban"}" class="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50" ${
                    isCurrentUser ? "disabled" : ""
                  }>
                    ${row.banned ? "Desbanir" : "Banir"}
                  </button>
                  <button data-action="${row.role === "ADMIN" ? "demote" : "promote"}" class="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50" ${
                    isCurrentUser ? "disabled" : ""
                  }>
                    ${row.role === "ADMIN" ? "Rebaixar" : "Promover"}
                  </button>
                  <button data-action="delete" class="inline-flex items-center rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50" ${
                    isCurrentUser ? "disabled" : ""
                  }>
                    Excluir
                  </button>
                </div>
              `
            },
            cellClick: (_e: MouseEvent, cell: any) => {
              const target = _e.target as HTMLElement | null
              const actionButton = target?.closest("[data-action]") as HTMLElement | null

              if (!actionButton) return

              const action = actionButton.dataset.action
              const row = cell.getRow().getData()

              if (action === "ban") handleBanUser(row.id)
              if (action === "unban") handleUnbanUser(row.id)
              if (action === "promote") handlePromoteUser(row.id)
              if (action === "demote") handleDemoteUser(row.id)
              if (action === "delete") handleDeleteUser(row.id)
            },
          },
        ],
      })

      usersTabulatorRef.current = table

      if (disposed) {
        table.destroy()
        usersTabulatorRef.current = null
        return
      }
    }

    initializeTabulator()

    return () => {
      disposed = true
      if (usersTabulatorRef.current) {
        usersTabulatorRef.current.destroy()
        usersTabulatorRef.current = null
      }
    }
  }, [activeTab, users, searchTerm, currentUserId])

  useEffect(() => {
    if (activeTab !== "users" || !usersTabulatorRef.current) return
    usersTabulatorRef.current.replaceData(getFilteredUsers())
  }, [users, searchTerm, activeTab])

  if (!authReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Spinner className="w-8 h-8 mx-auto mb-4 text-amber-600" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Carregando painel</h1>
          <p className="text-muted-foreground">Verificando sua sessão de administrador...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não for admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="p-4 bg-amber-500/20 rounded-2xl w-fit mx-auto mb-6">
            <Shield className="w-16 h-16 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">Esta área é exclusiva para administradores.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/entrar">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Shield className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Voltar para Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Estatísticas
  const stats = {
    totalTutorials: tutorials.length,
    pendingTutorials: tutorials.filter((t) => !t.approved).length,
    approvedTutorials: tutorials.filter((t) => t.approved).length,
    totalUsers: users.length,
    bannedUsers: users.filter((u) => u.banned).length,
    totalComments: tutorials.reduce((acc, t) => acc + (t.comments?.length || 0), 0),
    totalProblems: problems.length,
    unresolvedProblems: problems.filter((p) => !p.resolved).length,
    totalRequests: requests.length,
    unansweredRequests: requests.filter((r) => !r.answered).length,
  }

  // Handlers
  const handleApproveTutorial = async (id: string) => {
    const tutorial = tutorials.find((t) => t.id === id)

    try {
      const res = await fetch('/api/admin/tutorials/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao aprovar tutorial')
      }
      if (tutorial) {
        addAdminLog({
          adminId: user.id,
          adminName: user.name,
          action: "Aprovou tutorial",
          targetType: "tutorial",
          targetId: id,
          targetName: tutorial.title,
        })
      }
    } catch (error) {
      console.error('Erro ao aprovar tutorial:', error)
    }
  }

  const handleDeleteTutorial = async (id: string) => {
    const tutorial = tutorials.find((t) => t.id === id)
    setDeleteConfirm({
      isOpen: true,
      type: "tutorial",
      id,
      name: tutorial?.title || "Tutorial",
    })
  }

  const confirmDeleteTutorial = async () => {
    if (!deleteConfirm.id) return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/admin/tutorials/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteConfirm.id }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Erro ao excluir tutorial')
      }
      const tutorial = tutorials.find((t) => t.id === deleteConfirm.id)
      if (tutorial) {
        addAdminLog({
          adminId: user.id,
          adminName: user.name,
          action: "Excluiu tutorial",
          targetType: "tutorial",
          targetId: deleteConfirm.id,
          targetName: tutorial.title,
        })
      }
    } catch (error) {
      console.error('Erro ao excluir tutorial:', error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: null })
    }
  }

  const handleDeleteComment = (tutorialId: string, commentId: string, commentContent: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: "comment",
      id: commentId,
      name: commentContent.substring(0, 50) + "...",
      tutorialId,
    })
  }

  const confirmDeleteComment = () => {
    if (!deleteConfirm.id || !deleteConfirm.tutorialId) return
    setIsDeleting(true)
    try {
      deleteComment(deleteConfirm.tutorialId, deleteConfirm.id)
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Excluiu comentário",
        targetType: "comment",
        targetId: deleteConfirm.id,
        targetName: deleteConfirm.name || "Comentário",
      })
    } catch (error) {
      console.error('Erro ao excluir comentário:', error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: null })
    }
  }

  const handleBanUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    banUser(userId)
    if (targetUser) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Baniu usuário",
        targetType: "user",
        targetId: userId,
        targetName: targetUser.name,
      })
    }
  }

  const handleUnbanUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    unbanUser(userId)
    if (targetUser) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Desbaniu usuário",
        targetType: "user",
        targetId: userId,
        targetName: targetUser.name,
      })
    }
  }

  const handlePromoteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    promoteToAdmin(userId)
    if (targetUser) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Promoveu a admin",
        targetType: "user",
        targetId: userId,
        targetName: targetUser.name,
      })
    }
  }

  const handleDemoteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    demoteFromAdmin(userId)
    if (targetUser) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Rebaixou de admin",
        targetType: "user",
        targetId: userId,
        targetName: targetUser.name,
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    setDeleteConfirm({
      isOpen: true,
      type: "user",
      id: userId,
      name: targetUser?.name || "Usuário",
    })
  }

  const confirmDeleteUser = async () => {
    if (!deleteConfirm.id) return
    setIsDeleting(true)
    try {
      await deleteUser(deleteConfirm.id)
      const targetUser = users.find((u) => u.id === deleteConfirm.id)
      if (targetUser) {
        addAdminLog({
          adminId: user.id,
          adminName: user.name,
          action: "Excluiu usuário",
          targetType: "user",
          targetId: deleteConfirm.id,
          targetName: targetUser.name,
        })
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: null })
    }
  }

  const handleResolveProblem = async (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId)
    await resolveProblem(problemId)
    if (problem) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Marcou problema como resolvido",
        targetType: "problem",
        targetId: problemId,
        targetName: problem.description.substring(0, 50) + "...",
      })
    }
  }

  const handleDeleteProblem = async (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId)
    setDeleteConfirm({
      isOpen: true,
      type: "problem",
      id: problemId,
      name: problem?.description.substring(0, 50) + "..." || "Problema",
    })
  }

  const confirmDeleteProblem = async () => {
    if (!deleteConfirm.id) return
    setIsDeleting(true)
    try {
      await deleteProblem(deleteConfirm.id)
      const problem = problems.find((p) => p.id === deleteConfirm.id)
      if (problem) {
        addAdminLog({
          adminId: user.id,
          adminName: user.name,
          action: "Excluiu problema",
          targetType: "problem",
          targetId: deleteConfirm.id,
          targetName: problem.description.substring(0, 50) + "...",
        })
      }
    } catch (error) {
      console.error('Erro ao excluir problema:', error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: null })
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId)
    setDeleteConfirm({
      isOpen: true,
      type: "request",
      id: requestId,
      name: request?.title || "Requisição",
    })
  }

  const confirmDeleteRequest = async () => {
    if (!deleteConfirm.id) return
    setIsDeleting(true)
    try {
      await deleteRequest(deleteConfirm.id)
      const request = requests.find((r) => r.id === deleteConfirm.id)
      if (request) {
        addAdminLog({
          adminId: user.id,
          adminName: user.name,
          action: "Excluiu requisição",
          targetType: "request",
          targetId: deleteConfirm.id,
          targetName: request.title,
        })
      }
    } catch (error) {
      console.error('Erro ao excluir requisição:', error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: null })
    }
  }

  // Filtros
  const filteredTutorials = tutorials.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && !t.approved) ||
      (filterStatus === "approved" && t.approved)
    return matchesSearch && matchesFilter
  })

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Funções para paginação
  function getPaginatedData<T>(data: T[], page: number) {
    const start = (page - 1) * ITEMS_PER_PAGE
    return data.slice(start, start + ITEMS_PER_PAGE)
  }

  const getTotalPages = (dataLength: number) => Math.ceil(dataLength / ITEMS_PER_PAGE)

  const paginatedTutorials = getPaginatedData(filteredTutorials, currentPage.tutorials)
  const paginatedComments = getPaginatedData(
    tutorials.flatMap((t) => t.comments?.map((c) => ({ ...c, tutorialId: t.id })) || []),
    currentPage.comments,
  )
  const paginatedProblems = getPaginatedData(problems, currentPage.problems)
  const paginatedRequests = getPaginatedData(requests, currentPage.requests)

  // Tabs do menu lateral
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "tutorials", label: "Tutoriais", icon: <BookOpen className="w-5 h-5" />, badge: stats.pendingTutorials },
    { id: "comments", label: "Comentários", icon: <MessageSquare className="w-5 h-5" />, badge: stats.totalComments },
    { id: "users", label: "Usuários", icon: <Users className="w-5 h-5" />, badge: stats.totalUsers },
    {
      id: "problems",
      label: "Problemas",
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: stats.unresolvedProblems,
    },
    { id: "requests", label: "Requisições", icon: <HelpCircle className="w-5 h-5" />, badge: stats.unansweredRequests },
    { id: "logs", label: "Logs", icon: <Clock className="w-5 h-5" /> },
    { id: "settings", label: "Configurações", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] p-4 hidden lg:block">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Painel Admin</h2>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-border">
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.slice(0, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  activeTab === tab.id ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                }`}
              >
                {tab.icon}
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral da plataforma Serapeu</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Tutoriais"
                  value={stats.totalTutorials}
                  subtitle={`${stats.pendingTutorials} pendentes`}
                  icon={<BookOpen className="w-6 h-6" />}
                  color="amber"
                />
                <StatCard
                  title="Usuários"
                  value={stats.totalUsers}
                  subtitle={`${stats.bannedUsers} banidos`}
                  icon={<Users className="w-6 h-6" />}
                  color="blue"
                />
                <StatCard
                  title="Problemas"
                  value={stats.totalProblems}
                  subtitle={`${stats.unresolvedProblems} não resolvidos`}
                  icon={<AlertTriangle className="w-6 h-6" />}
                  color="red"
                />
                <StatCard
                  title="Requisições"
                  value={stats.totalRequests}
                  subtitle={`${stats.unansweredRequests} sem resposta`}
                  icon={<HelpCircle className="w-6 h-6" />}
                  color="green"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    onClick={() => setActiveTab("tutorials")}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-xs">Aprovar Tutoriais</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("problems")}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="text-xs">Ver Problemas</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("users")}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-xs">Gerenciar Usuários</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("logs")}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-xs">Ver Logs</span>
                  </Button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Atividade Recente</h3>
                {adminLogs.length > 0 ? (
                  <div className="space-y-3">
                    {adminLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            <strong>{log.adminName}</strong> {log.action}
                          </p>
                          <p className="text-xs text-muted-foreground">{log.targetName}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.createdAt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhuma atividade recente</p>
                )}
              </div>
            </div>
          )}

          {/* Tutorials Tab */}
          {activeTab === "tutorials" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciar Tutoriais</h1>
                  <p className="text-muted-foreground">Aprove, edite ou exclua tutoriais</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tutoriais..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendentes</option>
                    <option value="approved">Aprovados</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTutorials.length > 0 ? (
                  <>
                    {paginatedTutorials.map((tutorial, index) => {
                      return (
                        <div
                          key={tutorial.id}
                          className="p-5 bg-card rounded-xl border border-border animate-in fade-in slide-in-from-left-2 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  {tutorial.authorName}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{tutorial.createdAt}</span>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    tutorial.approved
                                      ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                      : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                  }`}
                                >
                                  {tutorial.approved ? "Aprovado" : "Pendente"}
                                </span>
                              </div>
                              <h3 className="font-semibold text-foreground text-lg mb-1">{tutorial.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  {tutorial.steps.length} passos
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  {tutorial.comments?.length || 0} comentários
                                </span>
                                <span className="px-2 py-0.5 bg-secondary rounded-full">{tutorial.category}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/tutorial/${tutorial.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                              </Link>
                              {!tutorial.approved && (
                                <Button
                                  onClick={() => handleApproveTutorial(tutorial.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                              )}
                              <Button onClick={() => handleDeleteTutorial(tutorial.id)} variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <Pagination
                      currentPage={currentPage.tutorials}
                      totalPages={getTotalPages(filteredTutorials.length)}
                      onPageChange={(page) =>
                        setCurrentPage((prev) => ({ ...prev, tutorials: page }))
                      }
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={filteredTutorials.length}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum tutorial encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciar Comentários</h1>
                <p className="text-muted-foreground">Modere os comentários da plataforma</p>
              </div>

              <div className="space-y-4">
                {paginatedComments.length > 0 ? (
                  <>
                    {paginatedComments.map((comment) => {
                      const tutorial = tutorials.find((t) => t.id === (comment as any).tutorialId)
                      return (
                        <div
                          key={comment.id}
                          className="flex items-start justify-between gap-4 p-3 bg-card rounded-xl border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground text-sm">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                            <p className="text-xs text-muted-foreground">Tutorial: {tutorial?.title || '—'}</p>
                          </div>
                          <Button
                            onClick={() => handleDeleteComment((comment as any).tutorialId, comment.id, comment.content)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}

                    <Pagination
                      currentPage={currentPage.comments}
                      totalPages={getTotalPages(tutorials.flatMap((t) => t.comments || []).length)}
                      onPageChange={(page) => setCurrentPage((prev) => ({ ...prev, comments: page }))}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={tutorials.flatMap((t) => t.comments || []).length}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum comentário encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciar Usuários</h1>
                  <p className="text-muted-foreground">Administre os usuários da plataforma</p>
                </div>
                <div className="relative lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div ref={usersTableRef} className="tabulator-admin-users min-h-[420px]" />
                <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filteredUsers.length} usuário(s) encontrado(s)</span>
                  <span>Use a busca para filtrar a lista</span>
                </div>
              </div>
            </div>
          )}

          {/* Problems Tab */}
          {activeTab === "problems" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Problemas Relatados</h1>
                <p className="text-muted-foreground">Gerencie os problemas reportados nos tutoriais</p>
              </div>

              <div className="space-y-4">
                {paginatedProblems.length > 0 ? (
                  paginatedProblems.map((problem, index) => {
                    const tutorial = tutorials.find((t) => t.id === problem.tutorialId)
                    return (
                      <div
                        key={problem.id}
                        className="p-5 bg-card rounded-xl border border-border animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                              <span className="text-amber-600 dark:text-amber-400 font-medium">{problem.userName}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{problem.createdAt}</span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  problem.resolved
                                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                    : "bg-red-500/20 text-red-600 dark:text-red-400"
                                }`}
                              >
                                {problem.resolved ? "Resolvido" : "Pendente"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Tutorial:</strong> {tutorial?.title || "Tutorial não encontrado"}
                            </p>
                            {problem.stepNumber && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Passo:</strong> #{problem.stepNumber}
                              </p>
                            )}
                            <p className="text-foreground">{problem.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {!problem.resolved && (
                              <Button
                                onClick={() => handleResolveProblem(problem.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Resolver
                              </Button>
                            )}
                            <Button onClick={() => handleDeleteProblem(problem.id)} variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                    ) : (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Tudo em dia!</p>
                    <p className="text-muted-foreground">Nenhum problema relatado</p>
                  </div>
                )}
                  {paginatedProblems.length > 0 && (
                    <div className="pt-4">
                      <Pagination
                        currentPage={currentPage.problems}
                        totalPages={getTotalPages(problems.length)}
                        onPageChange={(page) => setCurrentPage((prev) => ({ ...prev, problems: page }))}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={problems.length}
                      />
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Requisições de Tutoriais</h1>
                <p className="text-muted-foreground">Gerencie os pedidos da comunidade</p>
              </div>

              <div className="space-y-4">
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request, index) => (
                    <div
                      key={request.id}
                      className="p-5 bg-card rounded-xl border border-border animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                            <span className="text-amber-600 dark:text-amber-400 font-medium">{request.userName}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{request.createdAt}</span>
                            <span className="px-2 py-0.5 bg-secondary rounded-full text-xs">{request.category}</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {request.upvotes} votos
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground text-lg mb-1">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                        </div>
                        <Button onClick={() => handleDeleteRequest(request.id)} variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                  ) : (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma requisição encontrada</p>
                  </div>
                )}
                  {paginatedRequests.length > 0 && (
                    <div className="pt-4">
                      <Pagination
                        currentPage={currentPage.requests}
                        totalPages={getTotalPages(requests.length)}
                        onPageChange={(page) => setCurrentPage((prev) => ({ ...prev, requests: page }))}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={requests.length}
                      />
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Logs de Administração</h1>
                <p className="text-muted-foreground">Histórico de ações administrativas</p>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {adminLogs.length > 0 ? (
                  <div className="divide-y divide-border">
                    {adminLogs.map((log, index) => (
                      <div
                        key={log.id}
                        className="p-4 hover:bg-secondary/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg ${
                              log.action.includes("Excluiu") || log.action.includes("Baniu")
                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                : log.action.includes("Aprovou") || log.action.includes("Desbaniu")
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground">
                              <strong>{log.adminName}</strong> {log.action}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.targetType}: {log.targetName}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">{log.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum log registrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações da plataforma</p>
              </div>

              <div className="grid gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações Gerais
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Aprovação automática</p>
                        <p className="text-sm text-muted-foreground">Tutoriais são aprovados automaticamente</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Desativado
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Notificações por email</p>
                        <p className="text-sm text-muted-foreground">Receber alertas de novos conteúdos</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ativado
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Modo manutenção</p>
                        <p className="text-sm text-muted-foreground">Colocar o site em manutenção</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Desativado
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Segurança
                  </h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Alterar senha de admin
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar todos os logs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Dialog de Confirmação de Delete */}
        <ConfirmDeleteDialog
          isOpen={deleteConfirm.isOpen}
          title={`Deletar ${
            deleteConfirm.type === "tutorial"
              ? "tutorial"
              : deleteConfirm.type === "comment"
                ? "comentário"
                : deleteConfirm.type === "user"
                  ? "usuário"
                  : deleteConfirm.type === "problem"
                    ? "problema"
                    : "requisição"
          }?`}
          description={`Tem certeza que deseja deletar "${deleteConfirm.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={async () => {
            switch (deleteConfirm.type) {
              case "tutorial":
                await confirmDeleteTutorial()
                break
              case "comment":
                confirmDeleteComment()
                break
              case "user":
                await confirmDeleteUser()
                break
              case "problem":
                await confirmDeleteProblem()
                break
              case "request":
                await confirmDeleteRequest()
                break
            }
          }}
          onCancel={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: null })}
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}

// Componente auxiliar para cards de estatísticas
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: "amber" | "blue" | "red" | "green"
}) {
  const colorClasses = {
    amber: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    red: "bg-red-500/20 text-red-600 dark:text-red-400",
    green: "bg-green-500/20 text-green-600 dark:text-green-400",
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}
