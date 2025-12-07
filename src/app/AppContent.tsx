
'use client';
import { useState, useEffect, type ReactNode, Suspense, lazy } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav } from './header/components/BottomNav';
import { useTheme } from '@/context/ThemeContext';
import { usePosts } from '@/context/PostContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNav } from './header/components/TopNav';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { Project as ProjectType } from './discover/components/ProjectCard';

const AnimatedBackground = lazy(() => import('@/components/layout/AnimatedBackground'));

export default function AppContent({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { isCreateOpen } = usePosts();
  const isMobile = useIsMobile();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLandingPage = pathname === '/';
  const isProjectPage = /^\/discover\//.test(pathname) && pathname.split('/').length > 2;
  const isDiscoverPage = pathname.startsWith('/discover');
  
  const showHeader = !isLandingPage && !isProjectPage && !(isCreateOpen && isMobile);
  const showBottomNav = hydrated && isMobile && !isLandingPage && !pathname.startsWith('/messages') && !isProjectPage && !isCreateOpen;

  useEffect(() => {
    const bodyClass = cn(
      "font-body antialiased",
      isLandingPage ? 'landing-page-body' : '',
      showBottomNav ? 'pb-16' : ''
    );
    document.body.className = bodyClass;
  }, [isLandingPage, showBottomNav]);
  
  const handleCreateNewProject = async () => {
    if (!user || !firestore) {
      router.push('/login');
      return;
    }
    const newProjectId = uuidv4();
    const newProject: ProjectType = {
      id: newProjectId,
      title: "New Untitled Project",
      description: "A brand new project, ready for ideas.",
      image: `https://picsum.photos/seed/${newProjectId}/1080/600`,
      sector: "New",
      owner: {
        uid: user.uid,
        name: user.displayName || "You",
        avatar: user.photoURL || "",
        initials: user.displayName ? user.displayName.charAt(0) : "U",
      },
      members: [user.uid],
      totalMembers: 1,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
      lastEditDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
      tags: ["new-project"],
    };

    const batch = writeBatch(firestore);

    const projectRef = doc(firestore, 'projects', newProjectId);
    batch.set(projectRef, newProject);

    const memberRef = doc(firestore, 'projects', newProjectId, 'members', user.uid);
    batch.set(memberRef, {
        uid: user.uid,
        displayName: user.displayName || "Owner",
        role: "owner",
        joinedAt: new Date(),
    });

    await batch.commit();
    router.push(`/discover/${newProjectId}`);
  };


  return (
    <html lang="en" className={theme} style={{colorScheme: theme}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:var(--font-inter)&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="flex flex-col h-screen">
          {showHeader && <TopNav theme={theme} onSetTheme={setTheme} onCreateProject={handleCreateNewProject} />}
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
