
'use client';

import { ReactNode, useState } from "react";
import { Check, Copy, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SharePopoverProps {
  children: ReactNode;
}

export function SharePopover({ children }: SharePopoverProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = () => {
    // This needs to be handled carefully in SSR environments like Next.js
    if (typeof window === 'undefined') return;

    navigator.clipboard.writeText(window.location.href);
    setHasCopied(true);
    toast({
      title: "Link Copied!",
      description: "The post URL has been copied to your clipboard.",
    });
    setTimeout(() => {
        setHasCopied(false);
        setIsOpen(false);
    }, 2000);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>{children}</PopoverTrigger>
      <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Post</h4>
            <p className="text-sm text-muted-foreground">
              Share this post with others.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="h-9"
            />
            <Button onClick={copyToClipboard} size="icon" className="h-9 w-9">
              {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-around">
            <Button variant="ghost" size="icon"><Twitter className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Linkedin className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Facebook className="h-5 w-5" /></Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
