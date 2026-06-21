import React, { useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Button } from '../ui/Button';
import { PlusCircle, Settings, FileText, Trash2, Pencil, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { conversations, activeConversationId, setActiveConversation, createConversation, deleteConversation, updateTitle } = useWorkflowStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const startRename = (convId: string, currentTitle: string) => {
    setEditingId(convId);
    setEditValue(currentTitle);
  };

  const confirmRename = () => {
    if (editingId && editValue.trim()) {
      updateTitle(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="w-80 border-r-4 border-black bg-gray-100 flex flex-col h-screen shrink-0">
      <div className="p-4 border-b-4 border-black bg-white">
        <h1 className="font-mono text-2xl font-black tracking-widest uppercase mb-4">
          MNEMOSYNE_
        </h1>
        <Button
          variant="secondary"
          className="w-full justify-start font-black bg-black text-white hover:bg-gray-800"
          onClick={() => createConversation()}
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          [+ NEW TRACK]
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
          Sessions
        </div>

        {conversations.length === 0 ? (
          <div className="p-4 text-center border-2 border-dashed border-gray-400 text-gray-500 font-mono text-xs uppercase">
            No sessions yet.
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center justify-between p-3 border-2 border-black cursor-pointer font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
                activeConversationId === conv.id ? "bg-black text-white" : "bg-white text-black"
              )}
              onClick={() => {
                if (editingId !== conv.id) {
                  setActiveConversation(conv.id);
                }
              }}
            >
              {editingId === conv.id ? (
                <div className="flex items-center flex-1 gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    autoFocus
                    className="flex-1 px-1 py-0.5 border border-black bg-white text-black font-mono text-sm focus:outline-none"
                  />
                  <button onClick={confirmRename} className="p-0.5 hover:bg-gray-200">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={cancelRename} className="p-0.5 hover:bg-gray-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center truncate mr-2">
                    <FileText className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(conv.id, conv.title);
                      }}
                      className={cn(
                        "p-1 transition-colors",
                        activeConversationId === conv.id ? "hover:bg-gray-700" : "hover:bg-gray-200"
                      )}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className={cn(
                        "p-1 transition-colors",
                        activeConversationId === conv.id ? "hover:bg-gray-700 hover:text-white" : "hover:bg-gray-200"
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t-4 border-black bg-white space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={onOpenSettings}>
          <Settings className="mr-2 w-4 h-4" />
          SYSTEM CONFIG
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-700" onClick={handleLogout}>
          LOG OUT
        </Button>
      </div>
    </div>
  );
}
