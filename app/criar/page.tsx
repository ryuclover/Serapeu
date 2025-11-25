"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PlusCircle, Trash2, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
// import { Navbar } from "@/components/navbar"
import { categories } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

export default function CreateTutorialPage() {
  const router = useRouter()
  const { user, refreshData } = useAuth()
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Tecnologia")
  const [steps, setSteps] = useState<string[]>([""])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addStep = () => setSteps([...steps, ""])
  const updateStep = (index: number, value: string) => {
    const updated = [...steps]
    updated[index] = value
    setSteps(updated)
  }
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title || !description || steps.filter((s) => s.trim()).length === 0) return

    setIsSubmitting(true)

    const { error } = await supabase
      .from('tutorials')
      .insert({
        title,
        description,
        steps: steps.filter((s) => s.trim()),
        author_id: user.id,
        category,
        approved: user.role === "ADMIN"
      })

    if (error) {
      console.error('Error creating tutorial:', error)
      setIsSubmitting(false)
      return
    }

    await refreshData()
    router.push("/")
  }

  if (!user) {
    return (
      <div className="bg-background">
        <div className="py-8 px-4 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso necessário</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para criar um tutorial.</p>
          <Link
            href="/entrar"
            className="inline-flex px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
          >
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="py-8 px-4 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h1 className="text-2xl font-bold text-foreground mb-2">Criar Tutorial</h1>
          <p className="text-muted-foreground mb-6">Compartilhe seu conhecimento com a comunidade</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Como fazer..."
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uma breve descrição do tutorial..."
                rows={3}
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Categoria
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Passos</label>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                    <span className="flex-shrink-0 w-10 h-12 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder={`Descreva o passo ${index + 1}...`}
                      className="flex-1 px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addStep}
                className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
              >
                <PlusCircle className="w-5 h-5" />
                Adicionar Passo
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Publicar"
                )}
              </button>
            </div>

            {user.role !== "ADMIN" && (
              <p className="text-sm text-muted-foreground text-center bg-secondary/50 p-3 rounded-lg">
                Seu tutorial será enviado para aprovação dos moderadores.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
