'use client';

import { cn, formatPrice, formatPct } from '@/lib/utils';
import type { MarketStructure, SRZone } from '@/types/market';

interface MarketStructurePanelProps {
  data: MarketStructure;
}

const GRADE_COLOR: Record<string, string> = {
  A: 'var(--accent-safe)',
  B: '#60a5fa',
  C: 'var(--accent-warn)',
  D: 'var(--accent-danger)',
};

const REGIME_LABEL: Record<string, string> = {
  bullish: 'BULLISH',
  bearish: 'BEARISH',
  mixed: 'MIXED',
};

const REGIME_COLOR: Record<string, string> = {
  bullish: 'var(--accent-safe)',
  bearish: 'var(--accent-danger)',
  mixed: 'var(--accent-warn)',
};

export function MarketStructurePanel({ data }: MarketStructurePanelProps) {
  const { ema, entryGrade, entryGradeReason, srZones, nearestSupport, nearestResistance } = data;

  const nearbyZones = srZones.filter((z) => z.distanceFromEntry <= 5).slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
          MARKET STRUCTURE
        </h3>
        <span className="text-xs px-2 py-0.5 border" style={{ borderColor: REGIME_COLOR[ema.regime], color: REGIME_COLOR[ema.regime] }}>
          {REGIME_LABEL[ema.regime]}
        </span>
      </div>

      {/* Entry Grade */}
      <div className="p-3 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-3xl font-bold"
            style={{ color: GRADE_COLOR[entryGrade], fontFamily: 'DM Serif Display, serif' }}
          >
            {entryGrade}
          </span>
          <div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>ENTRY GRADE</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {entryGrade === 'A' && 'Strong structural alignment'}
              {entryGrade === 'B' && 'Partial alignment'}
              {entryGrade === 'C' && 'Mixed structure'}
              {entryGrade === 'D' && 'Counter-trend'}
            </div>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {entryGradeReason}
        </p>
      </div>

      {/* EMA Values */}
      <div>
        <div className="text-xs mb-2 tracking-widest" style={{ color: 'var(--text-muted)' }}>EMA LEVELS</div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { label: 'EMA 9', value: ema.ema9, color: 'rgba(255,255,255,0.5)' },
            { label: 'EMA 21', value: ema.ema21, color: 'var(--ema-21)' },
            { label: 'EMA 50', value: ema.ema50, color: 'var(--ema-50)' },
            { label: 'EMA 200', value: ema.ema200, color: 'var(--ema-200)' },
          ] as const).map(({ label, value, color }) => (
            <div
              key={label}
              className="flex justify-between items-center px-3 py-2 border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <span className="text-xs" style={{ color }}>
                {label}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                {formatPrice(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nearest S/R */}
      {(nearestSupport ?? nearestResistance) && (
        <div className="grid grid-cols-2 gap-2">
          {nearestSupport && (
            <ZoneCard zone={nearestSupport} label="NEAREST SUPPORT" />
          )}
          {nearestResistance && (
            <ZoneCard zone={nearestResistance} label="NEAREST RESISTANCE" />
          )}
        </div>
      )}

      {/* Zone List */}
      {nearbyZones.length > 0 && (
        <div>
          <div className="text-xs mb-2 tracking-widest" style={{ color: 'var(--text-muted)' }}>
            S/R ZONES WITHIN 5%
          </div>
          <div className="space-y-1">
            {nearbyZones.map((zone, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 border text-xs font-mono"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: zone.type === 'support' ? 'var(--accent-safe)' : 'var(--accent-danger)' }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>${formatPrice(zone.priceLevel)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {zone.type === 'support' ? 'S' : 'R'} · {zone.testCount}× tested
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>
                  {formatPct(zone.distanceFromEntry)} away
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function ZoneCard({ zone, label }: { zone: SRZone; label: string }) {
  const isSupport = zone.type === 'support';
  const color = isSupport ? 'var(--accent-safe)' : 'var(--accent-danger)';
  const strengthColor = { high: color, medium: 'var(--accent-warn)', low: 'var(--text-muted)' }[zone.strength];

  return (
    <div
      className="p-3 border"
      style={{ borderColor: color + '40', backgroundColor: 'var(--bg-card)' }}
    >
      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-sm font-mono font-semibold" style={{ color }}>
        ${formatPrice(zone.priceLevel)}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={cn('text-xs px-1.5 py-0.5 border')}
          style={{ borderColor: strengthColor, color: strengthColor }}
        >
          {zone.strength.toUpperCase()}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {zone.testCount}× tested · {formatPct(zone.distanceFromEntry)} away
        </span>
      </div>
    </div>
  );
}
