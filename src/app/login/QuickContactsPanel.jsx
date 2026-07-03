'use client';
// QuickContactsPanel.jsx — LucidMSK "My Numbers" quick-reference phone directory
// Renders as TAB CONTENT inside MSKHubModal (same pattern as ResearchModalInner /
// CmeTabInner) — no overlay/header of its own; MSKHubModal already provides that.
// Per-user list only — reuses existing Supabase auth, no new account system, no PHI.
// Props:
//   currentUser — { id, access_token }

import { useState, useEffect, useCallback } from 'react';
import { CONTACTS_TABLE, MAX_CONTACTS_PER_USER, SUGGESTED_LABELS } from './quickContactsData';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function supaHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    apikey: getAnonKey(),
    Authorization: `Bearer ${accessToken}`,
    Prefer: 'return=representation',
  };
}

const c = {
  bg:     '#1a2332',
  bgCard: '#0f172a',
  border: 'rgba(99,179,237,0.15)',
  accent: '#90cdf4',
  txt:    '#e2e8f0',
  sub:    '#94a3b8',
  green:  '#4ade80',
  red:    '#f87171',
};

export default function QuickContactsPanel({ currentUser }) {
  const [contacts, setContacts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [newLabel, setNewLabel]   = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [copiedId, setCopiedId]   = useState(null);

  const userId = currentUser?.id;
  const accessToken = currentUser?.access_token;

  const fetchContacts = useCallback(async () => {
    if (!userId || !accessToken) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${SUPA_URL}/rest/v1/${CONTACTS_TABLE}?user_id=eq.${userId}&order=sort_order.asc,created_at.asc`,
        { headers: supaHeaders(accessToken) }
      );
      const data = res.ok ? await res.json() : [];
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('fetchContacts error', e);
      setError('Could not load your numbers. Try again.');
    }
    setLoading(false);
  }, [userId, accessToken]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const addContact = async (label, number) => {
    if (!userId || !accessToken) return;
    const l = label.trim(), n = number.trim();
    if (!l || !n) { setError('Enter both a label and a phone number.'); return; }
    if (contacts.length >= MAX_CONTACTS_PER_USER) { setError(`Limit of ${MAX_CONTACTS_PER_USER} numbers reached.`); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${CONTACTS_TABLE}`, {
        method: 'POST',
        headers: supaHeaders(accessToken),
        body: JSON.stringify({ user_id: userId, label: l, phone_number: n, sort_order: contacts.length }),
      });
      if (!res.ok) throw new Error(await res.text());
      const [row] = await res.json();
      setContacts(prev => [...prev, row]);
      setNewLabel(''); setNewNumber('');
    } catch (e) {
      console.error('addContact error', e);
      setError('Could not save. Try again.');
    }
    setSaving(false);
  };

  const deleteContact = async (id) => {
    if (!accessToken) return;
    setContacts(prev => prev.filter(c => c.id !== id)); // optimistic
    try {
      await fetch(`${SUPA_URL}/rest/v1/${CONTACTS_TABLE}?id=eq.${id}`, {
        method: 'DELETE',
        headers: supaHeaders(accessToken),
      });
    } catch (e) {
      console.error('deleteContact error', e);
      fetchContacts();
    }
  };

  const startEdit = (contact) => {
    setEditingId(contact.id);
    setEditLabel(contact.label);
    setEditNumber(contact.phone_number);
  };

  const saveEdit = async (id) => {
    const l = editLabel.trim(), n = editNumber.trim();
    if (!l || !n) return;
    setContacts(prev => prev.map(c => c.id === id ? { ...c, label: l, phone_number: n } : c)); // optimistic
    setEditingId(null);
    try {
      await fetch(`${SUPA_URL}/rest/v1/${CONTACTS_TABLE}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...supaHeaders(accessToken), Prefer: 'return=minimal' },
        body: JSON.stringify({ label: l, phone_number: n }),
      });
    } catch (e) {
      console.error('saveEdit error', e);
      fetchContacts();
    }
  };

  const copyNumber = async (contact) => {
    try {
      await navigator.clipboard.writeText(contact.phone_number);
      setCopiedId(contact.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) { /* clipboard unavailable — ignore */ }
  };

  const usedLabels = new Set(contacts.map(c => c.label.toLowerCase()));
  const availableSuggestions = SUGGESTED_LABELS.filter(l => !usedLabels.has(l.toLowerCase()));

  const inp = { background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.txt, fontSize: 13, padding: '9px 12px', outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ color: c.accent, fontSize: 15, fontWeight: 700, marginBottom: 4, paddingBottom: 10, borderBottom: `1px solid ${c.border}` }}>
        📞 My Numbers
      </div>
      <div style={{ fontSize: 11, color: c.sub, lineHeight: 1.6, margin: '8px 0 16px' }}>
        A private quick-reference list — CT tech, MRI tech, PACS, front desk, whatever you call often.
        Only visible to you.
      </div>

      {!userId && (
        <div style={{ color: c.sub, fontSize: 13, textAlign: 'center', padding: '30px 0' }}>Sign in to save your numbers.</div>
      )}

      {userId && (
        <>
          {/* Add form */}
          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (e.g. MRI Tech)" style={{ ...inp, flex: '1 1 140px' }} maxLength={40} />
              <input value={newNumber} onChange={e => setNewNumber(e.target.value)} placeholder="Phone number" style={{ ...inp, flex: '1 1 140px' }} maxLength={30} />
              <button onClick={() => addContact(newLabel, newNumber)} disabled={saving}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: saving ? '#334155' : 'linear-gradient(135deg,#2563eb,#4f46e5)', color: 'white', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                + Add
              </button>
            </div>

            {availableSuggestions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {availableSuggestions.map(label => (
                  <button key={label} onClick={() => setNewLabel(label)}
                    style={{ padding: '4px 10px', borderRadius: 14, border: `1px solid ${c.border}`, background: 'transparent', color: c.sub, fontSize: 11, cursor: 'pointer' }}>
                    + {label}
                  </button>
                ))}
              </div>
            )}

            {error && <div style={{ color: c.red, fontSize: 11, marginTop: 8 }}>{error}</div>}
          </div>

          {/* List */}
          {loading && <div style={{ color: c.sub, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading…</div>}

          {!loading && contacts.length === 0 && (
            <div style={{ textAlign: 'center', color: '#4a5568', padding: '30px 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📇</div>
              <div style={{ fontSize: 13 }}>No numbers saved yet. Add one above.</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contacts.map(contact => (
              <div key={contact.id} style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                {editingId === contact.id ? (
                  <>
                    <input value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{ ...inp, flex: '1 1 120px' }} />
                    <input value={editNumber} onChange={e => setEditNumber(e.target.value)} style={{ ...inp, flex: '1 1 120px' }} />
                    <button onClick={() => saveEdit(contact.id)} style={{ background: 'none', border: 'none', color: c.green, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: c.sub, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: c.txt, fontSize: 13, fontWeight: 700 }}>{contact.label}</div>
                      <div style={{ color: c.sub, fontSize: 13 }}>{contact.phone_number}</div>
                    </div>
                    <a href={`tel:${contact.phone_number.replace(/[^\d+]/g, '')}`}
                      title="Call" style={{ textDecoration: 'none', color: c.green, fontSize: 16, padding: 4 }}>📞</a>
                    <button onClick={() => copyNumber(contact)} title="Copy number"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === contact.id ? c.green : c.sub, fontSize: 15, padding: 4 }}>
                      {copiedId === contact.id ? '✓' : '📋'}
                    </button>
                    <button onClick={() => startEdit(contact)} title="Edit"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.sub, fontSize: 15, padding: 4 }}>✏️</button>
                    <button onClick={() => deleteContact(contact.id)} title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.red, fontSize: 15, padding: 4 }}>🗑️</button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: c.sub, textAlign: 'right', marginTop: 10 }}>
            {contacts.length} / {MAX_CONTACTS_PER_USER} numbers used
          </div>
        </>
      )}
    </div>
  );
}
