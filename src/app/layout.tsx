
'use client';
import { useState, useEffect, type ReactNode, Suspense, lazy } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import './landing/index.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { TopNav } from './header/components/TopNav';
import { BottomNav } from './header/components/BottomNav';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { PostProvider, usePosts } from '@/context/PostContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { v4 as uuidv4 } from 'uuid';

const AnimatedBackground = lazy(() => import('@/components/layout/AnimatedBackground'));

function AppContent({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { handleOpenCreatePost } = usePosts();
  const pathname = usePathname();
  const router = useRouter();
  
  const [bodyClassName, setBodyClassName] = useState('font-body antialiased');
  const isLandingPage = pathname === '/';
  const isDiscoverPage = pathname.startsWith('/discover');
  const isProjectDetailPage = isDiscoverPage && pathname.split('/').length > 2;

  const isMobile = useIsMobile();

  const showBottomNav = isMobile && !isLandingPage && !pathname.startsWith('/messages');

  const handleCreateNewProject = () => {
    const newProjectId = uuidv4();
    router.push(`/discover/${newProjectId}`);
  };

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
        <div className="relative isolate min-h-screen">
          {!isLandingPage && (
            <Suspense fallback={null}>
              <AnimatedBackground theme={theme} />
            </Suspense>
          )}
          {!isProjectDetailPage && !isLandingPage && (
            <TopNav 
              theme={theme} 
              onToggleTheme={toggleTheme} 
              onCreateProject={isDiscoverPage ? handleCreateNewProject : undefined}
            />
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
