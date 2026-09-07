"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface StepContentProps {
  content: string
}

export function StepContent({ content }: StepContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Divide o conteúdo procurando blocos de código com ```
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3 text-foreground leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extrai conteúdo do bloco de código
          const lines = part.slice(3, -3).trim().split("\n")
          const firstLine = lines[0]?.trim() || ""
          const hasLanguage = /^[a-zA-Z0-9_-]+$/.test(firstLine)
          const language = hasLanguage ? firstLine : "código"
          const code = (hasLanguage ? lines.slice(1) : lines).join("\n")

          return (
            <div
              key={index}
              className="relative my-3 rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-950 text-zinc-100 font-mono text-sm shadow-md"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400">
                <span className="uppercase font-semibold tracking-wider">{language}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(code, index)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors text-xs font-sans"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Renderiza texto comum com suporte a `código em linha`
        const inlineParts = part.split(/(`[^`]+`)/g)

        return (
          <p key={index} className="whitespace-pre-line">
            {inlineParts.map((subPart, subIndex) => {
              if (subPart.startsWith("`") && subPart.endsWith("`") && subPart.length > 2) {
                const inlineCode = subPart.slice(1, -1)
                return (
                  <code
                    key={subIndex}
                    className="mx-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-xs md:text-sm border border-amber-500/30"
                  >
                    {inlineCode}
                  </code>
                )
              }
              return subPart
            })}
          </p>
        )
      })}
    </div>
  )
}
