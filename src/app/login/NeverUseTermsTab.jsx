'use client';
// NeverUseTermsTab.jsx — LucidMSK personal "Never Use" word list
// Rendered as a third tab inside ReportPreferencesPanel.jsx.
//
// Unlike the Checklist/Report Styles tabs, this tab does NOT go through the
// panel's draft/Save-button flow — every add/edit/remove here saves to
// Supabase immediately (own table, own RLS, scoped to auth.uid() = user_id
// so each radiologist only ever sees their own list). That keeps this tab
// simple and means there's nothing to lose if someone closes the panel
// mid-edit.
//
// Props:
//   dm            — dark mode boolean
//   userId        — authUser.id
//   accessToken   — authUser.access_token
//   terms         — string[] — this user's current never-use list (owned by page.js state)
//   onChange(terms) — callback: page.js updates its own state so the next
//                     generated report immediately reflects the change

import { useState } from 'react';
import {
  addNeverUseTerm, editNeverUseTerm, removeNeverUseTerm, MAX_TERMS,
} from './neverUseTermsUtils';

export default function NeverUseTermsTab({ dm, userId, accessToken, terms, onChange }) {
  const list = terms || [];
  const [newTerm, setNewTerm] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [editingTerm, setEditingTerm] = useState(null); // the term currently being edited
  const [editValue, setEditValue] = useState('');
  const [busyTerm, setBusyTerm] = useState(null); // term currently saving/removing — disables its row

  const c = {
    bg:     dm ? '#0f172a' : '#ffffff',
    bgCard: dm ? '#1e293b' : '#f8fafc',
    border: dm ? '#334155' : '#e2e8f0',
    txt:    dm ? '#e2e8f0' : '#1e293b',
    sub:    dm ? '#94a3b8' : '#64748b',
    accent: '#2563eb',
    red:    dm ? '#f87171' : '#dc2626',
  };

  const handleAdd = async () => {
    if (!newTerm.trim() || adding) return;
    setAdding(true);
    setError('');
    try {
      const updated = await addNeverUseTerm(userId, accessToken, list, newTerm);
      onChange(updated);
      setNewTerm('');
    } catch (e) {
      setError(e.message || 'Failed to add term.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (term) => {
    setBusyTerm(term);
    setError('');
    try {
      const updated = await removeNeverUseTerm(userId, accessToken, list, term);
      onChange(updated);
    } catch (e) {
      setError(e.message || 'Failed to remove term.');
    } finally {
      setBusyTerm(null);
    }
  };

  const startEdit = (term) => {
    setEditingTerm(term);
    setEditValue(term);
    setError('');
  };

  const cancelEdit = () => {
    setEditingTerm(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingTerm) return;
    setBusyTerm(editingTerm);
    setError('');
    try {
      const updated = await editNeverUseTerm(userId, accessToken, list, editingTerm, editValue);
      onChange(updated);
      setEditingTerm(null);
      setEditValue('');
    } catch (e) {
      setError(e.message || 'Failed to save edit.');
    } finally {
      setBusyTerm(null);
    }
  };

  const inputStyle = {
    flex: 1, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${c.border}`,
    background: c.bg, color: c.txt, fontSize: 13, outline: 'none',
  };

  return (
    <>
      <div style={{ fontSize: 11, color: c.sub, background: c.bgCard, borderRadius: 8, padding: '8px 12px', margin: '10px 0', border: `1px solid ${c.border}`, lineHeight: 1.5 }}>
        🚫 Words or phrases here are <strong>personal to your account only</strong> — no one else can see or is affected by your list. They <strong>override every other setting</strong> (including default terminology and Report Style choices): the report will never use them, substituting an accurate synonym instead. Changes save instantly.
      </div>

      {/* Add form */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
        <input
          type="text"
          value={newTerm}
          onChange={e => setNewTerm(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="e.g. impingement, unremarkable, mild"
          style={inputStyle}
          disabled={adding}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newTerm.trim()}
          style={{
            padding: '9px 16px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: 'white',
            fontSize: 13, fontWeight: 700, cursor: adding || !newTerm.trim() ? 'not-allowed' : 'pointer',
            opacity: adding || !newTerm.trim() ? 0.6 : 1, whiteSpace: 'nowrap',
          }}>
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: c.red, background: dm ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: `1px solid ${dm ? '#991b1b' : '#fca5a5'}`, borderRadius: 8, padding: '6px 10px', marginBottom: 8 }}>
          {error}
        </div>
      )}

      <div style={{ fontSize: 11, color: c.sub, marginBottom: 6 }}>
        {list.length} of {MAX_TERMS} terms
      </div>

      {/* Term list */}
      {list.length === 0 ? (
        <div style={{ fontSize: 12, color: c.sub, textAlign: 'center', padding: '24px 12px' }}>
          No never-use words yet. Add one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 12 }}>
          {list.map(term => {
            const isEditing = editingTerm === term;
            const isBusy = busyTerm === term;
            return (
              <div key={term} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
                padding: '7px 10px', opacity: isBusy ? 0.6 : 1,
              }}>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      autoFocus
                      style={{ ...inputStyle, padding: '6px 10px' }}
                      disabled={isBusy}
                    />
                    <button onClick={saveEdit} disabled={isBusy}
                      style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: c.accent, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Save
                    </button>
                    <button onClick={cancelEdit} disabled={isBusy}
                      style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${c.border}`, background: 'transparent', color: c.sub, fontSize: 12, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 13, color: c.txt }}>{term}</span>
                    <button onClick={() => startEdit(term)} disabled={isBusy}
                      title="Edit"
                      style={{ padding: '5px 9px', borderRadius: 6, border: `1px solid ${c.border}`, background: 'transparent', color: c.sub, fontSize: 12, cursor: isBusy ? 'not-allowed' : 'pointer' }}>
                      ✎
                    </button>
                    <button onClick={() => handleRemove(term)} disabled={isBusy}
                      title="Remove"
                      style={{ padding: '5px 9px', borderRadius: 6, border: `1px solid ${c.border}`, background: 'transparent', color: c.red, fontSize: 12, cursor: isBusy ? 'not-allowed' : 'pointer' }}>
                      {isBusy ? '…' : '✕'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
