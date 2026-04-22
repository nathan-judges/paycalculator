'use client';

import { useEffect } from 'react';

type ToastVariant = 'neutral' | 'success' | 'error';

export function Toast({
  message,
  onDismiss,
  variant = 'neutral',
  durationMs = 5000,
}: {
  message: string;
  onDismiss: () => void;
  variant?: ToastVariant;
  durationMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onDismiss]);

  const bg =
    variant === 'success'
      ? '#047857'
      : variant === 'error'
        ? '#b91c1c'
        : '#1a1a2e';

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        fontSize: '0.875rem',
        maxWidth: '90vw',
        textAlign: 'center',
        animation: 'toast-in 0.3s ease-out',
      }}
    >
      {message}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(1rem); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

