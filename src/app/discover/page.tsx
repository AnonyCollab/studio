
'use client';
import { useState } from "react";
import { Project, ProjectCard } from "./components/ProjectCard";
import { Plus, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SideNavigation } from "./components/SideNavigation";
import { FeaturedProjectCard } from "./components/FeaturedProjectCard";
import { StatsBar } from "./components/StatsBar";
import { StarredProjectsList } from "./components/StarredProjectsList";
import { ProjectGrid } from "./components/ProjectGrid";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { useTheme } from "@/context/ThemeContext";

const mockProjects: Record<string, Project[]> = {
  my: [
    {
      id: "1",
      title: "AnonyCollab Platform",
      description:
        "A revolutionary anonymous collaboration platform enabling teams to work together without revealing identities. Features real-time messaging, project management, and secure file sharing.",
      image:
        "https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MjYyNTEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Technology",
      owner: {
        name: "Sarah Anderson",
        avatar: "",
        initials: "SA",
      },
      totalMembers: 12,
      createdDate: "Oct 15, 2024",
      lastEditDate: "Nov 8, 2025",
      tags: ["SaaS", "Collaboration", "React", "Node.js"],
    },
    {
      id: "2",
      title: "HealthTrack Dashboard",
      description:
        "Comprehensive healthcare monitoring system for patient data management, appointment scheduling, and medical record digitization with HIPAA compliance.",
      image:
        "https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbHxlbnwxfHx8fDE3NjI2MjA5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Healthcare",
      owner: {
        name: "Sarah Anderson",
        avatar: "",
        initials: "SA",
      },
      totalMembers: 8,
      createdDate: "Sep 22, 2024",
      lastEditDate: "Nov 7, 2025",
      tags: ["Healthcare", "Dashboard", "Analytics"],
    },
    {
      id: "3",
      title: "EduLearn Platform",
      description:
        "Interactive e-learning platform with video courses, quizzes, progress tracking, and AI-powered personalized learning paths for students of all ages.",
      image:
        "https://images.unsplash.com/photo-1759678444893-9c1762e022fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBsZWFybmluZ3xlbnwxfHx8fDE3NjI1ODk5ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Education",
      owner: {
        name: "Sarah Anderson",
        avatar: "",
        initials: "SA",
      },
      totalMembers: 15,
      createdDate: "Aug 10, 2024",
      lastEditDate: "Nov 6, 2025",
      tags: ["EdTech", "AI", "Video", "Learning"],
    },
  ],
  team: [
    {
      id: "4",
      title: "Marketing Campaign Hub",
      description:
        "Centralized marketing campaign management tool with social media scheduling, analytics, content calendar, and team collaboration features.",
      image:
        "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbnxlbnwxfHx8fDE3NjI2Mjc5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Marketing",
      owner: {
        name: "Michael Chen",
        avatar: "",
        initials: "MC",
      },
      totalMembers: 10,
      createdDate: "Jul 5, 2024",
      lastEditDate: "Nov 8, 2025",
      tags: ["Marketing", "Social Media", "Analytics"],
    },
    {
      id: "5",
      title: "FinanceFlow Analytics",
      description:
        "Advanced financial analytics platform with real-time market data, portfolio tracking, risk assessment, and automated reporting capabilities.",
      image:
        "https://images.unsplash.com/photo-1738996747326-65b5d7d7fe9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc2MjYzODAyNnww&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Finance",
      owner: {
        name: "Jessica Taylor",
        avatar: "",
        initials: "JT",
      },
      totalMembers: 6,
      createdDate: "Jun 18, 2024",
      lastEditDate: "Nov 7, 2025",
      tags: ["Finance", "Data", "Reports"],
    },
  ],
  public: [
    {
      id: "6",
      title: "OpenSource DevTools",
      description:
        "Community-driven development tools suite including code editors, debuggers, and performance analyzers. Free and open-source for all developers.",
      image:
        "https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MjYyNTEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Open Source",
      owner: {
        name: "David Park",
        avatar: "",
        initials: "DP",
      },
      totalMembers: 142,
      createdDate: "Jan 12, 2024",
      lastEditDate: "Nov 8, 2025",
      tags: ["OpenSource", "DevTools", "Community"],
    },
    {
      id: "7",
      title: "Creative Commons Library",
      description:
        "Vast collection of royalty-free design assets, templates, and resources for creative professionals. Includes fonts, icons, illustrations, and mockups.",
      image:
        "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbnxlbnwxfHx8fDE3NjI2Mjc5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Design",
      owner: {
        name: "Emma Wilson",
        avatar: "",
        initials: "EW",
      },
      totalMembers: 89,
      createdDate: "Feb 28, 2024",
      lastEditDate: "Nov 5, 2025",
      tags: ["Design", "Assets", "Creative"],
    },
    {
      id: "8",
      title: "Climate Action Network",
      description:
        "Global initiative connecting environmental activists, researchers, and organizations to collaborate on climate solutions and sustainability projects.",
      image:
        "https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYyNjE4Mzc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Environment",
      owner: {
        name: "Alex Rivera",
        avatar: "",
        initials: "AR",
      },
      totalMembers: 234,
      createdDate: "Mar 15, 2024",
      lastEditDate: "Nov 8, 2025",
      tags: ["Environment", "Climate", "Sustainability", "NGO"],
    },
  ],
  invite: [
    {
      id: "9",
      title: "Executive Strategy Board",
      description:
        "Private strategic planning platform for C-level executives. Includes confidential document sharing, voting systems, and secure communication channels.",
      image:
        "https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYyNjE4Mzc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Business",
      owner: {
        name: "Robert Greene",
        avatar: "",
        initials: "RG",
      },
      totalMembers: 5,
      createdDate: "May 8, 2024",
      lastEditDate: "Nov 7, 2025",
      tags: ["Strategy", "Executive", "Private"],
    },
    {
      id: "10",
      title: "Research Consortium",
      description:
        "Exclusive academic research collaboration space for peer-reviewed studies, data sharing, and grant applications in molecular biology.",
      image:
        "https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbHxlbnwxfHx8fDE3NjI2MjA5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      sector: "Research",
      owner: {
        name: "Dr. Lisa Thompson",
        avatar: "",
        initials: "LT",
      },
      totalMembers: 18,
      createdDate: "Apr 20, 2024",
      lastEditDate: "Nov 6, 2025",
      tags: ["Research", "Academic", "Science"],
    },
  ],
};

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

  // Get all projects and sort by last edit date for "most recent"
  const allProjects = [
    ...mockProjects.my,
    ...mockProjects.team,
    ...mockProjects.public,
    ...mockProjects.invite,
  ];

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

  // Featured grid: mix of recent and trending
  const featuredProjects = [
    recentProjects[0], // Most recent
    trendingProjects[0], // Most popular
    recentProjects[1], // 2nd most recent
    trendingProjects[1], // 2nd most popular
    recentProjects[2], // 3rd most recent
    trendingProjects[2], // 3rd most popular
  ];

  const getProjectsForSection = (section: string): Project[] => {
    if (mockProjects[section]) {
      return mockProjects[section];
    }
    switch (section) {
      case "trending":
        return trendingProjects;
      case "starred":
        return starredProjects;
      case "recent":
        return recentProjects;
      default:
        return [];
    }
  };

  const projectsToDisplay = getProjectsForSection(activeSection);

  const renderContent = () => {
    if (activeSection === "overview") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
          {/* Large Hero Card - spans 2x2 */}
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

          {/* Small Card */}
          <FeaturedProjectCard
            title={featuredProjects[1].title}
            description={featuredProjects[1].description}
            image={featuredProjects[1].image}
            sector={featuredProjects[1].sector}
            owner={featuredProjects[1].owner}
            totalMembers={featuredProjects[1].totalMembers}
            tags={featuredProjects[1].tags}
            theme={theme}
            size="small"
          />

          {/* Small Card */}
          <FeaturedProjectCard
            title={featuredProjects[2].title}
            description={featuredProjects[2].description}
            image={featuredProjects[2].image}
            sector={featuredProjects[2].sector}
            owner={featuredProjects[2].owner}
            totalMembers={featuredProjects[2].totalMembers}
            tags={featuredProjects[2].tags}
            theme={theme}
            size="small"
          />

          {/* Small Card */}
          <FeaturedProjectCard
            title={featuredProjects[3].title}
            description={featuredProjects[3].description}
            image={featuredProjects[3].image}
            sector={featuredProjects[3].sector}
            owner={featuredProjects[3].owner}
            totalMembers={featuredProjects[3].totalMembers}
            tags={featuredProjects[3].tags}
            theme={theme}
            size="small"
          />

          {/* Small Card */}
          <FeaturedProjectCard
            title={featuredProjects[4].title}
            description={featuredProjects[4].description}
            image={featuredProjects[4].image}
            sector={featuredProjects[4].sector}
            owner={featuredProjects[4].owner}
            totalMembers={featuredProjects[4].totalMembers}
            tags={featuredProjects[4].tags}
            theme={theme}
            size="small"
          />

          {/* Small Card */}
          <FeaturedProjectCard
            title={featuredProjects[5].title}
            description={featuredProjects[5].description}
            image={featuredProjects[5].image}
            sector={featuredProjects[5].sector}
            owner={featuredProjects[5].owner}
            totalMembers={featuredProjects[5].totalMembers}
            tags={featuredProjects[5].tags}
            theme={theme}
            size="small"
          />
        </div>
      );
    }
    return <ProjectGrid projects={projectsToDisplay} theme={theme} />;
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
             <div className="lg:col-span-3">
                  <div className="sticky top-24 hidden lg:block h-[calc(100vh-7rem)]">
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
