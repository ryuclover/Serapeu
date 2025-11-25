"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Bookmark, ChevronRight, Clock, BookOpen, Folder, FolderPlus, Pencil, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type SavedFolder = {
  id: string
  name: string
  tutorialIds: string[]
}

const DEFAULT_FOLDER_ID = "__all__"

export default function SavedTutorialsPage() {
  const { user, tutorials } = useAuth()
  const [savedList, setSavedList] = useState<typeof tutorials>([])

  // pastas locais por usuário (persistidas em localStorage)
  const [folders, setFolders] = useState<SavedFolder[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string>(DEFAULT_FOLDER_ID)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // carrega tutoriais salvos a partir dos ids do usuário
  useEffect(() => {
    if (user?.savedTutorials && tutorials.length > 0) {
      const filtered = tutorials.filter((t) => user.savedTutorials?.includes(t.id))
      setSavedList(filtered)
    } else {
      setSavedList([])
    }
    // consideramos carregado quando este efeito roda ao menos uma vez
    if (user !== undefined) {
      setIsLoading(false)
    }
  }, [user, tutorials])

  // carregar pastas do localStorage quando usuário estiver disponível
  useEffect(() => {
    if (!user) return

    try {
      const raw = window.localStorage.getItem(`saved-folders-${user.id}`)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedFolder[]
        setFolders(parsed)
      } else {
        setFolders([])
      }
    } catch {
      setFolders([])
    }
  }, [user?.id])

  // salvar pastas no localStorage sempre que mudarem
  useEffect(() => {
    if (!user) return
    window.localStorage.setItem(`saved-folders-${user.id}`, JSON.stringify(folders))
  }, [folders, user?.id])

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: SavedFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      tutorialIds: [],
    }

    setFolders((prev) => [...prev, newFolder])
    setNewFolderName("")
    setIsCreatingFolder(false)
  }

  const startRenameFolder = (folder: SavedFolder) => {
    setRenamingFolderId(folder.id)
    setRenameValue(folder.name)
  }

  const handleRenameFolder = () => {
    if (!renamingFolderId) return
    if (!renameValue.trim()) return

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === renamingFolderId ? { ...folder, name: renameValue.trim() } : folder,
      ),
    )
    setRenamingFolderId(null)
    setRenameValue("")
  }

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId))
    if (activeFolderId === folderId) {
      setActiveFolderId(DEFAULT_FOLDER_ID)
    }
  }

  // tutoriais exibidos considerando a pasta ativa
  const visibleTutorials = useMemo(() => {
    if (activeFolderId === DEFAULT_FOLDER_ID) return savedList

    const activeFolder = folders.find((f) => f.id === activeFolderId)
    if (!activeFolder) return savedList

    return savedList.filter((t) => activeFolder.tutorialIds.includes(t.id))
  }, [activeFolderId, folders, savedList])

  if (!user && !isLoading) {
    return (
      <div className="bg-background py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-sm border border-border">
          <Bookmark className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso necessário</h1>
          <p className="text-muted-foreground mb-6">
            Entre na sua conta para ver seus tutoriais salvos.
          </p>
          <Link href="/entrar">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Entrar Agora
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner className="w-6 h-6" />
          <p className="text-sm">Carregando seus tutoriais salvos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Bookmark className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tutoriais Salvos</h1>
              <p className="text-muted-foreground text-sm">
                Organize seus tutoriais em pastas para encontrar tudo mais rápido.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCreatingFolder ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  placeholder="Nome da pasta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-9 w-40 sm:w-52"
                />
                <Button size="sm" onClick={handleCreateFolder}>
                  Criar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsCreatingFolder(true)}>
                <FolderPlus className="w-4 h-4" />
                Nova pasta
              </Button>
            )}
          </div>
        </div>

        {/* Folders */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveFolderId(DEFAULT_FOLDER_ID)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-colors ${
              activeFolderId === DEFAULT_FOLDER_ID
                ? "bg-amber-100 dark:bg-amber-900/40 border-amber-300 text-amber-900 dark:text-amber-100"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Folder className="w-3 h-3" />
            Todas
          </button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                activeFolderId === folder.id
                  ? "bg-amber-100 dark:bg-amber-900/40 border-amber-300 text-amber-900 dark:text-amber-100"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveFolderId(folder.id)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <Folder className="w-3 h-3" />
                {renamingFolderId === folder.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameFolder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameFolder()
                      if (e.key === "Escape") {
                        setRenamingFolderId(null)
                        setRenameValue("")
                      }
                    }}
                    className="h-7 w-24 sm:w-32 text-xs"
                  />
                ) : (
                  <span className="truncate max-w-[6rem] sm:max-w-[8rem]">{folder.name}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => startRenameFolder(folder)}
                className="ml-1 text-muted-foreground/70 hover:text-foreground"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFolder(folder.id)}
                className="ml-0.5 text-muted-foreground/70 hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Conteúdo */}
        {visibleTutorials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTutorials.map((tutorial) => (
              <Link
                key={tutorial.id}
                href={`/tutorial/${tutorial.id}`}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                      {tutorial.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tutorial.createdAt}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {tutorial.description}
                  </p>
                </div>

                <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{tutorial.steps.length} passos</span>
                  </div>
                  <span className="flex items-center text-amber-600 font-medium text-xs group-hover:translate-x-1 transition-transform">
                    Ler Tutorial <ChevronRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum tutorial nesta pasta</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Organize seus tutoriais criando pastas e movendo-os para onde fizer mais sentido para você.
            </p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Explorar Tutoriais
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
