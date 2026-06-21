import { supabase } from './client';
import { supabaseAdmin } from './server';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  parent_message_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  options?: any;
  timestamp: string;
}

export interface Plan {
  id: string;
  conversation_id: string;
  user_id: string;
  plan_data: any;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  conversation_id: string | null;
  title: string;
  status: string;
  config: any;
  results: any;
  created_at: string;
  updated_at: string;
}

// ─── Conversations ───────────────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createConversation(
  userId: string,
  title = 'New Conversation',
  parentId?: string
): Promise<Conversation> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ user_id: userId, title, parent_id: parentId || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateConversation(
  id: string,
  data: { title?: string }
): Promise<Conversation> {
  const { data: result, error } = await supabaseAdmin
    .from('conversations')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('conversations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addMessage(params: {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  options?: any;
  parentMessageId?: string;
}): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: params.conversationId,
      role: params.role,
      content: params.content,
      agent: params.agent || null,
      options: params.options || null,
      parent_message_id: params.parentMessageId || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Plans ───────────────────────────────────────────────────────────────────

export async function getPlan(conversationId: string): Promise<Plan | null> {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('conversation_id', conversationId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

export async function upsertPlan(
  conversationId: string,
  userId: string,
  planData: any
): Promise<Plan> {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        plan_data: planData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id' }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Workflows ───────────────────────────────────────────────────────────────

export async function getWorkflows(userId: string): Promise<Workflow[]> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createWorkflow(
  userId: string,
  conversationId?: string,
  config?: any
): Promise<Workflow> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .insert({
      user_id: userId,
      conversation_id: conversationId || null,
      config: config || {},
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateWorkflow(
  id: string,
  data: { status?: string; results?: any; title?: string }
): Promise<Workflow> {
  const { data: result, error } = await supabaseAdmin
    .from('workflows')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

export async function deleteWorkflow(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('workflows')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
