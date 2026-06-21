import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../store/useSettingsStore';

const PROVIDER_PRESETS = [
  { label: 'Custom', baseUrl: '', modelName: '' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-4o' },
  { label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', modelName: 'claude-sonnet-4-6' },
  { label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', modelName: 'gemini-2.5-flash' },
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', modelName: 'deepseek-chat' },
  { label: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', modelName: 'mistral-large-latest' },
  { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', modelName: 'llama-3.3-70b-versatile' },
  { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', modelName: 'google/gemini-2.5-flash-preview' },
];

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

  const applyPreset = (preset: typeof PROVIDER_PRESETS[number]) => {
    if (preset.baseUrl) {
      setLocalSettings({
        ...localSettings,
        baseUrl: preset.baseUrl,
        modelName: preset.modelName,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SYSTEM SETTINGS">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">Provider Preset</label>
          <select
            onChange={(e) => applyPreset(PROVIDER_PRESETS[Number(e.target.value)])}
            className="w-full px-3 py-2 border-2 border-black font-mono text-sm bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Select a provider...</option>
            {PROVIDER_PRESETS.map((preset, idx) => (
              <option key={preset.label} value={idx}>{preset.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">API Base URL</label>
          <Input
            value={localSettings.baseUrl}
            onChange={(e) => setLocalSettings({...localSettings, baseUrl: e.target.value})}
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div className="space-y-2">
          <label className="font-mono text-sm font-bold uppercase tracking-wider">API Key</label>
          <Input
            type="password"
            value={localSettings.apiKey}
            onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
            placeholder="sk-..."
          />
          <p className="font-mono text-xs text-gray-500">Stored locally in your browser. Never sent anywhere except the API.</p>
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
