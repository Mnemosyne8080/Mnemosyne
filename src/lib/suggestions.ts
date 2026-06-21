import type { Message, Plan } from '../store';

const STARTER_SUGGESTIONS = [
  'I want to build a SaaS product for...',
  'Help me plan a career transition to...',
  'Research the market for...',
  'Validate my idea for a...',
  'Create a roadmap for learning...',
  'Analyze the risks of...',
];

export function getStarterSuggestions(): string[] {
  return STARTER_SUGGESTIONS;
}

export function getContextualSuggestions(messages: Message[], plan?: Plan): string[] {
  if (messages.length === 0) return STARTER_SUGGESTIONS;

  const last = messages[messages.length - 1];

  if (last.agent === 'Clarifier') {
    const base = ["Yes, that's right", 'Not quite, let me rephrase', 'Can you give me options?'];
    return [...new Set([...base])];
  }

  if (last.agent === 'Planner') {
    return [
      'Export the plan as PDF',
      'Add more detail to milestones',
      'What are the biggest risks?',
      'Suggest alternative paths',
      'Refine the assumptions',
    ];
  }

  if (last.agent === 'Researcher') {
    return [
      'Tell me more about your findings',
      'Focus on the market analysis',
      'What about competition?',
    ];
  }

  if (plan && (plan.idea || plan.milestones?.length)) {
    return [
      'Summarize our progress',
      'What should I focus on next?',
      'Start a workflow to research this',
    ];
  }

  if (messages.length > 8) {
    return [
      'Summarize our progress',
      'What should I focus on next?',
      'Start a workflow to research this',
    ];
  }

  return STARTER_SUGGESTIONS.slice(0, 4);
}
