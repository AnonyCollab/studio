
'use client';
import { useState, useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { PostCard } from "./components/PostCard";
import { PostDetail } from "./components/PostDetail";
import { CreatePost } from "./components/CreatePost";
import { FilterPanel } from "./components/FilterPanel";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  timestamp: string;
  problemDetails: string;
  problemSummary: string;
  whatIveTried: string;
  whatIveTriedSummary: string;
  expectedOutcome: string;
  expectedOutcomeSummary: string;
  sector: string;
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Alex Thompson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    },
    imageUrl: "https://images.unsplash.com/photo-1617634667039-8e4cb277ab46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYxMTcyNDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Peaceful Morning in the Valley",
    description: "Captured this serene moment during sunrise in the mountains.",
    tags: ["Nature", "Photography", "Landscape"],
    likes: 234,
    comments: 18,
    reposts: 34,
    shares: 15,
    timestamp: "3 hours ago",
    problemDetails:
      "This photo was taken during a solo hiking trip in the mountains. I woke up at 5 AM to catch the sunrise, and it was absolutely worth it. The valley was covered in a gentle mist, and the first rays of sunlight created this magical atmosphere. Nature has a way of putting everything into perspective.",
    problemSummary: "Woke up at 5 AM for a hike and was rewarded with a misty sunrise that was truly magical.",
    whatIveTried: "I tried using different lenses and exploring various angles to capture the perfect shot. A wide-angle lens helped to get the full scope of the valley.",
    whatIveTriedSummary: "Experimented with various lenses and angles to find the best composition for the scene.",
    expectedOutcome: "I wanted to capture a single, breathtaking shot that conveys the serene and majestic atmosphere of the mountain sunrise.",
    expectedOutcomeSummary: "Hoped to get a breathtaking photo that captures the serene beauty of the sunrise.",
    sector: "arts"
  },
  {
    id: "2",
    author: {
      name: "Jessica Wu",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
    },
    imageUrl: "https://images.unsplash.com/photo-1617381519460-d87050ddeb92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MTE2MDU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Modern Architecture",
    description: "The intersection of design and functionality in urban spaces.",
    tags: ["Architecture", "City", "Design"],
    likes: 189,
    comments: 24,
    reposts: 12,
    shares: 8,
    timestamp: "5 hours ago",
    problemDetails:
      "Urban architecture continues to fascinate me. This building represents the perfect blend of modern design principles and functional space. The clean lines and geometric patterns create a visual rhythm that's both calming and inspiring.",
    problemSummary: "This building blends modern design and function, with clean lines creating a calming visual rhythm.",
    whatIveTried: "Studied the blueprint and the history of the design movement that inspired the architect.",
    whatIveTriedSummary: "Reviewed blueprints and researched the architectural style to understand the design.",
    expectedOutcome: "A deeper understanding of the architect's vision and how it translates into the final structure.",
    expectedOutcomeSummary: "Wanted to fully grasp the architect's vision for the building's form and function.",
    sector: "construction"
  },
  {
    id: "3",
    author: {
      name: "Marcus Rivera",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    },
    imageUrl: "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydHxlbnwxfHx8fDE3NjEyMDQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Abstract Expressions",
    description: "Exploring colors and forms in digital art.",
    tags: ["Art", "Abstract", "Digital"],
    likes: 312,
    comments: 42,
    reposts: 55,
    shares: 29,
    timestamp: "8 hours ago",
    problemDetails:
      "This piece is part of my ongoing exploration of abstract forms and vibrant colors. I wanted to create something that evokes emotion without relying on recognizable shapes. The interplay of light and shadow, warm and cool tones, creates a dynamic visual experience.",
     problemSummary: "Creating a piece that evokes emotion through abstract forms and vibrant colors.",
     whatIveTried: "Experimented with different color palettes and digital brushes to achieve the desired texture and mood.",
     whatIveTriedSummary: "Used different color palettes and brushes to get the right texture and mood.",
     expectedOutcome: "An emotionally resonant piece that connects with the viewer on a visceral level.",
     expectedOutcomeSummary: "Aimed for a visually dynamic piece that connects with viewers emotionally.",
     sector: "arts"
  },
  {
    id: "4",
    author: {
      name: "Sophie Laurent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie",
    },
    imageUrl: "https://images.unsplash.com/photo-1532980400857-e8d9d275d858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzYxMTI5MzM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Culinary Artistry",
    description: "Where food meets art in the most delicious way.",
    tags: ["Food", "Photography", "Culinary"],
    likes: 445,
    comments: 67,
    reposts: 89,
    shares: 41,
    timestamp: "12 hours ago",
    problemDetails:
      "Food photography has become my passion. This dish was crafted by a talented chef friend, and I had the pleasure of capturing its beauty before it was enjoyed. The presentation, colors, and textures all come together to create not just a meal, but a work of art.",
     problemSummary: "Trying to capture the artful presentation of a dish made by a talented chef.",
     whatIveTried: "Adjusting lighting and composition to highlight the textures and colors of the food.",
     whatIveTriedSummary: "Played with lighting and composition to make the food look its best.",
     expectedOutcome: "A mouth-watering photo that does justice to the chef's creation.",
     expectedOutcomeSummary: "Wanted a photo that makes the dish look as delicious as it tastes.",
     sector: "food"
  },
  {
    id: "5",
    author: {
      name: "Ryan Park",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ryan",
    },
    imageUrl: "https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTE3NTc2MHww&ixlibrb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Workspace Inspiration",
    description: "Creating the perfect environment for productivity and creativity.",
    tags: ["Workspace", "Tech", "Productivity"],
    likes: 178,
    comments: 31,
    reposts: 20,
    shares: 11,
    timestamp: "1 day ago",
    problemDetails:
      "After months of tweaking and adjusting, I've finally created my ideal workspace. Good lighting, minimal distractions, and all the tools I need within reach. A well-designed workspace can make all the difference in productivity and creative output.",
     problemSummary: "Designing a workspace that is both productive and creatively inspiring.",
     whatIveTried: "Many different desk setups, lighting arrangements, and organizational systems.",
     whatIveTriedSummary: "Tested various desk setups, lighting, and organization methods.",
     expectedOutcome: "The ultimate productivity zone that minimizes distractions and maximizes focus.",
     expectedOutcomeSummary: "To create a workspace that boosts productivity and creativity.",
     sector: "tech"
  },
  {
    id: "6",
    author: {
      name: "Olivia Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia",
    },
    imageUrl: "https://images.unsplash.com/photo-1514747975201-4715db583da9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHxvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc2MTIwNjQ5MHww&ixlibrb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Ocean Waves",
    description: "The rhythmic beauty of the sea captured in motion.",
    tags: ["Ocean", "Nature", "Waves"],
    likes: 521,
    comments: 89,
    reposts: 120,
    shares: 63,
    timestamp: "1 day ago",
    problemDetails:
      "There's something meditative about watching ocean waves. This was captured during a beach walk at sunset. The way the light catches the water, the constant movement, a- it all creates a sense of peace and connection to nature.",
     problemSummary: "Capturing the meditative and peaceful quality of ocean waves at sunset.",
     whatIveTried: "Long exposure shots to smooth the water and fast shutter speeds to freeze the motion.",
     whatIveTriedSummary: "Used both long exposure and fast shutter speeds to capture the waves.",
     expectedOutcome: "A photo that captures the sea's tranquility and the beauty of the sunset light on the water.",
     expectedOutcomeSummary: "A photo that conveys the peaceful motion of ocean waves at sunset.",
     sector: "nature"
  },
  {
    id: "7",
    author: {
      name: "Daniel Foster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=daniel",
    },
    imageUrl: "https://images.unsplash.com/photo-1519414442781-fbd745c5b497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHxtb3VudGFpbiUyMHN1bnNldHxlbnwxfHx8fDE3NjExNjkxNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Mountain Sunset",
    description: "Golden hour in the peaks.",
    tags: ["Mountains", "Sunset", "Landscape"],
    likes: 398,
    comments: 53,
    reposts: 76,
    shares: 38,
    timestamp: "2 days ago",
    problemDetails:
      "This sunset view from the mountain peak made the challenging hike completely worthwhile. The golden light painting the sky, the silhouette of the distant peaks, and the crisp mountain air – moments like these remind us why we seek adventure.",
     problemSummary: "The challenge of a tough hike was rewarded with a stunning sunset from a mountain peak.",
     whatIveTried: "Finding the perfect vantage point away from crowds and waiting for the light to be just right.",
     whatIveTriedSummary: "Searched for a unique, uncrowded spot and waited for the perfect light.",
     expectedOutcome: "A stunning sunset photo that captures the golden hour over the mountains.",
     expectedOutcomeSummary: "A beautiful photo of the golden hour during a mountain sunset.",
     sector: "nature"
  },
  {
    id: "8",
    author: {
      name: "Emma Collins",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    },
    imageUrl: "https://images.unsplash.com/photo-1628803184377-c5167a0cb6fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHxzdHJlZXQlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjExOTgzMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Street Stories",
    description: "Capturing the essence of urban life through candid moments.",
    tags: ["Street", "Photography", "Urban"],
    likes: 267,
    comments: 35,
    reposts: 45,
    shares: 22,
    timestamp: "2 days ago",
    problemDetails:
      "Street photography allows us to capture authentic moments of everyday life. This shot represents the energy and diversity of the city – people going about their day, each with their own story, all part of the urban tapestry.",
     problemSummary: "Capturing the authentic, candid moments that define the energy of urban life.",
     whatIveTried: "Waiting for the right moment and using a discreet camera to not disturb the scene.",
     whatIveTriedSummary: "Patiently waited for a candid moment with a discreet camera setup.",
     expectedOutcome: "A photo that tells a story and captures the raw, unfiltered essence of the city.",
     expectedOutcomeSummary: "A single shot that tells a compelling story of city life.",
     sector: "photography"
  },
];

const ClientOnlyMasonry = ({ children, ...props }: any) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <ResponsiveMasonry {...props}>{children}</ResponsiveMasonry> : null;
}


export default function PostsPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const isMobile = useIsMobile();

  const handleOpenCreatePost = () => {
    setSelectedPost(null);
    setShowCreatePost(true);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
    setShowCreatePost(false);
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDetailOpen = selectedPost !== null || showCreatePost;

  useEffect(() => {
    if (isDetailOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isDetailOpen]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0a0e1a]" : "bg-gray-50"}`}>
      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-start">
          <div
            className={cn(
              'p-0 md:p-6 transition-all duration-300 ease-in-out',
              isDetailOpen ? 'w-full md:w-2/5 xl:w-1/2' : 'w-full'
            )}
          >
            {showFilter && (
              <div className="mb-6 px-4 md:px-0">
                <FilterPanel theme={theme} />
              </div>
            )}

            <ClientOnlyMasonry
              columnsCountBreakPoints={{
                350: 1,
                768: isDetailOpen ? 1 : 2,
                1280: isDetailOpen ? 2 : 3,
                1536: isDetailOpen ? 2 : 4,
              }}
              className={cn(
                "[&>div]:w-full",
                isDetailOpen && "md:h-[calc(100vh-var(--header-height)-48px)] md:overflow-y-auto custom-scrollbar"
              )}
              style={{
                 // @ts-ignore
                '--header-height': '3.5rem',
              }}
            >
              <Masonry gutter={"10px"} className="px-0 md:px-4">
                {mockPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => {
                      setShowCreatePost(false);
                      setSelectedPost(post);
                    }}
                    theme={theme}
                  />
                ))}
              </Masonry>
            </ClientOnlyMasonry>
          </div>

          {isDetailOpen && (
            <>
              {isMobile && (
                <div
                  className="fixed inset-0 bg-black/70 z-40 md:hidden"
                  onClick={handleCloseDetail}
                />
              )}
              <div
                className={cn(
                  'fixed inset-y-0 right-0 w-full sm:w-[500px] z-50 md:sticky',
                  'md:w-3/5 xl:w-1/2'
                )}
                style={{
                   // @ts-ignore
                  '--header-height': '3.5rem',
                  height: 'calc(100vh - var(--header-height))',
                  top: 'var(--header-height)',
                }}
              >
                <div className={cn(
                  `h-full shadow-2xl`, 
                  theme === 'dark' ? 'border-l border-white/10' : 'border-l',
                  isMobile ? 'rounded-t-2xl' : ''
                )}>
                  {showCreatePost ? (
                    <CreatePost onClose={handleCloseDetail} theme={theme} />
                  ) : selectedPost ? (
                    <PostDetail
                      post={selectedPost}
                      onClose={handleCloseDetail}
                      theme={theme}
                    />
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
