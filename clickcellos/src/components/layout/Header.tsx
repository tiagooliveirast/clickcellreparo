"use client"

import { FiMenu, FiX } from "react-icons/fi"

interface HeaderProps {
  title: string
  userName: string
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function Header({
  title,
  userName,
  onToggleSidebar,
  isSidebarOpen,
}: HeaderProps) {
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden cursor-pointer"
        >
          {isSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-900 lg:text-xl">
          {title}
        </h1>
      </div>
      <p className="text-sm text-gray-500 hidden sm:block">
        {greeting()}, <span className="font-medium text-gray-700">{userName}</span>
      </p>
    </header>
  )
}
