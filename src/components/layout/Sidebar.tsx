import React from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Button } from '../ui/Button';
import { PlusCircle, Search, Settings, FileText, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { conversations, activeConversationId, setActiveConversation, createConversation, deleteConversation } = useWorkflowStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
          [+ NEW EXECUTION TRACK]
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
          Historical Sessions //
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-4 text-center border-2 border-dashed border-gray-400 text-gray-500 font-mono text-xs uppercase">
            No execution tracks found.
          </div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id}
              className={cn(
                "group flex items-center justify-between p-3 border-2 border-black cursor-pointer font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
                activeConversationId === conv.id ? "bg-black text-white" : "bg-white text-black"
              )}
              onClick={() => setActiveConversation(conv.id)}
            >
              <div className="flex items-center truncate mr-2">
                <FileText className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 transition-colors",
                  activeConversationId === conv.id ? "hover:bg-gray-700 hover:text-white" : ""
                )}
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
          TERMINATE SESSION
        </Button>
      </div>
    </div>
  );
}
