'use client';

import { useState, useRef } from 'react';
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

  const [manualStr, setManualStr] = useState('');
  const [manualActive, setManualActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const typeLabel = direction === 'long' ? 'support' : 'resistance';

  const matchesZone = selectedStop !== null &&
    validZones.some((z) => Math.abs(z.priceLevel - selectedStop) < 0.01);

  // Manual row is selected if the user clicked it, or if the current stop doesn't match any zone
  const isManualSelected = manualActive || (selectedStop !== null && !matchesZone);

  function handleZoneClick(price: number) {
    setManualActive(false);
    onSelect(price);
  }

  function handleManualRowClick() {
    setManualActive(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitManual() {
    const val = parseFloat(manualStr);
    if (val > 0) {
      onSelect(val);
      setManualActive(false);
    }
  }

  function handleManualKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitManual();
  }

  return (
    <div className="space-y-1.5">
      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        Select a {typeLabel} zone as your stop level:
      </div>

      {validZones.length === 0 && (
        <div
          className="px-3 py-2 border text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}
        >
          No structural {typeLabel} zones detected.
        </div>
      )}

      {validZones.map((zone, i) => {
        const isSelected = !isManualSelected &&
          selectedStop !== null &&
          Math.abs(zone.priceLevel - selectedStop) < 0.01;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleZoneClick(zone.priceLevel)}
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

      {/* Manual override — last option */}
      <button
        type="button"
        onClick={handleManualRowClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 border text-left transition-colors"
        style={{
          borderColor: isManualSelected ? 'var(--accent-warn)' : 'var(--border)',
          backgroundColor: isManualSelected ? 'rgba(251,191,36,0.06)' : 'var(--bg-card)',
        }}
      >
        <div
          className="w-3 h-3 rounded-full border flex-shrink-0"
          style={{
            borderColor: isManualSelected ? 'var(--accent-warn)' : 'var(--border)',
            backgroundColor: isManualSelected ? 'var(--accent-warn)' : 'transparent',
          }}
        />
        <span
          className="text-sm font-mono flex-shrink-0"
          style={{ color: isManualSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          MANUAL OVERRIDE
        </span>
        {isManualSelected && selectedStop !== null && !manualActive && (
          <span className="text-sm font-mono font-semibold ml-2" style={{ color: 'var(--accent-warn)' }}>
            ${formatPrice(selectedStop)}
          </span>
        )}
      </button>

      {isManualSelected && (
        <div
          className="px-3 py-2 border"
          style={{ borderColor: 'var(--accent-warn)40', backgroundColor: 'var(--bg-elevated)' }}
        >
          <input
            ref={inputRef}
            type="number"
            value={manualStr}
            onChange={(e) => setManualStr(e.target.value)}
            onBlur={commitManual}
            onKeyDown={handleManualKeyDown}
            placeholder="Enter stop price and press Enter..."
            step="any"
            className="w-full px-3 py-1.5 text-sm border outline-none font-mono"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
          />
        </div>
      )}
    </div>
  );
}
