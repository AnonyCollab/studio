
'use client';
import { useState, useEffect, useMemo } from "react";
import { Project as ProjectType } from "./components/ProjectCard";
import { Plus, Search, Menu, Edit, UserPlus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SideNavigation } from "./components/SideNavigation";
import { FeaturedProjectCard } from "./components/FeaturedProjectCard";
import { StatsBar } from "./components/StatsBar";
import { StarredProjectsList } from "./components/StarredProjectsList";
import { ProjectGrid } from "./components/ProjectGrid";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, setDoc, updateDoc, arrayUnion, increment, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";


const sectionTitles: Record<string, string> = {
  overview: "Discover Projects",
  my: "My Projects",
  team: "Team Projects",
  public: "Public Projects",
  invite: "Invite-Only Projects",
  trending: "Trending Projects",
  starred: "Starred Projects",
  recent: "Recent Projects",
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = theme === "dark";
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'projects');
  }, [firestore]);

  const { data: allProjectsData } = useCollection<ProjectType>(projectsQuery);
  const allProjects = allProjectsData || [];

  const myProjects = useMemo(() => allProjects.filter(p => p.owner?.uid === (user?.uid)), [allProjects, user]);

  // Sort by last edit date (most recent first)
  const recentProjects = [...allProjects].sort((a, b) => {
    const dateA = new Date(a.lastEditDate).getTime();
    const dateB = new Date(b.lastEditDate).getTime();
    return dateB - dateA;
  });

  // Select trending projects (highest member count)
  const trendingProjects = [...allProjects].sort((a, b) => b.totalMembers - a.totalMembers);
  
  const starredProjectIds = ["1", "3", "6"];
  const starredProjects = allProjects.filter((p) => starredProjectIds.includes(p.id));

  const featuredProjects = useMemo(() => {
    const combined = [
        ...recentProjects.slice(0, 3),
        ...trendingProjects.slice(0, 3),
    ];
    const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
    return unique.slice(0, 4); // Ensure we have at least 4 if possible, but no more
  }, [recentProjects, trendingProjects]);


  const getProjectsForSection = (section: string): ProjectType[] => {
    switch (section) {
      case "my":
        return myProjects;
      case "trending":
        return trendingProjects;
      case "starred":
        return starredProjects;
      case "recent":
        return recentProjects;
      case "public":
        // For now, let's assume all are public
        return allProjects;
      default:
        return [];
    }
  };

  const projectsToDisplay = getProjectsForSection(activeSection);
  
  const handleJoinProject = async (projectId: string) => {
    if (!user || !firestore) {
      router.push('/login');
      return;
    }
    
    const batch = writeBatch(firestore);

    // 1. Update the main project document
    const projectRef = doc(firestore, 'projects', projectId);
    batch.update(projectRef, {
        members: arrayUnion(user.uid),
        totalMembers: increment(1)
    });

    // 2. Add the user to the `members` subcollection
    const memberRef = doc(firestore, 'projects', projectId, 'members', user.uid);
    batch.set(memberRef, {
      uid: user.uid,
      displayName: user.displayName,
      role: 'member',
      joinedAt: new Date()
    });

    await batch.commit();
  };

  const renderContent = () => {
    if (activeSection === "overview") {
      if (featuredProjects.length === 0) return null;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
          {/* Large Hero Card - spans 2x2 */}
          <Link href={`/discover/${featuredProjects[0].id}`}>
            <FeaturedProjectCard
              title={featuredProjects[0].title}
              description={featuredProjects[0].description}
              image={featuredProjects[0].image}
              sector={featuredProjects[0].sector}
              owner={featuredProjects[0].owner}
              totalMembers={featuredProjects[0].totalMembers}
              tags={featuredProjects[0].tags}
              theme={theme}
              size="large"
            />
          </Link>
          {featuredProjects.slice(1).map((project) => (
             <Link key={project.id} href={`/discover/${project.id}`}>
                <FeaturedProjectCard
                    title={project.title}
                    description={project.description}
                    image={project.image}
                    sector={project.sector}
                    owner={project.owner}
                    totalMembers={project.totalMembers}
                    tags={project.tags}
                    theme={theme}
                    size="small"
                />
            </Link>
          ))}
        </div>
      );
    }
    return <ProjectGrid projects={projectsToDisplay} theme={theme} onJoinProject={handleJoinProject} user={user} />;
  };

  return (
    <div
      className="min-h-screen"
    >
      {/* Mobile Navigation Drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className={`absolute inset-y-0 left-0 w-64 ${
              isDark ? "bg-[#0a0e1a]" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <SideNavigation
                theme={theme}
                activeSection={activeSection}
                onSectionChange={(section) => {
                  setActiveSection(section);
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
             {/* Side Navigation - Takes 3 columns on large screens */}
             <div className="hidden lg:block lg:col-span-3">
                  <div 
                    className="sticky top-24"
                    style={{ height: 'calc(100vh - 7rem)' }}
                  >
                    <div className="flex flex-col h-full">
                        <SideNavigation
                          theme={theme}
                          activeSection={activeSection}
                          onSectionChange={setActiveSection}
                        />
                        <StarredProjectsList theme={theme} />
                    </div>
                  </div>
                </div>

            {/* Main content area */}
            <div className="lg:col-span-9">
                 {/* Hero Section */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1
                    className={`mb-2 text-2xl font-bold tracking-tight ${
                      isDark ? "text-[#e5e7eb]" : "text-gray-900"
                    }`}
                  >
                    {sectionTitles[activeSection] || 'Discover Projects'}
                  </h1>
                  <p
                    className={`${
                      isDark ? "text-[#94a3b8]" : "text-gray-600"
                    }`}
                  >
                    Explore featured projects and collaborate with teams worldwide
                  </p>
                </div>
              </div>

              {activeSection === 'overview' && <StatsBar theme={theme} /> }

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-2xl">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <Input
                    type="text"
                    placeholder="Search projects by name, sector, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-12 h-12 ${
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10"
                        : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200"
                    }`}
                  />
                </div>
              </div>
              
              {renderContent()}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
