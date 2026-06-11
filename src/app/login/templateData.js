// templateData.js — LucidMSK Custom Templates
// Constants and helpers for the user templates feature.

export const TEMPLATES_TABLE = 'user_templates';
export const MAX_TEMPLATES_PER_USER = 25;

// Supabase row shape (for reference):
// {
//   id: uuid,
//   user_id: uuid,
//   name: text,
//   body_part: text,       // e.g. 'knee', 'spine'
//   modality: text,        // 'MRI' | 'CT' | 'XR'
//   content: text,
//   is_shared: boolean,    // shared to community
//   created_at: timestamptz
// }

// SQL to run in Supabase once:
// CREATE TABLE user_templates (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   name text NOT NULL,
//   body_part text,
//   modality text,
//   content text NOT NULL,
//   is_shared boolean DEFAULT false,
//   created_at timestamptz DEFAULT now()
// );
// ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own templates"
//   ON user_templates FOR ALL
//   USING (auth.uid() = user_id);
// CREATE POLICY "Users read shared templates"
//   ON user_templates FOR SELECT
//   USING (is_shared = true);
