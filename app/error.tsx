"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-500/10 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </div>

      <h1 className="text-4xl font-bold text-red-500 mb-2">
        Erro Inesperado
      </h1>
      <h2 className="text-xl font-semibold text-white mb-4">Algo deu errado</h2>

      <p className="text-gray-400 max-w-md mb-8">
        Desculpe, ocorreu um erro inesperado ao processar sua solicitação. Nossa
        equipe foi notificada e está trabalhando para resolver o problema.
      </p>

      <div className="flex gap-4 mb-8">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium border border-gray-700"
        >
          <Home className="w-4 h-4" />
          Página Inicial
        </Link>
      </div>

      <div className="border-t border-gray-800 pt-6 w-full max-w-lg">
        <p className="text-sm text-gray-500">
          Se o problema persistir, entre em contato com o{" "}
          <span className="text-orange-500 font-medium cursor-pointer hover:underline">
            suporte
          </span>
          .
        </p>
      </div>
    </div>
  );
}
