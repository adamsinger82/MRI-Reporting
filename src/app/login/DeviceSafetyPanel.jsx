'use client';
// DeviceSafetyPanel.jsx — LucidMSK MRI Device ID & Safety reference
// Renders as TAB CONTENT inside MSKHubModal (same pattern as ResearchModalInner /
// CmeTabInner) — no overlay/header of its own; MSKHubModal already provides that.
// Educational reference only — NOT Clinical Decision Support, NOT embedded in
// EMR. Static content only, no runtime AI calls.
// Props:
//   currentUser — { id, access_token }

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DEVICES, DEVICE_CATEGORIES, MR_STATUS_META, BOOKMARKS_TABLE } from './deviceSafetyData';

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

// ── hub-context palette (MSKHub content is always dark-themed) ──────────────
const c = {
  bg:       '#1a2332',
  bgCard:   '#0f172a',
  border:   'rgba(99,179,237,0.15)',
  borderLt: 'rgba(99,179,237,0.3)',
  txt:      '#e2e8f0',
  sub:      '#94a3b8',
  accent:   '#90cdf4',
};

export default function DeviceSafetyPanel({ currentUser }) {
  const [query, setQuery]           = useState('');
  const [activeCategory, setActive] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarks, setBookmarks]   = useState(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const userId = currentUser?.id;
  const accessToken = currentUser?.access_token;

  // ── Load user's bookmarks ────────────────────────────────────────────────
  const fetchBookmarks = useCallback(async () => {
    if (!userId || !accessToken) return;
    setLoadingBookmarks(true);
    try {
      const res = await fetch(
        `${SUPA_URL}/rest/v1/${BOOKMARKS_TABLE}?user_id=eq.${userId}&select=device_id`,
        { headers: supaHeaders(accessToken) }
      );
      const data = res.ok ? await res.json() : [];
      setBookmarks(new Set((Array.isArray(data) ? data : []).map(r => r.device_id)));
    } catch (e) {
      console.error('fetchBookmarks error', e);
    }
    setLoadingBookmarks(false);
  }, [userId, accessToken]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const toggleBookmark = async (deviceId) => {
    if (!userId || !accessToken) return;
    const isBookmarked = bookmarks.has(deviceId);
    // optimistic update
    setBookmarks(prev => {
      const next = new Set(prev);
      isBookmarked ? next.delete(deviceId) : next.add(deviceId);
      return next;
    });
    try {
      if (isBookmarked) {
        await fetch(
          `${SUPA_URL}/rest/v1/${BOOKMARKS_TABLE}?user_id=eq.${userId}&device_id=eq.${deviceId}`,
          { method: 'DELETE', headers: supaHeaders(accessToken) }
        );
      } else {
        await fetch(`${SUPA_URL}/rest/v1/${BOOKMARKS_TABLE}`, {
          method: 'POST',
          headers: supaHeaders(accessToken),
          body: JSON.stringify({ user_id: userId, device_id: deviceId }),
        });
      }
    } catch (e) {
      console.error('toggleBookmark error', e);
      fetchBookmarks(); // reconcile on failure
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEVICES.filter(d => {
      if (showBookmarkedOnly && !bookmarks.has(d.id)) return false;
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      if (!q) return true;
      const hay = [d.name, ...(d.aliases || [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCategory, showBookmarkedOnly, bookmarks]);

  const grouped = useMemo(() => {
    const map = {};
    DEVICE_CATEGORIES.forEach(cat => { map[cat.id] = []; });
    filtered.forEach(d => { (map[d.category] = map[d.category] || []).push(d); });
    return map;
  }, [filtered]);

  return (
    <div>
      <div style={{ color: c.accent, fontSize: 15, fontWeight: 700, marginBottom: 4, paddingBottom: 10, borderBottom: `1px solid ${c.border}` }}>
        🛡️ MRI Device ID &amp; Safety Reference
      </div>
      <div style={{ fontSize: 11, color: c.sub, lineHeight: 1.6, margin: '8px 0 16px' }}>
        Educational reference for identifying unknown devices on X-ray and checking general MR safety status.
        This is <strong style={{ color: c.txt }}>not</strong> patient-specific clinical decision support — always
        confirm device identity and current MR conditions against official manufacturer documentation and your
        institution's MRI safety policy before scanning.
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search device name…"
          style={{ flex: '1 1 200px', background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8, color: c.txt, fontSize: 13, padding: '9px 12px', outline: 'none' }}
        />
        <button
          onClick={() => setShowBookmarkedOnly(v => !v)}
          style={{ padding: '9px 14px', borderRadius: 8, border: `1px solid ${showBookmarkedOnly ? c.accent : c.border}`, background: showBookmarkedOnly ? 'rgba(99,179,237,0.15)' : 'transparent', color: showBookmarkedOnly ? c.accent : c.sub, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {showBookmarkedOnly ? '★ Bookmarked' : '☆ Bookmarked'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        <CategoryPill id="all" label="All" active={activeCategory === 'all'} onClick={() => setActive('all')} />
        {DEVICE_CATEGORIES.map(cat => (
          <CategoryPill key={cat.id} id={cat.id} label={`${cat.icon} ${cat.label}`} active={activeCategory === cat.id} onClick={() => setActive(cat.id)} />
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#4a5568', padding: '40px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 13 }}>No devices match your filters.</div>
        </div>
      )}

      {DEVICE_CATEGORIES.map(cat => {
        const items = grouped[cat.id] || [];
        if (items.length === 0) return null;
        if (activeCategory !== 'all' && activeCategory !== cat.id) return null;
        return (
          <div key={cat.id} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {cat.icon} {cat.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(d => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  expanded={expandedId === d.id}
                  onToggleExpand={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  bookmarked={bookmarks.has(d.id)}
                  onToggleBookmark={() => toggleBookmark(d.id)}
                  canBookmark={!!userId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${active ? c.accent : c.border}`, background: active ? 'rgba(99,179,237,0.15)' : 'transparent', color: active ? c.accent : c.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );
}

function DeviceCard({ device, expanded, onToggleExpand, bookmarked, onToggleBookmark, canBookmark }) {
  const status = MR_STATUS_META[device.mrStatus] || MR_STATUS_META.unknown;
  return (
    <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={onToggleExpand} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: c.txt, fontSize: 14, fontWeight: 700 }}>{device.name}</div>
          {device.aliases?.length > 0 && (
            <div style={{ color: c.sub, fontSize: 11, marginTop: 2 }}>aka {device.aliases.join(', ')}</div>
          )}
        </div>
        <span style={{ background: `${status.color}22`, color: status.color, border: `1px solid ${status.color}55`, borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          {status.label}
        </span>
        {canBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this device'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: bookmarked ? '#facc15' : c.sub, flexShrink: 0, lineHeight: 1 }}>
            {bookmarked ? '★' : '☆'}
          </button>
        )}
        <span style={{ color: c.sub, fontSize: 12, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${c.border}` }}>
          {device.imagePath && (
            <div style={{ margin: '12px 0', background: '#0a1220', border: `1px dashed ${c.border}`, borderRadius: 8, padding: '10px 12px', color: c.sub, fontSize: 11, textAlign: 'center' }}>
              🩻 Reference X-ray image goes here — {device.imagePath}
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Distinguishing Features
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: c.txt, fontSize: 12.5, lineHeight: 1.7 }}>
              {device.distinguishing?.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>

          {device.xrayCheckpoints?.length > 0 && (
            <div style={{ marginTop: 12, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                ✅ What to Check on X-ray Before Clearing
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: c.txt, fontSize: 12.5, lineHeight: 1.7 }}>
                {device.xrayCheckpoints.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              MR Safety Conditions
            </div>
            <div style={{ color: c.txt, fontSize: 12.5, lineHeight: 1.7 }}>{device.conditions}</div>
          </div>

          {device.lookalikes?.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 11, color: c.sub }}>
              Commonly confused with device(s) in this reference — check the distinguishing features above carefully.
            </div>
          )}

          {device.referenceLinks?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Reference Documents
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {device.referenceLinks.map((ref, i) => (
                  <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11.5, fontWeight: 600, color: c.accent, textDecoration: 'none', borderBottom: `1px solid ${c.accent}44`, width: 'fit-content' }}>
                    🔗 {ref.label} →
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
