'use client';
// CopyButton.js — Col 2 report-ready status indicator.
//
// The actual clipboard copy now happens automatically the instant a report
// finishes generating or is locked after editing (see clipboardUtils.js ->
// autoCopyReport, called from page.js). This component reflects whether
// that copy succeeded:
//   - copyStatus === 'copied' -> green "Ready to paste" confirmation
//   - copyStatus === 'failed' -> amber fallback button the user can click,
//     which is a fresh user gesture so the browser will always allow it
//   - anything else (null, 'pending') -> renders nothing
//
// formatForPSOne stays exported here because clipboardUtils.js imports it
// to build the auto-copied text (kept in this file to avoid duplicating
// the PS One formatting rules in two places).
//
// USAGE IN page.js:
//   <CopyButton generatedReport={generatedReport} dm={dm}
//     copyStatus={clipboardStatus} onRetryCopy={handleManualCopy} />

// PS One: clean structured text
// - Section headers stay in ALL CAPS with colon
// - Subheadings stay as "Structure: finding"
// - Strips any residual markdown
// - Adds standard PS One line spacing
export function formatForPSOne(reportText) {
  if (!reportText) return '';

  return reportText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\bunremarkable\b/gi, 'intact')
    .replace(/^(TECHNIQUE|FINDINGS|IMPRESSION|LEVELS):/gm, '\n$1:')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function formatPlainText(reportText) {
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

export default function CopyButton({ generatedReport, dm, copyStatus, onRetryCopy }) {
  if (!generatedReport?.trim()) return null;

  if (copyStatus === 'failed') {
    return (
      <button onClick={onRetryCopy} style={{
        display: 'block',
        margin: '10px auto 0',
        fontSize: 13,
        fontWeight: 700,
        color: dm ? '#fbbf24' : '#b45309',
        background: dm ? 'rgba(251,191,36,0.1)' : '#fffbeb',
        border: '1px solid ' + (dm ? 'rgba(251,191,36,0.4)' : '#fde68a'),
        borderRadius: 8,
        padding: '8px 16px',
        cursor: 'pointer',
        letterSpacing: '0.01em',
      }}>
        ⚠ Auto-copy failed — click to copy now
      </button>
    );
  }

  if (copyStatus !== 'copied') return null;

  return (
    <p style={{
      fontSize: 13,
      fontWeight: 700,
      color: dm ? '#4ade80' : '#16a34a',
      margin: 0,
      textAlign: 'center',
      padding: '10px 0',
      letterSpacing: '0.01em',
    }}>
      ✓ Ready to paste directly into your reporting software
    </p>
  );
}

