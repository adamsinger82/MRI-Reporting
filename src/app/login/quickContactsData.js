// quickContactsData.js — LucidMSK "My Numbers" quick-reference phone directory
// Per-user only, reuses existing Supabase auth. No shared/PHI data.

export const CONTACTS_TABLE = 'quick_contacts';
export const MAX_CONTACTS_PER_USER = 25;

// Supabase row shape (for reference):
// {
//   id: uuid,
//   user_id: uuid,
//   label: text,          // e.g. 'CT Tech', 'MRI Tech'
//   phone_number: text,
//   sort_order: int4,
//   created_at: timestamptz
// }
//
// SQL to run in Supabase once:
// CREATE TABLE quick_contacts (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   label text NOT NULL,
//   phone_number text NOT NULL,
//   sort_order int4 DEFAULT 0,
//   created_at timestamptz DEFAULT now()
// );
// ALTER TABLE quick_contacts ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own contacts"
//   ON quick_contacts FOR ALL
//   USING (auth.uid() = user_id);

// Suggested labels — shown as quick-add chips for labels the user hasn't added yet
export const SUGGESTED_LABELS = [
  'CT Tech',
  'MRI Tech',
  'PACS / IT',
  'Front Desk',
  'Transport',
  'Charge Tech',
  'On-Call Radiologist',
  'Nursing Station',
  'Scheduling',
  'IR Suite',
];
