import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className={cn(
          "relative w-full max-w-lg bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col",
          className
        )}
      >
        <div className="flex items-center justify-between border-b-4 border-black p-4 bg-gray-100">
          <h2 className="font-mono text-xl font-bold uppercase tracking-wider">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto border-transparent shadow-none hover:bg-gray-300">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
