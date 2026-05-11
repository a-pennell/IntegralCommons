'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '8px' }}
    >
      Print / Save as PDF
    </button>
  );
}
