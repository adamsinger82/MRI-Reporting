'use client';
// columnLayoutUtils.js — LucidMSK resizable/rearrangeable 3-column layout
//
// Exports: useColumnLayout, DEFAULT_ORDER, DEFAULT_WIDTHS
//
// - Resizing: drag handles between columns adjust grid-template-columns (fr units, min 0.4fr/col)
// - Reordering: grip bars (rendered by the caller when rearrangeMode is true) use native
//   HTML5 drag-and-drop to swap visual order only — the underlying JSX/column identity
//   never moves, only its CSS `order`.
// - Persistence: Supabase table `user_layout` (upsert by user_id), localStorage fallback/cache.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const DEFAULT_ORDER = [0, 1, 2];
export const DEFAULT_WIDTHS = [1, 1, 1];

const MIN_FR = 0.4;
const HANDLE_PX = 16; // width of the draggable gap between columns (mirrors old 16px grid gap)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function localKey(userId) {
  return `msk_layout_${userId || 'guest'}`;
}

function loadLocal(userId) {
  try {
    const raw = localStorage.getItem(localKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.order) || !Array.isArray(parsed.widths)) return null;
    return parsed;
  } catch { return null; }
}

function saveLocal(userId, order, widths) {
  try { localStorage.setItem(localKey(userId), JSON.stringify({ order, widths })); } catch {}
}

function clearLocal(userId) {
  try { localStorage.removeItem(localKey(userId)); } catch {}
}

async function fetchRemoteLayout(userId, accessToken) {
  const key = getAnonKey();
  if (!key || !userId) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_layout?select=column_order,column_widths&user_id=eq.${encodeURIComponent(userId)}`,
      { headers: { apikey: key, Authorization: `Bearer ${accessToken || key}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    const order = Array.isArray(row.column_order) ? row.column_order : null;
    const widths = Array.isArray(row.column_widths) ? row.column_widths : null;
    if (!order || !widths) return null;
    return { order, widths };
  } catch { return null; }
}

async function saveRemoteLayout(userId, accessToken, order, widths) {
  const key = getAnonKey();
  if (!key || !userId) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/user_layout?on_conflict=user_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${accessToken || key}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        column_order: order,
        column_widths: widths,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {
    // Silent — localStorage already has the up-to-date layout as fallback.
  }
}

async function deleteRemoteLayout(userId, accessToken) {
  const key = getAnonKey();
  if (!key || !userId) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/user_layout?user_id=eq.${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${accessToken || key}` },
    });
  } catch {}
}

export function useColumnLayout(authUser) {
  const userId = authUser?.id || null;
  const accessToken = authUser?.access_token || null;

  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [widths, setWidths] = useState(DEFAULT_WIDTHS);
  const [rearrangeMode, setRearrangeMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const dragColRef = useRef(null); // colId currently being dragged (reorder)
  const resizeRef = useRef(null);  // { slot, startX, startWidths, containerWidth }

  // ── Load layout on mount / when user changes ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      // Local cache first (instant, no flash of default layout)
      const local = loadLocal(userId);
      if (local && !cancelled) {
        setOrder(local.order);
        setWidths(local.widths);
      }
      // Then reconcile with Supabase (source of truth across devices)
      if (userId) {
        const remote = await fetchRemoteLayout(userId, accessToken);
        if (remote && !cancelled) {
          setOrder(remote.order);
          setWidths(remote.widths);
          saveLocal(userId, remote.order, remote.widths);
        }
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const persist = useCallback((nextOrder, nextWidths) => {
    saveLocal(userId, nextOrder, nextWidths);
    saveRemoteLayout(userId, accessToken, nextOrder, nextWidths);
  }, [userId, accessToken]);

  // ── Resizing ────────────────────────────────────────────────────────────
  const onResizePointerMove = useCallback((e) => {
    const r = resizeRef.current;
    if (!r) return;
    const deltaPx = e.clientX - r.startX;
    const pxPerFr = r.contentWidth / r.totalFr;
    if (!pxPerFr || !isFinite(pxPerFr)) return;
    const deltaFr = deltaPx / pxPerFr;
    const next = [...r.startWidths];
    let a = r.startWidths[r.slot] + deltaFr;
    let b = r.startWidths[r.slot + 1] - deltaFr;
    if (a < MIN_FR) { b -= (MIN_FR - a); a = MIN_FR; }
    if (b < MIN_FR) { a -= (MIN_FR - b); b = MIN_FR; }
    next[r.slot] = Math.max(MIN_FR, a);
    next[r.slot + 1] = Math.max(MIN_FR, b);
    setWidths(next);
  }, []);

  const onResizePointerUp = useCallback(() => {
    if (!resizeRef.current) return;
    resizeRef.current = null;
    document.removeEventListener('pointermove', onResizePointerMove);
    document.removeEventListener('pointerup', onResizePointerUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    setWidths(w => { persist(order, w); return w; });
  }, [onResizePointerMove, order, persist]);

  const startResize = useCallback((slot, e, containerEl) => {
    e.preventDefault();
    const rect = containerEl.getBoundingClientRect();
    const contentWidth = rect.width - HANDLE_PX * 2; // two handle tracks
    const totalFr = widths.reduce((s, w) => s + w, 0);
    resizeRef.current = { slot, startX: e.clientX, startWidths: widths, contentWidth, totalFr };
    document.addEventListener('pointermove', onResizePointerMove);
    document.addEventListener('pointerup', onResizePointerUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [widths, onResizePointerMove, onResizePointerUp]);

  // ── Reordering (native HTML5 drag-and-drop of grip bars) ──────────────────
  const dragProps = useCallback((colId) => ({
    draggable: true,
    onDragStart: (e) => {
      dragColRef.current = colId;
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(colId)); } catch {}
    },
    onDragOver: (e) => { e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch {} },
    onDrop: (e) => {
      e.preventDefault();
      const fromId = dragColRef.current;
      dragColRef.current = null;
      if (fromId === null || fromId === undefined || fromId === colId) return;
      setOrder(prev => {
        const next = [...prev];
        const fromPos = next.indexOf(fromId);
        const toPos = next.indexOf(colId);
        if (fromPos === -1 || toPos === -1) return prev;
        next[fromPos] = colId;
        next[toPos] = fromId;
        persist(next, widths);
        return next;
      });
    },
    onDragEnd: () => { dragColRef.current = null; },
  }), [widths, persist]);

  // ── Derived values for the caller ──────────────────────────────────────────
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `${widths[0]}fr ${HANDLE_PX}px ${widths[1]}fr ${HANDLE_PX}px ${widths[2]}fr`,
    gap: 0,
    padding: 16,
    boxSizing: 'border-box',
  }), [widths]);

  const orderStyle = useCallback((colId) => ({
    order: order.indexOf(colId) * 2,
  }), [order]);

  const Handle = useCallback(({ slot }) => (
    <div
      className="msk-resize-handle"
      onPointerDown={(e) => startResize(slot, e, e.currentTarget.parentElement)}
      style={{
        order: slot * 2 + 1,
        cursor: 'col-resize',
        width: HANDLE_PX,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
      }}
    >
      <div className="msk-resize-handle-line" style={{ width: 2, height: '100%', borderRadius: 2 }} />
    </div>
  ), [startResize]);

  const isCustomized = useMemo(() => (
    order.some((v, i) => v !== DEFAULT_ORDER[i]) ||
    widths.some((v, i) => Math.abs(v - DEFAULT_WIDTHS[i]) > 0.01)
  ), [order, widths]);

  const reset = useCallback(() => {
    setOrder(DEFAULT_ORDER);
    setWidths(DEFAULT_WIDTHS);
    clearLocal(userId);
    if (userId) deleteRemoteLayout(userId, accessToken);
  }, [userId, accessToken]);

  const toggleRearrangeMode = useCallback(() => setRearrangeMode(m => !m), []);

  return {
    order,
    widths,
    rearrangeMode,
    setRearrangeMode,
    toggleRearrangeMode,
    isCustomized,
    loaded,
    gridStyle,
    orderStyle,
    dragProps,
    Handle,
    reset,
  };
}
