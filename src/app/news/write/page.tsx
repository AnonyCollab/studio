
'use client';

import { ArrowLeft, MoreHorizontal, Image as ImageIcon, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

export default function WritePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="fixed top-0 left-0 right-0 z-10 bg-transparent py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/news" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost">Save draft</Button>
            <Button>Publish</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Add image</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>More settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-24 pb-16 px-6">
        <Textarea
            placeholder="Write your story..."
            className="w-full h-96 p-4 text-lg border-0 focus-visible:ring-0 bg-transparent"
          />
      </main>
    </div>
  );
}
