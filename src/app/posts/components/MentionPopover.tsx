
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfile } from "@/app/messages/components/ProfileCard";
import { useMemo, ReactNode } from "react";

interface MentionPopoverProps {
  children: ReactNode;
  query: string | null;
  onSelect: (username: string) => void;
  target: (EventTarget & HTMLTextAreaElement) | null;
  users: UserProfile[];
  theme: "light" | "dark";
}

export function MentionPopover({ children, query, onSelect, target, users, theme }: MentionPopoverProps) {
  const isDark = theme === 'dark';
  const open = query !== null && !!target;

  const filteredUsers = useMemo(() => {
    if (!query) return [];
    return users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query, users]);

  if (!open) {
    return <>{children}</>;
  }

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className={`w-80 p-0 shadow-xl border ${isDark ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-gray-200'}`}
        side="top"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent popover from stealing focus
      >
        <ScrollArea className="h-auto max-h-64">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => onSelect(user.username)}
                className={`w-full text-left p-2 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.displayName}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</p>
                </div>
              </button>
            ))
          ) : (
            <div className={`p-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No users found
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
