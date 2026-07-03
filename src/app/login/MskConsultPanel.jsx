// DESTINATION: src/app/login/MskConsultPanel.jsx
// New MSK-Consult chat panel, rendered inside the MSKHubModal 'consult' tab.
// Follows the LucidMSK architecture rule: new component -> own file, imported
// in page.js with one import line + minimal JSX wiring.

'use client';

import { useEffect, useRef, useState } from 'react';
import { DAILY_LIMIT_USD, meterColor, WARNING_THRESHOLD_PCT } from './mskConsultPrompt';

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (_e) {
    return 'UTC';
  }
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function MskConsultPanel({ currentUser }) {
  const [messages, setMessages] = useState([]); // { role, content } — session-only, clears on unmount/refresh
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState({ spent: 0, remaining: DAILY_LIMIT_USD, limit: DAILY_LIMIT_USD, pctUsed: 0, locked: false });
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [error, setError] = useState('');
  const conversationIdRef = useRef(uuid());
  const scrollRef = useRef(null);
  const timezone = useRef(getBrowserTimezone());

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUser?.access_token || ''}`,
  });

  // Load today's usage on mount so the meter (and lockout) is correct even
  // before the user sends a message in this session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/msk-consult?timezone=${encodeURIComponent(timezone.current)}`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setUsage({ spent: data.spent, remaining: data.remaining, limit: data.limit, pctUsed: data.pctUsed, locked: data.locked });
        }
      } catch (_e) {
        // Non-fatal — meter just shows defaults until the first send.
      } finally {
        if (!cancelled) setUsageLoaded(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (usage.locked || usage.remaining <= 0) {
      setError('Daily consultation limit reached. Resets at midnight.');
      return;
    }

    setError('');
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/msk-consult', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          message: text,
          history: messages, // full prior history, excluding the message just added server-side
          timezone: timezone.current,
          conversationId: conversationIdRef.current,
        }),
      });
      const data = await res.json();

      if (res.status === 403 && data?.error === 'LIMIT_REACHED') {
        setUsage({ spent: data.spent, remaining: data.remaining, limit: data.limit, pctUsed: data.pctUsed, locked: true });
        setError(data.message || 'Daily consultation limit reached. Resets at midnight.');
        setMessages(messages); // roll back — this turn never happened
        setSending(false);
        return;
      }
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        setMessages(messages); // roll back the optimistic user message
        setSending(false);
        return;
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
      setUsage({ spent: data.spent, remaining: data.remaining, limit: data.limit, pctUsed: data.pctUsed, locked: data.locked });
    } catch (_e) {
      setError('Network error. Please try again.');
      setMessages(messages);
    }
    setSending(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const pct = Math.min(100, usage.pctUsed || 0);
  const color = meterColor(pct);
  const locked = usage.locked || usage.remaining <= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '68vh', minHeight: 420 }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#90cdf4', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>💬 MSK-Consult</div>
        <div style={{ color: '#718096', fontSize: 12, marginBottom: 10 }}>
          Curbside AI consult — DDx, anatomy, protocol, artifacts, literature, and surgical planning terminology.
        </div>

        {/* Usage meter */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>
              {usageLoaded ? `$${usage.remaining.toFixed(2)} remaining` : 'Loading usage…'}
            </span>
            <span style={{ color: '#718096', fontSize: 11 }}>{pct.toFixed(0)}% used</span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.2s ease, background 0.2s ease' }} />
          </div>
          {pct >= WARNING_THRESHOLD_PCT && pct < 100 && (
            <div style={{ color: '#f6bd40', fontSize: 11, fontWeight: 600, marginTop: 6 }}>
              ⚠️ Approaching your daily consult limit.
            </div>
          )}
          {locked && (
            <div style={{ color: '#fc8181', fontSize: 11, fontWeight: 600, marginTop: 6 }}>
              🔒 Daily consultation limit reached. Resets at midnight.
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: '#0f172a', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#4a5568', padding: '40px 16px', fontSize: 13 }}>
            Ask an MSK radiology question to get started.
            <div style={{ fontSize: 11, marginTop: 6, color: '#374151' }}>
              This chat clears when you leave the tab — nothing is saved to your screen, but a copy is kept in your consult history.
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div
              style={{
                maxWidth: '82%',
                background: m.role === 'user' ? 'rgba(99,179,237,0.15)' : '#1a2332',
                border: '1px solid ' + (m.role === 'user' ? 'rgba(99,179,237,0.3)' : 'rgba(99,179,237,0.1)'),
                color: '#e2e8f0',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#1a2332', border: '1px solid rgba(99,179,237,0.1)', color: '#718096', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
              Thinking…
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#fc8181', fontSize: 12, marginBottom: 8 }}>{error}</div>
      )}

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={locked || sending}
          placeholder={locked ? 'Daily consultation limit reached. Resets at midnight.' : 'Ask a question…'}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            background: '#1a2332',
            border: '1px solid rgba(99,179,237,0.2)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 13,
            padding: '10px 12px',
            outline: 'none',
            fontFamily: 'inherit',
            opacity: locked ? 0.6 : 1,
          }}
        />
        <button
          onClick={send}
          disabled={locked || sending || !input.trim()}
          style={{
            padding: '0 18px',
            borderRadius: 8,
            border: '1px solid ' + (locked || sending || !input.trim() ? 'rgba(148,163,184,0.2)' : 'rgba(99,179,237,0.4)'),
            background: locked || sending || !input.trim() ? 'rgba(148,163,184,0.08)' : 'rgba(99,179,237,0.15)',
            color: locked || sending || !input.trim() ? '#4a5568' : '#90cdf4',
            fontSize: 13,
            fontWeight: 700,
            cursor: locked || sending || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
