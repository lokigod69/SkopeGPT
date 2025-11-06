/**
 * Quick Notes Capture
 * Swipe-up drawer for capturing quick thoughts
 * Low friction, auto-saving
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface QuickNotesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function QuickNotes({
  isOpen,
  onClose,
  onSave,
  placeholder = 'Quick note...',
  initialValue = '',
}: QuickNotesProps) {
  const [note, setNote] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY - startY;
    // If dragged down more than 100px, close
    if (deltaY > 100) {
      handleClose();
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim());
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    if (note.trim()) {
      // Auto-save on close if there's content
      onSave(note.trim());
      setNote('');
    }
    onClose();
  };

  if (!isOpen) return null;

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quick Note</h3>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          <Textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            className="min-h-32 resize-none text-base"
            onKeyDown={(e) => {
              // Save on Cmd/Ctrl + Enter
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                handleSave();
              }
            }}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!note.trim()}
              className="flex-1"
            >
              Save Note
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Notes auto-save when you close • Cmd/Ctrl + Enter to save
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Quick Notes Trigger Button
 */
interface QuickNotesButtonProps {
  onClick: () => void;
  compact?: boolean;
}

export function QuickNotesButton({ onClick, compact = false }: QuickNotesButtonProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="text-sm">📝</span>
        <span className="text-xs text-muted-foreground">Add note</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-all group"
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground">
        <span className="text-2xl">📝</span>
        <span className="text-sm font-medium">Add a quick note</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Swipe up or tap to capture thoughts
      </p>
    </button>
  );
}
