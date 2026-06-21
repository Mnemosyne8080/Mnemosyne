# Mnemosyne

A structured workflow application that guides users through a five-stage process — Intake, Clarify, Research, Compile, Finalizer — to develop and validate ideas with the assistance of an LLM.

## Features

- **Multi-stage workflow**: Each conversation progresses through defined stages, with the AI agent adapting its output to the current phase.
- **Dynamic clarification**: The AI generates context-specific questions using multiple input types (text, radio, slider, boolean, scale). Follow-up rounds dig deeper based on previous answers.
- **Risk assessment**: Structured risk matrix with impact/likelihood ratings and mitigation strategies.
- **Compiled brief**: All conversation data synthesized into a structured summary for review before final planning.
- **Execution plan**: Kanban-style board with task-level detail, deliverables, and progress tracking. Completion triggers a celebration animation.
- **Per-user sessions**: Conversations are scoped to each authenticated user.
- **BYOK LLM integration**: Works with any OpenAI-compatible API. Presets for OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Groq, and OpenRouter.
- **Responsive design**: Works on desktop and mobile.

## Tech Stack

- React 19 + TypeScript (strict)
- Vite 6 with Tailwind CSS 4
- Zustand 5 (state management, persisted to localStorage)
- Supabase JS 2 (authentication)
- No backend required — all logic runs client-side.

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Configuration

On first use, open **System Config** (gear icon in the sidebar) and provide:

1. **API Base URL** — your LLM endpoint (preset dropdown available)
2. **API Key** — your provider key (stored locally in the browser)
3. **Model Name** — the model to use

## Authentication

Users sign up with a username and password. An optional email can be added in settings for account recovery.

## Project Structure

```
src/
  components/
    auth/AuthPage.tsx          — Login/signup
    chat/ChatArea.tsx          — Main chat interface
    layout/
      MainApp.tsx              — Root layout
      Sidebar.tsx              — Session list with rename/delete
      SettingsModal.tsx        — API configuration
    widgets/
      ClarificationForm.tsx    — Dynamic LLM-generated forms
      RiskMatrix.tsx           — Risk assessment grid
      CompiledBrief.tsx        — Synthesized project brief
      ExecutionBoard.tsx       — Kanban execution plan
    workflow/StageVisualizer.tsx
  lib/
    ai/openaiClient.ts         — LLM calls + structured output parsing
    store/useWorkflowStore.ts  — Conversation state (persisted)
    store/useSettingsStore.ts  — App settings (persisted)
  types.ts                     — Core domain types
```

## Deployment

This project is configured for Vercel deployment. Connect the repository, set the Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), and deploy.
