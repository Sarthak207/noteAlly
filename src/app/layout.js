'use client';

import './globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase'; // Adjust path if needed
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

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
    <html lang="en">
      <body>
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
          <Link
            href="/"
            className="text-2xl font-semibold text-[var(--primary-color)] tracking-tight select-none"
            aria-label="Homepage"
          >
            NoteAlly
          </Link>
          <nav className="space-x-4 flex items-center">
            <Link
              href="/notes"
              className="text-[var(--primary-color)] font-medium hover:text-[var(--primary-dark)] transition"
            >
              Browse Notes
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[var(--primary-color)] font-medium hover:text-[var(--primary-dark)] transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className="ml-4 bg-[var(--primary-color)] text-white py-2 px-4 rounded-full font-medium shadow hover:bg-[var(--primary-dark)] transition"
                >
                  Upload Note
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full font-medium shadow transition"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-4 text-[var(--primary-color)] font-medium hover:text-[var(--primary-dark)] transition"
              >
                Login
              </Link>
            )}
          </nav>
        </header>

        <main>{children}</main>

        <footer className="py-6 text-center text-sm text-gray-400 select-none">
          Made for students, inspired by PrintNOptions
        </footer>
      </body>
    </html>
  );
}
