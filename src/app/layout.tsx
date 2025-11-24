
'use client';
import { useState, useEffect, type ReactNode, Suspense, lazy } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import './landing/index.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BottomNav } from './header/components/BottomNav';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { PostProvider, usePosts } from '@/context/PostContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNav } from './header/components/TopNav';


const AnimatedBackground = lazy(() => import('@/components/layout/AnimatedBackground'));

function AppContent({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { handleOpenCreatePost } = usePosts();

  const [bodyClassName, setBodyClassName] = useState('font-body antialiased');
  const isLandingPage = pathname === '/';
  const isProjectPage = /^\/discover\//.test(pathname) && pathname.split('/').length > 2;
  
  const showHeader = !isLandingPage && !isProjectPage;
  
  const isMobile = useIsMobile();
  const isDiscoverPage = pathname.startsWith('/discover');
  
  const handleCreateProject = () => {
    // This is a placeholder. The actual creation logic lives in discover/page.tsx
    // but the button click needs to be handled here.
    // In a more robust setup, this would use a global state management solution.
    // For now, we can use a custom event or a simple window object property.
    window.dispatchEvent(new CustomEvent('create-new-project'));
  };

  const showBottomNav = isMobile && !isLandingPage && !pathname.startsWith('/messages');


  useEffect(() => {
    setBodyClassName(cn(
      "font-body antialiased",
      isLandingPage ? 'landing-page-body' : '',
      showBottomNav ? 'pb-16' : '' // Add padding for bottom nav on mobile
    ));
  }, [pathname, isLandingPage, showBottomNav]);


  return (
    <html lang="en" className={theme} style={{colorScheme: theme}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:var(--font-inter)&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className={bodyClassName}>
        {showHeader && <TopNav theme={theme} onToggleTheme={toggleTheme} onCreateProject={isDiscoverPage ? handleCreateProject : undefined} />}
        <div className="relative isolate min-h-screen">
          {!isLandingPage && (
            <Suspense fallback={null}>
              <AnimatedBackground theme={theme} />
            </Suspense>
          )}
          
          <main>{children}</main>
          {showBottomNav && <BottomNav theme={theme} />}
        </div>
        <Toaster />
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
      <FirebaseClientProvider>
        <PostProvider>
          <AppContent>{children}</AppContent>
        </PostProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
