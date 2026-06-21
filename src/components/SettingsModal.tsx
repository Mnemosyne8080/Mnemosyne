import React from 'react';
import { useAppStore } from '../store';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { cn } from './utils';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { baseUrl, modelName, apiKey, toolsEnabled, setBaseUrl, setModelName, setApiKey, toggleTool } = useAppStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={cn("panel-brutal max-w-md w-full bg-white p-6 max-h-[90vh] overflow-y-auto")}>
        <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
          <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Config
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 flex flex-col">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="input-brutal w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-2">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="input-brutal w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-brutal w-full font-sans"
              placeholder="sk-..."
            />
          </div>

          <div>
            <h3 className="text-md font-bold uppercase border-b-2 border-black pb-2 mb-4 mt-8">Tools</h3>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(toolsEnabled) as Array<keyof typeof toolsEnabled>).map((tool) => (
                <label key={tool} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={toolsEnabled[tool]}
                      onChange={() => toggleTool(tool)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-black bg-white group-active:bg-gray-200 peer-checked:bg-black transition-colors" />
                    {toolsEnabled[tool] && (
                      <div className="absolute inset-0 flex items-center justify-center p-1 pointer-events-none text-white">
                        <X className="w-4 h-4" /> {/* Not an X really, but let's use a checkmark if possible, or just solid fill */}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-sm uppercase">{tool.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t-4 border-black text-right">
          <button onClick={onClose} className="btn-brutal-dark">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
