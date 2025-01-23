'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const MenuBar = () => {
  const { data: session } = useSession();

  const pathname = usePathname();
  const isUserPage = pathname && pathname !== '/' && !pathname.includes('#');

  return (
    <nav className="w-full border-b border-[var(--foreground)] bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo/Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[var(--foreground)]">Bento</span>
            </Link>
            
            <div className="hidden md:block ml-10">
              {isUserPage ? (
                <>
                  <Link href="/" className="text-[var(--foreground)] opacity-80 hover:opacity-100 px-3 py-2">
                    Homepage
                  </Link>
                  <Link href="/support" className="text-[var(--foreground)] opacity-80 hover:opacity-100 px-3 py-2">
                    Support
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/#demo" className="text-[var(--foreground)] opacity-80 hover:opacity-100 px-3 py-2">
                    Demo
                  </Link>
                  <Link href="/#features" className="text-[var(--foreground)] opacity-80 hover:opacity-100 px-3 py-2">
                    Features
                  </Link>
                  <Link href="/#specs" className="text-[var(--foreground)] opacity-80 hover:opacity-100 px-3 py-2">
                    Specs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href={`/${session.user?.username}`}
                  className="text-[var(--foreground)] opacity-80 hover:opacity-100"
                >
                  My Page
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-md hover:opacity-90"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn()}
                  className="text-[var(--foreground)] opacity-80 hover:opacity-100"
                >
                  Login
                </button>
                <Link
                  href="/auth/register"
                  className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-md hover:opacity-90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;