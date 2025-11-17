
import { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerDescription, DrawerHeader } from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Lock } from "lucide-react";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateCollection } from "./CreateCollectionDialog";

interface Collection {
  id: string;
  name: string;
  isPrivate: boolean;
  thumbnailUrl: string;
  itemCount: number;
  isSaved: boolean;
}

const mockCollections: Collection[] = [
    {
      id: "1",
      name: "All Posts",
      isPrivate: false,
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      itemCount: 142,
      isSaved: false,
    },
    {
      id: "2",
      name: "Design Inspo",
      isPrivate: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
      itemCount: 38,
      isSaved: true,
    },
    {
      id: "3",
      name: "Travel",
      isPrivate: false,
      thumbnailUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      itemCount: 67,
      isSaved: false,
    },
    {
      id: "4",
      name: "Food & Recipes",
      isPrivate: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      itemCount: 24,
      isSaved: false,
    },
    {
      id: "5",
      name: "Architecture",
      isPrivate: false,
      thumbnailUrl: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
      itemCount: 15,
      isSaved: false,
    },
  ];


interface SaveToCollectionDialogProps {
  children: ReactNode;
  postTitle: string;
  onSaveToggle: (isSaved: boolean) => void;
  theme?: "light" | "dark";
}

export function SaveToCollectionDialog({
  children,
  postTitle,
  onSaveToggle,
  theme = "dark"
}: SaveToCollectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const isMobile = useIsMobile();
  const isDark = theme === "dark";

  const toggleCollection = (id: string) => {
    const updatedCollections = collections.map((col) =>
      col.id === id ? { ...col, isSaved: !col.isSaved } : col
    );
    setCollections(updatedCollections);
    
    // This is a simple check to see if it's saved in ANY collection
    const isSavedInAnyCollection = updatedCollections.some(c => c.isSaved);
    onSaveToggle(isSavedInAnyCollection);
  };
  
  const handleCreateCollection = (name: string, isPrivate: boolean) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      isPrivate,
      thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
      itemCount: 1,
      isSaved: true,
    };
    setCollections((prev) => [newCollection, ...prev]);
    onSaveToggle(true);
    setIsCreating(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsCreating(false);
    }
    setIsOpen(open);
  }

  const CollectionsContent = () => (
    <div className={`flex flex-col h-auto max-h-[500px] w-full sm:w-[350px] ${isDark ? 'bg-[#1a1f2e] text-white' : 'bg-white text-gray-900'}`}>
        <DrawerHeader className={`p-4 border-b text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <DrawerTitle>Save to collection</DrawerTitle>
            <DrawerDescription className="sr-only">Select a collection to save the post to, or create a new one.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Create New Collection */}
          <button
            onClick={() => setIsCreating(true)}
            className={`w-full flex items-center gap-3 p-4 transition-colors border-b ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              <Plus className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1 text-left">New Collection</div>
          </button>

          {/* Existing Collections */}
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center gap-3 p-4"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={collection.thumbnailUrl}
                  alt={collection.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span>{collection.name}</span>
                  {collection.isPrivate && (
                    <Lock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
                </div>
              </div>
              <Checkbox
                checked={collection.isSaved}
                onCheckedChange={() => toggleCollection(collection.id)}
                className="w-6 h-6"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Done
          </Button>
        </div>
      </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
          {children}
        </DrawerTrigger>
        <DrawerContent className="p-0 rounded-t-2xl border-none">
          {isCreating ? (
            <CreateCollection
              isOpen={isCreating}
              onClose={() => setIsCreating(false)}
              onCreate={handleCreateCollection}
            />
          ) : (
            <CollectionsContent />
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="p-0 gap-0 border-none w-auto"
        onClick={(e) => e.stopPropagation()}
      >
         {isCreating ? (
            <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
              <DialogContent className="sm:max-w-[425px] p-0 gap-0 border-none">
                <CreateCollection
                  isOpen={isCreating}
                  onClose={() => setIsCreating(false)}
                  onCreate={handleCreateCollection}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <CollectionsContent />
          )}
      </PopoverContent>
    </Popover>
  );
}
