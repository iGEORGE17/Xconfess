"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../lib/hooks/useAuth";
import { ThemeToggle } from "../common/ThemeToggle";
import Sidebar from "./Sidebar";

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-slate-800 bg-background sticky top-0 z-30 transition-colors">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              xConfess
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 font-medium transition-colors">
                Feed
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 font-medium transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/messages"
                className="text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 font-medium transition-colors"
              >
                Messages
              </Link>

              <div className="h-6 w-px bg-zinc-200 dark:bg-slate-800" />
              
              <ThemeToggle />

              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-secondary">
                    @{user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                className="p-2 -mr-2 text-gray-700 dark:text-slate-300 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
