import Link from "next/link"
import { FiHome, FiSmartphone } from "react-icons/fi"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
          <FiSmartphone size={48} className="text-blue-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Página não encontrada</p>
        <p className="mt-2 text-sm text-gray-400">
          A página que você procura não existe ou foi removida.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <FiHome size={18} />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}
