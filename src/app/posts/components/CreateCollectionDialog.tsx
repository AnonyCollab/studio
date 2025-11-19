import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from "lucide-react";

interface CreateCollectionProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, isPrivate: boolean) => void;
}

export function CreateCollection({
  isOpen,
  onClose,
  onCreate,
}: CreateCollectionProps) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), isPrivate);
      setName("");
      setIsPrivate(false);
    }
  };

  const handleClose = () => {
    setName("");
    setIsPrivate(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-auto p-0 rounded-t-2xl">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <button onClick={handleClose} className="text-neutral-600">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>New Collection</div>
            <Button
              onClick={handleCreate}
              variant="ghost"
              disabled={!name.trim()}
              className="text-blue-500 disabled:text-neutral-300 disabled:cursor-not-allowed"
            >
              Create
            </Button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-6">
            <div>
              <label htmlFor="collection-name" className="block text-sm text-neutral-500 mb-2">
                Name
              </label>
              <Input
                id="collection-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collection name"
                className="border-neutral-300 focus:border-neutral-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div>Make private</div>
                <div className="text-sm text-neutral-500">
                  Only you can see this collection
                </div>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
