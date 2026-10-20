import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Game Arena - Play, Compete, Conquer!',
  description:
    'Play 10 exciting browser games, compete on leaderboards, and track your progress.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans bg-gray-50 dark:bg-arena-dark text-gray-900 dark:text-gray-100 min-h-screen"
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
