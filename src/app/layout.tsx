
'use client';
import { ReactNode } from 'react';
import './globals.css';
import './landing/index.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/context/ThemeContext';
import { PostProvider } from '@/context/PostContext';
import AppContent from './AppContent'; // Import the new client component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <FirebaseClientProvider>
        <PostProvider>
          {/* AppContent now lives inside all providers */}
          <AppContent>{children}</AppContent>
        </PostProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
