"use client"

import { useState, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Role } from "@/types"
import { Spinner } from "@/components/ui/Spinner"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
}

export function DashboardLayout({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user) {
    redirect("/login")
  }

  const user = session.user

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        userName={user.name || "Usuário"}
        userRole={(user.role as Role) || "Tecnico"}
        userEmail={user.email || ""}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header
          title={title}
          userName={user.name || "Usuário"}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
