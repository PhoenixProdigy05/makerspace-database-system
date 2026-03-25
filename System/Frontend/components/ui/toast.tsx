'use client';

import React, { useEffect, useState } from 'react';

type ToastItem = {
  id: number;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
  duration?: number;
};

let listeners: ((t: ToastItem) => void)[] = [];
let counter = 1;

export function toast(t: Omit<ToastItem, 'id'>) {
  const item: ToastItem = { id: counter++, duration: 3000, variant: 'default', ...t };
  listeners.forEach((cb) => cb(item));
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setToasts((prev) => [...prev, t]);
      const dur = t.duration ?? 3000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, dur);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            'min-w-[260px] rounded-md border p-3 shadow-md bg-card text-card-foreground ' +
            (t.variant === 'destructive'
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : t.variant === 'success'
              ? 'border-green-600/40 bg-green-600/10 text-green-700'
              : 'border-border')
          }
        >
          {t.title && <div className="font-medium">{t.title}</div>}
          {t.description && (
            <div className="text-sm text-muted-foreground">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
