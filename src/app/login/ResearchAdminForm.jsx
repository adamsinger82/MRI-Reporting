'use client';
// ResearchAdminForm.jsx — admin-only "New Post" form for the Research tab,
// mirroring the look/feel of the Jobs Board post form and CME module create
// form already in MSKHubModal. Drop-in component — import in page.js and
// render inside ResearchModalInner when isAdmin is true.
//
// USAGE IN page.js:
//   import ResearchAdminForm from './ResearchAdminForm';
//
//   {isAdmin && (
//     <ResearchAdminForm
//       currentUser={currentUser}
//       SUPABASE_URL={SUPABASE_URL}
//       onCreated={(newPost) => { setPosts(p => [newPost, ...p]); setShowNewPost(false); }}
//       onClose={() => setShowNewPost(false)}
//     />
//   )}

import { useState } from 'react';
import { createResearchPost } from './researchUtils';

const emptyForm = {
  title: '',
  journal: '',
  citation: '',
  summaryText: '',   // textarea, one bullet per line — split on submit
  key_takeaway: '',
  link: '',
  tagsText: '',       // comma-separated, split on submit
};

export default function ResearchAdminForm({ currentUser, SUPABASE_URL, onCreated, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 7, color: '#e2e8f0', fontSize: 12, padding: '7px 10px',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#64748b', textTransform: 'uppercase', marginBottom: 5, display: 'block' };

  const submit = async () => {
    setErr(''); setOk('');
    if (!form.title.trim())     return setErr('Title is required.');
    if (!form.summaryText.trim()) return setErr('At least one summary bullet is required.');

    setSubmitting(true);
    try {
      const summary = form.summaryText.split('\n').map(s => s.trim()).filter(Boolean);
      const tags = form.tagsText.split(',').map(t => t.trim()).filter(Boolean);
      const newPost = await createResearchPost(SUPABASE_URL, currentUser, {
        title: form.title,
        journal: form.journal,
        citation: form.citation,
        summary,
        key_takeaway: form.key_takeaway,
        link: form.link,
        tags,
      });
      setOk('Post published.');
      setForm(emptyForm);
      if (onCreated) onCreated(newPost);
    } catch (e) {
      console.error('createResearchPost error:', e);
      setErr('Failed to publish. Check console for details.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: '#141f30', border: '1px solid #1e3a5f', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(99,179,237,0.1)' }}>
        <span style={{ color: '#90cdf4', fontSize: 15, fontWeight: 700 }}>📰 New Research Post</span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer' }}>✕</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Article Title *</label>
          <input style={inputStyle} placeholder="Full article title" value={form.title} onChange={set('title')} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Journal</label>
            <input style={inputStyle} placeholder="e.g. Skeletal Radiology · 2026" value={form.journal} onChange={set('journal')} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Citation</label>
          <input style={inputStyle} placeholder="Author A, Author B, et al. Title. Journal. Year;Vol(Issue):Pages." value={form.citation} onChange={set('citation')} />
        </div>

        <div>
          <label style={labelStyle}>Summary bullets * (one per line)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.6 }}
            placeholder={'Study design and population...\nKey finding 1 with numbers...\nKey finding 2...'}
            value={form.summaryText}
            onChange={set('summaryText')}
          />
        </div>

        <div>
          <label style={labelStyle}>Key Takeaway</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical', lineHeight: 1.6 }}
            placeholder="One sentence distilling the clinical bottom line..."
            value={form.key_takeaway}
            onChange={set('key_takeaway')}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Link (DOI / PubMed)</label>
            <input style={inputStyle} placeholder="https://doi.org/..." value={form.link} onChange={set('link')} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input style={inputStyle} placeholder="Knee, Cartilage, MRI" value={form.tagsText} onChange={set('tagsText')} />
          </div>
        </div>

        {err && <div style={{ color: '#fc8181', fontSize: 12 }}>{err}</div>}
        {ok && <div style={{ color: '#68d391', fontSize: 12 }}>{ok}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          {onClose && (
            <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
          <button onClick={submit} disabled={submitting} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: submitting ? '#1e3a5f' : '#059669', color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Publishing…' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
