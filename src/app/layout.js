'use client';

import './globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase'; // Adjust path if your firebase.js moves
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
    return unsubscribe;
  }, []);

  // Apply theme on mount based on localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      enableDarkMode();
    } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }, []);

  const enableDarkMode = () => {
    document.documentElement.classList.add('dark');
    setIsDarkMode(true);
    localStorage.setItem('theme', 'dark');
  };

  const disableDarkMode = () => {
    document.documentElement.classList.remove('dark');
    setIsDarkMode(false);
    localStorage.setItem('theme', 'light');
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-var-bg-color dark:bg-gray-900 text-var-text-color dark:text-gray-100 transition-colors duration-300">
        <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
          <Link
            href="/"
            className="text-2xl font-semibold text-[var(--primary-color)] dark:text-[var(--primary-dark)] tracking-tight select-none"
            aria-label="Homepage"
          >
            NoteAlly
          </Link>
          <nav className="space-x-4 flex items-center">
            <Link
              href="/notes"
              className="text-[var(--primary-color)] dark:text-[var(--primary-dark)] font-medium hover:underline focus:underline transition"
            >
              Browse Notes
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[var(--primary-color)] dark:text-[var(--primary-dark)] font-medium hover:underline focus:underline transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className="ml-4 bg-[var(--primary-color)] dark:bg-[var(--primary-dark)] text-white py-2 px-4 rounded-full font-medium shadow hover:opacity-90 focus:ring-2 focus:ring-[var(--primary-color)] transition"
                >
                  Upload Note
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-2 px-4 rounded-full font-medium shadow focus:ring-2 focus:ring-red-500 transition"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-4 text-[var(--primary-color)] dark:text-[var(--primary-dark)] font-medium hover:underline focus:underline transition"
              >
                Login
              </Link>
            )}

            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="ml-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m8.66-7h-1M4.34 12h-1m15.36 4.36l-.71-.71M6.34 6.34l-.71-.71m12.02.71l-.71-.71M6.34 17.66l-.71-.71"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  stroke="none"
                >
                  <path d="M12 3a9 9 0 1 0 9 9 7.5 7.5 0 0 1-9-9z" />
                </svg>
              )}
            </button>
          </nav>
        </header>

        <main className="transition-colors duration-300 min-h-[calc(100vh-96px)]">{children}</main>

        <footer className="py-6 text-center text-sm text-gray-400 select-none">
          Made for students, inspired by PrintNOptions
        </footer>
      </body>
    </html>
  );
}
