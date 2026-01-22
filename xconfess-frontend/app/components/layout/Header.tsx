'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-purple-600">
            xConfess
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-purple-600">
              Feed
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-purple-600">
              Profile
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-purple-600">
              Messages
            </Link>

            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  @{user.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feed
            </Link>
            <Link
              href="/profile"
              className="block py-2 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/messages"
              className="block py-2 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Messages
            </Link>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-red-600"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
