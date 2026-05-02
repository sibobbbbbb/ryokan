'use client';

import { formatPrice, formatPct } from '@/lib/utils';
import type { SRZone } from '@/types/market';

interface StopSelectorProps {
  zones: SRZone[];
  direction: 'long' | 'short';
  selectedStop: number | null;
  onSelect: (price: number) => void;
}

const STRENGTH_COLOR: Record<SRZone['strength'], string> = {
  high: 'var(--accent-safe)',
  medium: 'var(--accent-warn)',
  low: 'var(--text-muted)',
};

export function StopSelector({ zones, direction, selectedStop, onSelect }: StopSelectorProps) {
  const validZones = direction === 'long'
    ? zones.filter((z) => z.type === 'support')
    : zones.filter((z) => z.type === 'resistance');

  const typeLabel = direction === 'long' ? 'support' : 'resistance';

  if (validZones.length === 0) {
    return (
      <div
        className="px-3 py-3 border text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}
      >
        No structural {typeLabel} zones detected — stop set to ±2% fallback.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        Select a {typeLabel} zone as your stop level:
      </div>
      {validZones.map((zone, i) => {
        const isSelected = selectedStop !== null && Math.abs(zone.priceLevel - selectedStop) < 0.01;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(zone.priceLevel)}
            className="w-full flex items-center gap-3 px-3 py-2.5 border text-left transition-colors"
            style={{
              borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border)',
              backgroundColor: isSelected ? 'rgba(124,106,247,0.08)' : 'var(--bg-card)',
            }}
          >
            <div
              className="w-3 h-3 rounded-full border flex-shrink-0"
              style={{
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border)',
                backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
              }}
            />
            <span
              className="text-sm font-mono font-semibold flex-shrink-0 w-28"
              style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              ${formatPrice(zone.priceLevel)}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 border flex-shrink-0"
              style={{ borderColor: STRENGTH_COLOR[zone.strength], color: STRENGTH_COLOR[zone.strength] }}
            >
              {zone.strength.toUpperCase()}
            </span>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {zone.testCount}× tested
            </span>
            <span className="text-xs ml-auto flex-shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>
              {formatPct(zone.distanceFromEntry)} away
            </span>
          </button>
        );
      })}
    </div>
  );
}
