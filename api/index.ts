// Vercel serverless function — Express app handler
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cookieParser from 'cookie-parser';
import OpenAI from 'openai';
import authRoutes from '../src/server/authRoutes';
import { auth } from '../src/server/middleware/auth';
import { executeWorkflow, cancelWorkflow } from '../src/server/workflows/runner';
import { supabaseAdmin } from '../src/lib/supabase/server';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use('/api/auth', authRoutes);

// Chat API (protected)
app.post('/api/chat', auth, async (req, res) => {
  const { messages, baseUrl, model, apiKey, currentPlan } = req.body;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API Key is required' });
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  try {
    const openai = new OpenAI({ apiKey, baseURL: baseUrl || 'https://api.openai.com/v1' });
    const { executeAgents } = await import('../src/server/agents');
    await executeAgents({ openai, model: model || 'gpt-4o', messages, sendEvent, plan: currentPlan });
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    sendEvent('error', { message: error.message || 'An error occurred' });
    res.end();
  }
});

// Workflow routes
app.post('/api/workflows', auth, async (req, res) => {
  const { config } = req.body;
  const userId = (req as any).user.id;
  try {
    const wf = await supabaseAdmin.from('workflows').insert({ user_id: userId, config: config || {} }).select().single();
    if (wf.error) throw wf.error;
    res.json({ workflow: wf.data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows/start', auth, async (req, res) => {
  const { workflowId, baseUrl, model, apiKey, config, context } = req.body;
  const userId = (req as any).user.id;
  if (!apiKey) return res.status(400).json({ error: 'API Key is required' });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  try {
    const { data: wfData, error: wfError } = await supabaseAdmin.from('workflows').select('*').eq('id', workflowId).single();
    if (wfError || !wfData) throw new Error('Workflow not found');
    const workflow = { id: wfData.id, title: wfData.title, status: wfData.status, config: config || wfData.config, subagents: wfData.subagents || [], results: wfData.results || {}, createdAt: wfData.created_at, updatedAt: wfData.updated_at };
    const openai = new OpenAI({ apiKey, baseURL: baseUrl || 'https://api.openai.com/v1' });
    await executeWorkflow(workflow, openai, model || 'gpt-4o', { ...context, userId, conversationId: wfData.conversation_id }, res);
    res.end();
  } catch (error: any) {
    console.error('Workflow error:', error);
    sendEvent('workflow_error', { workflowId, error: error.message || 'An error occurred' });
    res.end();
  }
});

app.get('/api/workflows/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('workflows').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ workflow: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workflows', auth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin.from('workflows').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    if (error) throw error;
    res.json({ workflows: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows/:id/cancel', auth, async (req, res) => {
  cancelWorkflow(req.params.id);
  try { await supabaseAdmin.from('workflows').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', req.params.id); } catch { /* ignore */ }
  res.json({ success: true });
});

app.delete('/api/workflows/:id', auth, async (req, res) => {
  try { await supabaseAdmin.from('workflows').delete().eq('id', req.params.id); res.json({ success: true }); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default app;
