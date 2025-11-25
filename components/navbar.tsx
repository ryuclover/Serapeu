"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  PlusCircle,
  Shield,
  Menu,
  X,
  TrendingUp,
  MessageCircle,
  Home,
  Info,
  Bookmark,
  BookOpen,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "./logo"

export function Navbar() {
  const router = useRouter()
  const { user, logout, darkMode, setDarkMode, tutorials } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pendingCount = tutorials.filter((t) => !t.approved).length

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`)
      setMobileMenuOpen(false)
    }
  }

  const handleNavigation = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold">Serapeu</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-200" />
              <input
                type="text"
                placeholder="Como fazer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-amber-700/50 dark:bg-amber-800/50 text-white placeholder-amber-200 rounded-full border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-amber-700/50 text-white hover:bg-amber-700/70 transition-colors"
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/criar"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-full font-medium hover:bg-amber-50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Criar
                </Link>
                
                <Link
                  href="/salvos"
                  className="p-2 rounded-full bg-amber-700/50 text-white hover:bg-amber-700/70 transition-colors"
                  aria-label="Salvos"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                <Link
                  href="/perfil"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-700/50 text-white rounded-full font-medium hover:bg-amber-700/70 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Link>

                {/* Admin button removed */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-amber-700/50 text-white hover:bg-amber-700/70 transition-colors"
                  aria-label="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/entrar"
                className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-full font-medium hover:bg-amber-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Entrar
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-amber-700/50 text-white hover:bg-amber-700/70 transition-colors"
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-amber-700/50 text-white hover:bg-amber-700/70 transition-colors"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Menu panel */}
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Como fazer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>

            {/* Navigation links */}
            <nav className="p-2">
              <Link
                href="/"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-primary" />
                <span>Página Inicial</span>
              </Link>
              <Link
                href="/?view=trending"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span>Em Alta</span>
              </Link>
              <Link
                href="/perguntas"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <span>Perguntas</span>
              </Link>
              <Link
                href="/sobre"
                onClick={handleNavigation}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Info className="w-5 h-5 text-blue-500" />
                <span>Sobre</span>
              </Link>
            </nav>

            {/* User actions */}
            <div className="p-2 border-t border-border">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm text-muted-foreground">Logado como</p>
                    <p className="font-medium text-foreground">{user.name}</p>
                  </div>
                  <Link
                    href="/criar"
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 text-green-500" />
                    <span>Criar Tutorial</span>
                  </Link>
                  {/* Admin mobile button removed */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/entrar"
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span>Entrar</span>
                  </Link>
                  <Link
                    href="/registrar"
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-4 py-3 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Criar Conta</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
