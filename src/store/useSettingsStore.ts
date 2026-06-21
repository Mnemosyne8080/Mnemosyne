import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '../types';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isConfigured: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        modelName: 'gpt-4o',
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      isConfigured: () => {
        const { apiKey } = get().settings;
        return apiKey.trim().length > 0;
      }
    }),
    {
      name: 'mnemosyne-settings',
    }
  )
);
