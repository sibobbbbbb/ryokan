'use client';

import { useEffect, useRef, useState } from 'react';

interface RyokanSpeechProps {
  text: string;
  speed?: number;
}

export function RyokanSpeech({ text, speed = 30 }: RyokanSpeechProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset and retrigger on every text change
    setDisplayed('');
    setDone(false);

    if (!text) return;

    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current!);
        setDone(true);
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  // Auto-scroll to bottom as text streams
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayed]);

  return (
    <div
      ref={containerRef}
      className="min-h-[60px] max-h-[120px] overflow-y-auto px-4 py-3 border-l-2 text-sm"
      style={{
        borderColor: 'var(--accent-primary)',
        backgroundColor: 'var(--bg-elevated)',
        fontFamily: 'IBM Plex Mono, monospace',
        fontStyle: 'italic',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
      }}
    >
      <span className="not-italic font-semibold mr-2" style={{ color: 'var(--accent-primary)' }}>
        凌寒 鉄 —
      </span>
      {displayed}
      {!done && (
        <span
          className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        />
      )}
    </div>
  );
}
