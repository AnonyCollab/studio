
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Theme } from '../types';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/app/news/components/Editor'), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted/50 animate-pulse rounded-lg" />
});

interface NewFileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, content: string) => void;
  theme: Theme;
  collaborationId: string | null;
}

export const NewFileEditor: React.FC<NewFileEditorProps> = ({ isOpen, onClose, onSave, theme, collaborationId }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

  useEffect(() => {
    // Reset state when the dialog is opened
    if (isOpen) {
      setName('');
      setContent('');
    }
  }, [isOpen]);

  const editorComponent = useMemo(() => {
    if (!isOpen || !collaborationId) return null;
    return <Editor onChange={setContent} editable={true} collaborationId={collaborationId}/>;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, collaborationId]);

  const handleSave = () => {
    if (name.trim() && content.trim() && collaborationId) {
      onSave(collaborationId, name.trim(), content);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-[#18181b] border-white/10 text-white'}`}
      >
        <DialogHeader className={`p-4 border-b shrink-0 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
          <DialogTitle>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Untitled Document"
              className={`text-lg font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent ${isLight ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-gray-600'}`}
            />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {editorComponent}
        </div>

        <DialogFooter className={`p-4 border-t ${isLight ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-white/5'}`}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !content.trim() || !collaborationId}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
