'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ThesisEvalResult } from '@/types/ryokan';

interface RyokanVerdictCardProps {
  result: ThesisEvalResult;
  positionInfo?: { symbol: string; direction: string; entryPrice: number };
}

type VerdictDisplay = {
  label: string;
  sublabel: string;
  color: string;
  rotate: string;
};

function getVerdict(result: ThesisEvalResult): VerdictDisplay {
  if (result.riskFlag === 'reject') {
    return { label: 'THESIS REJECTED', sublabel: 'Revise before proceeding.', color: 'var(--accent-danger)', rotate: '-4deg' };
  }
  if (result.thesisScore >= 7) {
    return { label: 'STRUCTURALLY SOUND', sublabel: 'Proceed with discipline.', color: 'var(--accent-safe)', rotate: '-3deg' };
  }
  return { label: 'PROCEED WITH CAUTION', sublabel: 'Elevated risk acknowledged.', color: 'var(--accent-warn)', rotate: '-3deg' };
}

export function RyokanVerdictCard({ result, positionInfo }: RyokanVerdictCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const verdict = getVerdict(result);
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleDownloadPNG = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#16161f',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `ryokan-verdict-${positionInfo?.symbol ?? 'trade'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // PNG export is non-critical — fail silently
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Captured area */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative border p-6 space-y-4"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {/* Document header */}
        <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="text-xs tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              RYOKAN RISK ASSESSMENT REPORT
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {positionInfo ? `${positionInfo.symbol} · ${positionInfo.direction.toUpperCase()} · $${positionInfo.entryPrice.toLocaleString()}` : '—'}
            </div>
          </div>
          <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
            <div>DATE: {now}</div>
            <div>ANALYST: 凌寒 鉄</div>
          </div>
        </div>

        {/* Stamp */}
        <div className="flex justify-center py-2">
          <motion.div
            initial={{ opacity: 0, scale: 1.3, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: verdict.rotate }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="px-6 py-3 border-4 text-center"
            style={{ borderColor: verdict.color, color: verdict.color, opacity: 0.92 }}
          >
            <div className="text-xl font-bold tracking-widest" style={{ fontFamily: 'DM Serif Display, serif', letterSpacing: '0.15em' }}>
              {verdict.label}
            </div>
            <div className="text-xs mt-1 tracking-widest">{verdict.sublabel}</div>
          </motion.div>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>THESIS SCORE</span>
          <div className="flex-1 h-1.5" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(result.thesisScore / 10) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-full"
              style={{ backgroundColor: verdict.color }}
            />
          </div>
          <span className="text-sm font-bold font-mono" style={{ color: verdict.color }}>
            {result.thesisScore}/10
          </span>
        </div>

        {/* Ryokan statement */}
        <div className="p-3 border-l-2 text-sm italic" style={{ borderColor: verdict.color, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          &ldquo;{result.ryokanStatement}&rdquo;
        </div>

        {/* What would change */}
        <div>
          <div className="text-xs mb-2 tracking-widest" style={{ color: 'var(--text-muted)' }}>WHAT WOULD CHANGE THIS ASSESSMENT</div>
          <div className="text-xs p-3 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {result.whatWouldChangeAssessment}
          </div>
        </div>
      </motion.div>

      {/* Share button — outside the captured area */}
      <button
        onClick={handleDownloadPNG}
        disabled={exporting}
        className="w-full text-xs border py-2.5 transition-colors disabled:opacity-50 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'transparent', fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {exporting ? 'GENERATING PNG...' : '↓ DOWNLOAD VERDICT AS PNG'}
      </button>
    </div>
  );
}
