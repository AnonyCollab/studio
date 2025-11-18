
'use client';
import { useState, useEffect, type ReactNode, Suspense, lazy } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import './landing/index.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { TopNav } from './header/components/TopNav';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const AnimatedBackground = lazy(() => import('@/components/layout/AnimatedBackground'));

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
          <div className="relative isolate min-h-screen">
            {!isLandingPage && (
              <Suspense fallback={null}>
                <AnimatedBackground theme={theme} />
              </Suspense>
            )}
            <TopNav theme={theme} onToggleTheme={toggleTheme} />
            <main>{children}</main>
          </div>
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
