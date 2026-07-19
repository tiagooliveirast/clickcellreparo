"use client"

import { useState, FormEvent, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FiSmartphone, FiMail, FiLock } from "react-icons/fi"

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(searchParams.get("error") ? "Email ou senha inválidos" : "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    await signIn("credentials", { email, password, redirect: true, callbackUrl: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <FiSmartphone size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Click Cell OS</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistema de Ordens de Serviço
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<FiMail size={18} />}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<FiLock size={18} />}
              required
            />
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="mt-6 w-full"
            size="lg"
          >
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Acesse o portal do cliente em{" "}
          <span className="text-blue-600">
            clickcell.com.br/sua-unidade
          </span>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
