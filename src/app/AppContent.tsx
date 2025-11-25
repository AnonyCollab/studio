
'use client';
import { useState, useEffect, type ReactNode, Suspense, lazy } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav } from './header/components/BottomNav';
import { useTheme } from '@/context/ThemeContext';
import { usePosts } from '@/context/PostContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNav } from './header/components/TopNav';

const AnimatedBackground = lazy(() => import('@/components/layout/AnimatedBackground'));

export default function AppContent({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { handleOpenCreatePost } = usePosts();
  const isMobile = useIsMobile();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLandingPage = pathname === '/';
  const isProjectPage = /^\/discover\//.test(pathname) && pathname.split('/').length > 2;
  const isDiscoverPage = pathname.startsWith('/discover');
  
  const showHeader = !isLandingPage && !isProjectPage;
  const showBottomNav = hydrated && isMobile && !isLandingPage && !pathname.startsWith('/messages') && !isProjectPage;

  useEffect(() => {
    const bodyClass = cn(
      "font-body antialiased",
      isLandingPage ? 'landing-page-body' : '',
      showBottomNav ? 'pb-16' : ''
    );
    document.body.className = bodyClass;
  }, [isLandingPage, showBottomNav]);


  return (
    <html lang="en" className={theme} style={{colorScheme: theme}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:var(--font-inter)&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="flex flex-col h-screen">
          {showHeader && <TopNav theme={theme} onSetTheme={setTheme} onCreateProject={isDiscoverPage ? handleCreateProject : undefined} />}
          <div className="relative isolate flex-1 min-h-0">
            {!isLandingPage && (
              <Suspense fallback={null}>
                <AnimatedBackground theme={theme} />
              </Suspense>
            )}
            
            <main className="h-full">{children}</main>
            {showBottomNav && <BottomNav theme={theme} />}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

function handleCreateProject() {
    window.dispatchEvent(new CustomEvent('create-new-project'));
}
