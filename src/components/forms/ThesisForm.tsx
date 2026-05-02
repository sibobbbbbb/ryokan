'use client';

import { useState } from 'react';

interface ThesisFormProps {
  onSubmit: (thesis: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  ryokanPrompt?: string;
}

export function ThesisForm({
  onSubmit,
  isLoading,
  disabled = false,
  ryokanPrompt = 'Before I calculate your risk — tell me why you are taking this trade. One sentence. Make it count.',
}: ThesisFormProps) {
  const [thesis, setThesis] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (thesis.trim().length < 10) return;
    onSubmit(thesis.trim());
  }

  const charCount = thesis.trim().length;
  const isValid = charCount >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="p-4 border-l-2 text-sm italic"
        style={{
          borderColor: 'var(--accent-primary)',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-elevated)',
          fontFamily: 'IBM Plex Mono, monospace',
        }}
      >
        &ldquo;{ryokanPrompt}&rdquo;
      </div>

      <div>
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="e.g. Price broke above the 4H EMA21 with volume confirmation, retesting the previous resistance zone at 67,800 as support. EMAs are stacked bullish. Stop below the zone at 67,200."
          rows={5}
          required
          className="w-full px-3 py-2 text-sm border outline-none font-mono resize-none"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-elevated)',
            lineHeight: '1.6',
          }}
        />
        <div
          className="text-xs mt-1 text-right"
          style={{ color: isValid ? 'var(--text-muted)' : 'var(--accent-danger)' }}
        >
          {charCount < 10 ? `${10 - charCount} more characters required` : `${charCount} characters`}
        </div>
      </div>

      {disabled && (
        <div className="text-xs px-3 py-2 border" style={{ borderColor: 'var(--accent-warn)', color: 'var(--accent-warn)', backgroundColor: 'var(--bg-elevated)' }}>
          Select a stop level above before submitting your thesis.
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading || !isValid || disabled}
        className="w-full py-3 text-sm font-mono border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
      >
        {isLoading ? 'RYOKAN IS EVALUATING...' : 'SUBMIT THESIS FOR REVIEW →'}
      </button>
    </form>
  );
}
