import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../store/useSettingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettingsStore();
  
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SYSTEM SETTINGS">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">API Base URL</label>
          <Input 
            value={localSettings.baseUrl}
            onChange={(e) => setLocalSettings({...localSettings, baseUrl: e.target.value})}
            placeholder="https://api.openai.com/v1"
          />
        </div>
        
        <div className="space-y-2">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">API Key (BYOK)</label>
          <Input 
            type="password"
            value={localSettings.apiKey}
            onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
            placeholder="sk-..."
          />
          <p className="font-mono text-xs text-gray-500">Your key is stored locally in your browser.</p>
        </div>
        
        <div className="space-y-2">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">Model Name</label>
          <Input
            value={localSettings.modelName}
            onChange={(e) => setLocalSettings({...localSettings, modelName: e.target.value})}
            placeholder="gpt-4o"
          />
        </div>

        <div className="space-y-2 pt-4 border-t-2 border-black">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">Email (optional)</label>
          <Input
            type="email"
            value={localSettings.email || ''}
            onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
            placeholder="you@example.com"
          />
          <p className="font-mono text-xs text-gray-500">For account recovery and notifications.</p>
        </div>

        <Button variant="secondary" className="w-full mt-4" onClick={handleSave}>
          SAVE CONFIGURATION [ENTER]
        </Button>
      </div>
    </Modal>
  );
}
