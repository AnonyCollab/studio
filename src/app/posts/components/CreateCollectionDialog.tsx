
import { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CreateCollectionProps {
  onBack: () => void;
  onCreate: (name: string, isPrivate: boolean) => void;
  isMobile: boolean;
}

export function CreateCollection({
  onBack,
  onCreate,
  isMobile,
}: CreateCollectionProps) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), isPrivate);
    }
  };

  const content = (
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
  );

  if (isMobile) {
    return (
      <div className="h-auto p-0 rounded-t-2xl">
        <SheetHeader className="p-4 border-b border-neutral-200 flex flex-row items-center justify-between">
          <button onClick={onBack} className="text-neutral-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <SheetTitle className="text-base">New Collection</SheetTitle>
          <Button
            onClick={handleCreate}
            variant="ghost"
            disabled={!name.trim()}
            className="text-blue-500 disabled:text-neutral-300 disabled:cursor-not-allowed"
          >
            Create
          </Button>
        </SheetHeader>
        {content}
      </div>
    )
  }

  return (
    <>
      <DialogHeader className="p-4 border-b">
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogDescription className="sr-only">
          Enter details for your new collection.
        </DialogDescription>
      </DialogHeader>
      {content}
      <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="ghost" onClick={onBack}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>Create</Button>
      </div>
    </>
  );
}
