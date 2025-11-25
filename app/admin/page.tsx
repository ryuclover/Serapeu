"use client"

import type React from "react"

import { useState } from "react"
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
import { useAuth } from "@/lib/auth-context"

type TabType = "dashboard" | "tutorials" | "comments" | "users" | "problems" | "requests" | "logs" | "settings"

export default function AdminPage() {
  const router = useRouter()
  const {
    user,
    tutorials,
    setTutorials,
    problems,
    setProblems,
    requests,
    setRequests,
    users,
    adminLogs,
    addAdminLog,
    deleteComment,
    banUser,
    unbanUser,
    promoteToAdmin,
    demoteFromAdmin,
  } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all")

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
  const handleApproveTutorial = (id: string) => {
    const tutorial = tutorials.find((t) => t.id === id)
    setTutorials(tutorials.map((t) => (t.id === id ? { ...t, approved: true } : t)))
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
  }

  const handleDeleteTutorial = (id: string) => {
    const tutorial = tutorials.find((t) => t.id === id)
    setTutorials(tutorials.filter((t) => t.id !== id))
    if (tutorial) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Excluiu tutorial",
        targetType: "tutorial",
        targetId: id,
        targetName: tutorial.title,
      })
    }
  }

  const handleDeleteComment = (tutorialId: string, commentId: string, commentContent: string) => {
    deleteComment(tutorialId, commentId)
    addAdminLog({
      adminId: user.id,
      adminName: user.name,
      action: "Excluiu comentário",
      targetType: "comment",
      targetId: commentId,
      targetName: commentContent.substring(0, 50) + "...",
    })
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

  const handleResolveProblem = (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId)
    setProblems(problems.map((p) => (p.id === problemId ? { ...p, resolved: true } : p)))
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

  const handleDeleteProblem = (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId)
    setProblems(problems.filter((p) => p.id !== problemId))
    if (problem) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Excluiu problema",
        targetType: "problem",
        targetId: problemId,
        targetName: problem.description.substring(0, 50) + "...",
      })
    }
  }

  const handleDeleteRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId)
    setRequests(requests.filter((r) => r.id !== requestId))
    if (request) {
      addAdminLog({
        adminId: user.id,
        adminName: user.name,
        action: "Excluiu requisição",
        targetType: "request",
        targetId: requestId,
        targetName: request.title,
      })
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
                  filteredTutorials.map((tutorial, index) => (
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
                  ))
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
                {tutorials.filter((t) => t.comments && t.comments.length > 0).length > 0 ? (
                  tutorials
                    .filter((t) => t.comments && t.comments.length > 0)
                    .map((tutorial) => (
                      <div key={tutorial.id} className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 bg-secondary/50 border-b border-border">
                          <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
                          <p className="text-sm text-muted-foreground">{tutorial.comments?.length} comentários</p>
                        </div>
                        <div className="p-4 space-y-3">
                          {tutorial.comments?.map((comment) => (
                            <div
                              key={comment.id}
                              className="flex items-start justify-between gap-4 p-3 bg-secondary/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground text-sm">{comment.userName}</span>
                                  <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                              </div>
                              <Button
                                onClick={() => handleDeleteComment(tutorial.id, comment.id, comment.content)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className="text-left p-4 font-medium text-foreground">Usuário</th>
                        <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">Email</th>
                        <th className="text-left p-4 font-medium text-foreground hidden lg:table-cell">Data</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-right p-4 font-medium text-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                {u.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                  {u.name}
                                  {u.role === "ADMIN" && <Crown className="w-4 h-4 text-amber-500" />}
                                </p>
                                <p className="text-xs text-muted-foreground md:hidden">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{u.email}</td>
                          <td className="p-4 text-muted-foreground hidden lg:table-cell">{u.createdAt}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                u.banned
                                  ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                  : "bg-green-500/20 text-green-600 dark:text-green-400"
                              }`}
                            >
                              {u.banned ? "Banido" : "Ativo"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              {u.banned ? (
                                <Button
                                  onClick={() => handleUnbanUser(u.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleBanUser(u.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              {u.role === "ADMIN" ? (
                                <Button
                                  onClick={() => handleDemoteUser(u.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-600"
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handlePromoteUser(u.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-amber-600"
                                >
                                  <Crown className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                {problems.length > 0 ? (
                  problems.map((problem, index) => {
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
                {requests.length > 0 ? (
                  requests.map((request, index) => (
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
