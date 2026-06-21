# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mnemosyne** is a React 19 single-page application built with Vite 6 and styled with Tailwind CSS 4. It is an AI-powered workflow tool that guides users through a structured multi-stage process (Intake → Clarify → Research → Compile → Finalizer) to develop and validate ideas. The app communicates with OpenAI-compatible LLM endpoints (BYOK — bring your own key) and uses Supabase for authentication.

## Commands

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start dev server (port 3000) | `npm run dev` |
| Production build (output to `dist/`) | `npm run build` |
| Preview production build | `npm run preview` |
| Type-check (lint) | `npm run lint` *(runs `tsc --noEmit`)* |
| Clean build artifacts | `npm run clean` |

**Note:** There is no test runner configured. There is no ESLint or Prettier — `npm run lint` is TypeScript-only.

## Architecture

### Tech Stack
- **React 19** + **TypeScript** (strict, `react-jsx` transform)
- **Vite 6** with `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Tailwind CSS 4** (utility-first styling via `@tailwindcss/vite` plugin)
- **Zustand 5** with `persist` middleware (global state, persisted to `localStorage`)
- **Supabase JS 2** (auth; client initialized in `src/lib/supabase.ts`)
- **Express 4** (listed as dependency but no server source in repo)
- **motion** (animations), **lucide-react** (icons), **react-markdown** (markdown rendering)

### Path Alias
`@/` is aliased to the project root (both in `tsconfig.json` paths and `vite.config.ts` resolve.alias). Use `@/src/...` or `@/components/...` for imports.

### HMR Behavior
HMR can be disabled via the `DISABLE_HMR=true` environment variable. This is used in AI Studio environments to prevent flickering during agent edits. Do not modify this behavior in `vite.config.ts`.

### Core Domain Types (`src/types.ts`)
- **`WorkflowStage`**: `'INTAKE' | 'CLARIFY' | 'RESEARCH' | 'COMPILE' | 'FINALIZER'` — the five stages of the workflow
- **`AppSettings`**: `{ baseUrl, apiKey, modelName }` — LLM endpoint configuration
- **`ChatMessage`**: Messages with optional structured component output (`ClarificationForm`, `RiskMatrix`, `CompiledBrief`, `ExecutionBoard`)
- **`Conversation``: A workflow session with a title, current stage, and message history

### State Management (Zustand Stores)
- **`useSettingsStore`** (`src/store/useSettingsStore.ts`): Persisted app settings (API key, base URL, model name). Key method: `isConfigured()` checks if API key is set. Defaults to OpenAI (`https://api.openai.com/v1`, model `gpt-4o`).
- **`useWorkflowStore`** (`src/store/useWorkflowStore.ts`): Persisted conversation state. Manages multiple conversations with create/addMessage/updateStage/updateTitle/delete operations. Each conversation tracks its `WorkflowStage`.

### LLM Integration (`src/lib/ai/openaiClient.ts`)
- `callLLM(messages, settings, stage)`: Sends messages to an OpenAI-compatible API. Each `WorkflowStage` has a different system prompt that instructs the LLM to produce structured JSON output for the corresponding UI component.
- `parseStructuredOutput(content)`: Extracts JSON blocks from markdown code fences. Returns `{ text, component, componentData }` — if a `component` field is found, the corresponding widget is rendered inline in the chat.

### Component Structure
```
src/components/
  auth/AuthPage.tsx          — Login/signup via Supabase auth (with bypass for demo)
  chat/
    ChatArea.tsx             — Main chat interface
    AgentTerminal.tsx        — Terminal-style AI interaction UI
  layout/
    MainApp.tsx              — Root layout: auth gate → sidebar + chat + settings modal
    Sidebar.tsx              — Navigation sidebar
    SettingsModal.tsx        — Modal for configuring API key, base URL, model
  ui/
    Button.tsx, Card.tsx, Input.tsx, Modal.tsx  — Reusable UI primitives
  widgets/
    ClarificationForm.tsx    — Dynamic form generated from LLM output (CLARIFY stage)
    RiskMatrix.tsx           — Risk visualization (RESEARCH stage)
    CompiledBrief.tsx        — Compiled project brief (COMPILE stage)
    ExecutionBoard.tsx       — Kanban-style execution plan (FINALIZER stage)
  workflow/
    StageVisualizer.tsx      — Visual indicator of current workflow stage
```

### Styling Conventions
- Tailwind CSS utility classes throughout. No CSS modules or styled-components.
- `cn()` utility from `src/lib/utils.ts` combines `clsx` + `twMerge` for conditional class merging.
- Global style: black selection highlight (`selection:bg-black selection:text-white`), monospace loading text.

### Environment Variables
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: Supabase credentials (accessed via `import.meta.env`). Falls back to placeholder values if not set.
- `DISABLE_HMR`: When `"true"`, disables HMR and file watching in Vite dev server.

### Entry Points
- `index.html` → `src/main.tsx` (React bootstrap) → `src/App.tsx` → `src/components/layout/MainApp.tsx`
