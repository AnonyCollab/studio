
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Theme } from '../types';
import { Link, File } from 'lucide-react';

interface AddFromUrlDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, url: string) => void;
  theme: Theme;
}

export const AddFromUrlDialog: React.FC<AddFromUrlDialogProps> = ({ isOpen, onOpenChange, onSave, theme }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

  const handleSave = () => {
    if (name.trim() && url.trim()) {
      onSave(name.trim(), url.trim());
    }
  };

  const dialogBg = isLight ? 'bg-white' : 'bg-[#18181b]';
  const textMain = isLight ? 'text-slate-900' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputClass = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';
  const footerBg = isLight ? 'bg-slate-50' : 'bg-black/20';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg p-0 gap-0 border overflow-hidden ${dialogBg} ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
        <DialogHeader className="p-6">
          <DialogTitle className={textMain}>Add Resource from URL</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-4">
            <div>
                <label className={`text-xs font-bold uppercase block mb-2 ${textMuted}`}>File Name</label>
                <div className="relative">
                    <File className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Project Brief.pdf"
                        className={`pl-10 ${inputClass}`}
                    />
                </div>
            </div>
             <div>
                <label className={`text-xs font-bold uppercase block mb-2 ${textMuted}`}>URL</label>
                <div className="relative">
                    <Link className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                    <Input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        className={`pl-10 ${inputClass}`}
                    />
                </div>
            </div>
        </div>

        <DialogFooter className={`p-4 border-t ${isLight ? 'border-gray-100' : 'border-white/5'} ${footerBg}`}>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !url.trim()}>Add Resource</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
