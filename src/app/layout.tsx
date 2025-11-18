
'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import './landing/index.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { TopNav } from './header/components/TopNav';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import GlowingOrb from './landing/components/GlowingOrb';

function AppContent({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [bodyClassName, setBodyClassName] = useState('font-body antialiased');
  const isLandingPage = pathname === '/';

  useEffect(() => {
    setBodyClassName(cn(
      "font-body antialiased",
      isLandingPage ? 'landing-page-body' : ''
    ));
  }, [pathname, isLandingPage]);


  return (
    <html lang="en" className={theme} style={{colorScheme: theme}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:var(--font-inter)&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className={bodyClassName}>
        <FirebaseClientProvider>
          {!isLandingPage && theme === 'dark' && (
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <GlowingOrb size={500} color="rgba(34, 211, 238, 0.15)" className="-top-1/4 left-1/4" />
              <GlowingOrb size={400} color="rgba(56, 189, 248, 0.1)" className="top-1/3 right-1/4" />
              <GlowingOrb size={450} color="rgba(168, 85, 247, 0.1)" className="bottom-0 left-1/2 -translate-x-1/2" />
            </div>
          )}
          <TopNav theme={theme} onToggleTheme={toggleTheme} />
          <main>{children}</main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppContent>{children}</AppContent>
    </ThemeProvider>
  );
}
