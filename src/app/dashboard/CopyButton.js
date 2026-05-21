// CopyButton.js — Drop-in replacement for the copy button section in page.js
// Supports PS One, Dragon Medical, Fluency, and plain text output formats
//
// USAGE IN page.js:
// 1. Import this component at the top of page.js:
//    import CopyButton from './CopyButton';  (if same folder)
//    OR just paste the component directly into page.js
//
// 2. Replace the existing copy button in Col 2 — Report with:
//    <CopyButton generatedReport={generatedReport} />
//
// 3. Remove the old copySuccess state and copyToClipboard function
//    (this component manages its own copy state internally)

import { useState } from 'react';

// ─── FORMAT DEFINITIONS ──────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'psone',
    label: 'PS One',
    icon: '🎙️',
    description: 'PowerScribe One AutoText format',
    transform: formatForPSOne,
  },
  {
    id: 'dragon',
    label: 'Dragon',
    icon: '🐉',
    description: 'Dragon Medical One',
    transform: formatPlainText,
  },
  {
    id: 'fluency',
    label: 'Fluency',
    icon: '🔊',
    description: 'Solventum Fluency for Imaging',
    transform: formatPlainText,
  },
  {
    id: 'plain',
    label: 'Plain Text',
    icon: '📄',
    description: 'Universal — works anywhere',
    transform: formatPlainText,
  },
];

// ─── FORMAT TRANSFORMERS ─────────────────────────────────────────────────────

// PS One: clean structured text
// - Section headers stay in ALL CAPS with colon
// - Subheadings stay as "Structure: finding"
// - Strips any residual markdown
// - Adds standard PS One line spacing
function formatForPSOne(reportText) {
  if (!reportText) return '';

  return reportText
    // Strip any markdown bold/italic that might slip through
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Strip markdown dashes used as bullets
    .replace(/^\s*[-•]\s+/gm, '')
    // Strip horizontal rules
    .replace(/^---+$/gm, '')
    // Replace "unremarkable" with "intact" (your existing rule)
    .replace(/\bunremarkable\b/gi, 'intact')
    // Ensure section headers have blank line before them
    .replace(/^(TECHNIQUE|FINDINGS|IMPRESSION|LEVELS):/gm, '\n$1:')
    // Normalize multiple blank lines to single
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
}

// Plain text: same as PS One but minimal spacing tweaks
// Dragon and Fluency both handle plain structured text well
function formatPlainText(reportText) {
  if (!reportText) return '';

  return reportText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\bunremarkable\b/gi, 'intact')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function CopyButton({ generatedReport }) {
  const [selectedPlatform, setSelectedPlatform] = useState('psone');
  const [copySuccess, setCopySuccess] = useState(false);

  const platform = PLATFORMS.find(p => p.id === selectedPlatform);

  const handleCopy = async () => {
    if (!generatedReport || !platform) return;

    const formatted = platform.transform(generatedReport);

    try {
      await navigator.clipboard.writeText(formatted);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      // Fallback for browsers that block clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = formatted;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const disabled = !generatedReport;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Platform selector tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: '#f1f5f9',
        borderRadius: 10,
        padding: 4,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}>
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            title={p.description}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: selectedPlatform === p.id ? 700 : 500,
              background: selectedPlatform === p.id ? 'white' : 'transparent',
              color: selectedPlatform === p.id ? '#1e293b' : '#94a3b8',
              boxShadow: selectedPlatform === p.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        disabled={disabled}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 9,
          border: '1.5px solid ' + (copySuccess ? '#86efac' : disabled ? '#e2e8f0' : '#e2e8f0'),
          background: copySuccess ? '#f0fdf4' : disabled ? '#f8fafc' : 'white',
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: copySuccess ? '#16a34a' : disabled ? '#cbd5e1' : '#475569',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
        {copySuccess
          ? <><span>✓</span> Copied for {platform?.label}</>
          : <><span>📋</span> Copy for {platform?.label}</>
        }
      </button>

      {/* Helper text */}
      {!disabled && (
        <p style={{
          fontSize: 10,
          color: '#94a3b8',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {platform?.description} — paste directly into your reporting software
        </p>
      )}

    </div>
  );
}
