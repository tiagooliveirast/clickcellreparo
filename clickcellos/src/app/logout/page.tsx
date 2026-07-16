"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { Spinner } from "@/components/ui/Spinner"

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Saindo...</p>
      </div>
    </div>
  )
}
