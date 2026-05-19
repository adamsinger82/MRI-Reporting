'use client';
 
export default function DashboardPage() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      padding: '16px',
      minHeight: '100vh',
      background: '#0f172a',
    }}>
      <div style={{ background: '#3b82f6', borderRadius: '12px', padding: '24px', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
        Column 1 — Input
      </div>
      <div style={{ background: '#7c3aed', borderRadius: '12px', padding: '24px', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
        Column 2 — Report
      </div>
      <div style={{ background: '#0891b2', borderRadius: '12px', padding: '24px', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
        Column 3 — Reference
      </div>
    </div>
  );
}
 
