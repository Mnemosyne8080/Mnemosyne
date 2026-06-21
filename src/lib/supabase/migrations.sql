-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table (for chat history)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  parent_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (with branching support)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL DEFAULT '',
  agent TEXT,
  options JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Workflow',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  config JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_parent_id ON conversations(parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_plans_conversation_id ON plans(conversation_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_conversation_id ON workflows(conversation_id);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT WITH CHECK (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update messages in own conversations" ON messages FOR UPDATE USING (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete messages in own conversations" ON messages FOR DELETE USING (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);

-- Plans policies
CREATE POLICY "Users can view own plans" ON plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON plans FOR DELETE USING (auth.uid() = user_id);

-- Workflows policies
CREATE POLICY "Users can view own workflows" ON workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workflows" ON workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflows" ON workflows FOR DELETE USING (auth.uid() = user_id);
