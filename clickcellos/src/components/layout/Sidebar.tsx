"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Role } from "@/types"
import { cn } from "@/lib/utils"
import {
  FiHome,
  FiUsers,
  FiClipboard,
  FiSettings,
  FiLogOut,
  FiDollarSign,
  FiGrid,
  FiUserCheck,
  FiCpu,
} from "react-icons/fi"
import { signOut } from "next-auth/react"

interface SidebarProps {
  userName: string
  userRole: Role
  userEmail: string
  sidebarOpen?: boolean
  onToggle?: () => void
}

interface MenuItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: Role[]
}

function getMenuItems(userRole: Role): MenuItem[] {
  const dashboardHref = `/${userRole.toLowerCase()}`
  return [
    {
      label: "Dashboard",
      href: dashboardHref,
      icon: <FiHome size={20} />,
      roles: ["Master", "Franqueado", "Tecnico", "Motoboy"],
    },
    {
      label: "Franquias",
      href: "/unidades",
      icon: <FiGrid size={20} />,
      roles: ["Master"],
    },
    {
      label: "Usuários",
      href: "/equipe",
      icon: <FiUsers size={20} />,
      roles: ["Master"],
    },
    {
      label: "O.S. Global",
      href: "/ordens",
      icon: <FiClipboard size={20} />,
      roles: ["Master"],
    },
    {
      label: "Financeiro",
      href: "/financeiro",
      icon: <FiDollarSign size={20} />,
      roles: ["Master", "Franqueado"],
    },
    {
      label: "O.S.",
      href: "/ordens",
      icon: <FiClipboard size={20} />,
      roles: ["Franqueado", "Tecnico", "Motoboy"],
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: <FiUsers size={20} />,
      roles: ["Franqueado", "Tecnico"],
    },
    {
      label: "Equipe",
      href: "/equipe",
      icon: <FiUserCheck size={20} />,
      roles: ["Franqueado"],
    },
    {
      label: "Minhas O.S.",
      href: "/ordens",
      icon: <FiClipboard size={20} />,
      roles: ["Tecnico"],
    },
    {
      label: "Bancada",
      href: "/ordens",
      icon: <FiSettings size={20} />,
      roles: ["Tecnico"],
    },
    {
      label: "ClickCell AI",
      href: "/ai",
      icon: <FiCpu size={20} />,
      roles: ["Tecnico"],
    },
  ]
}

export function Sidebar({ userName, userRole, userEmail, sidebarOpen, onToggle }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const open = sidebarOpen ?? isOpen
  const close = () => {
    if (onToggle) onToggle()
    else setIsOpen(false)
  }

  const menuItems = getMenuItems(userRole)
  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  )

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-full w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">{userRole}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/")
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-200 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <FiLogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
