'use client';

import { useState } from 'react';
import { cn, formatPrice, formatPct } from '@/lib/utils';
import type { RiskTiersResponse, RiskOutput, RiskFlag } from '@/types/risk';

interface RiskMatrixPanelProps {
  data: RiskTiersResponse;
  entryPrice: number;
  direction: 'long' | 'short';
  leverage: number;
  accountSize: number;
}

const FLAG_COLOR: Record<RiskFlag['type'], string> = {
  high_leverage: 'var(--accent-danger)',
  high_margin: 'var(--accent-danger)',
  low_rr: 'var(--accent-warn)',
  liq_near_stop: 'var(--accent-danger)',
};

function calcLiqPrice(entry: number, lev: number, dir: 'long' | 'short') {
  return dir === 'long'
    ? entry * (1 - 1 / lev + 0.005)
    : entry * (1 + 1 / lev - 0.005);
}

export function RiskMatrixPanel({ data, entryPrice, direction, leverage, accountSize }: RiskMatrixPanelProps) {
  const [sensLeverage, setSensLeverage] = useState(leverage);

  const tiers = [
    { key: '1pct' as const, label: '1%', output: data.tiers['1pct'] },
    { key: '1.5pct' as const, label: '1.5%', output: data.tiers['1.5pct'] },
    { key: '2pct' as const, label: '2%', output: data.tiers['2pct'] },
  ];

  const allFlags = data.tiers['1pct'].flags;
  const basePosSize = data.tiers['1pct'].positionSizeUSDT;

  const sensLiqPrice = calcLiqPrice(entryPrice, sensLeverage, direction);
  const sensMarginReq = basePosSize / sensLeverage;
  const sensMarginUtil = (sensMarginReq / accountSize) * 100;
  const sensLiqDist = Math.abs(sensLiqPrice - entryPrice) / entryPrice * 100;
  const sensLiqDanger = sensLiqDist < 5;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
        RISK MATRIX
      </h3>

      {/* Risk Tier Comparison Table — scrollable on mobile */}
      <div className="border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        <div style={{ minWidth: 320 }}>
          <div
            className="grid grid-cols-4 text-xs px-3 py-2 border-b"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            <span>METRIC</span>
            {tiers.map((t) => (
              <span key={t.key} className="text-center">{t.label} RISK</span>
            ))}
          </div>

          {(
            [
              { label: 'Dollar Risk', fn: (o: RiskOutput) => `$${formatPrice(o.dollarRisk)}`, grade: (o: RiskOutput) => o.riskGrade },
              { label: 'Position Size', fn: (o: RiskOutput) => `$${formatPrice(o.positionSizeUSDT)}`, grade: () => 'safe' as const },
              { label: 'Stop Distance', fn: (o: RiskOutput) => formatPct(o.stopDistancePct), grade: () => 'safe' as const },
              { label: 'Margin Req.', fn: (o: RiskOutput) => `$${formatPrice(o.marginRequired)}`, grade: () => 'safe' as const },
              { label: 'Margin Util.', fn: (o: RiskOutput) => formatPct(o.marginUtilization), grade: (o: RiskOutput) => o.marginUtilization >= 40 ? 'danger' : o.marginUtilization >= 20 ? 'caution' : 'safe' },
              { label: 'R:R Ratio', fn: (o: RiskOutput) => o.rrRatio !== null ? `${o.rrRatio.toFixed(2)}:1` : '—', grade: (o: RiskOutput) => o.rrRatio === null ? 'safe' : o.rrRatio >= 2 ? 'safe' : o.rrRatio >= 1.5 ? 'caution' : 'danger' },
            ] as const
          ).map(({ label, fn, grade }) => (
            <div
              key={label}
              className="grid grid-cols-4 text-xs px-3 py-2 border-b last:border-b-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              {tiers.map((t) => {
                const g = grade(t.output);
                const color = g === 'danger' ? 'var(--accent-danger)' : g === 'caution' ? 'var(--accent-warn)' : 'var(--text-primary)';
                return (
                  <span key={t.key} className="text-center font-mono" style={{ color }}>
                    {fn(t.output)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Liquidation Price */}
      <div
        className="flex items-center justify-between p-3 border"
        style={{ borderColor: 'var(--accent-danger)40', backgroundColor: 'var(--bg-card)' }}
      >
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>LIQUIDATION PRICE</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {direction === 'long' ? 'Liquidated below this price' : 'Liquidated above this price'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-bold" style={{ color: 'var(--accent-danger)' }}>
            ${formatPrice(data.tiers['1pct'].liquidationPrice)}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatPct(Math.abs(data.tiers['1pct'].liquidationPrice - entryPrice) / entryPrice * 100)} from entry
          </div>
        </div>
      </div>

      {/* Leverage Sensitivity Slider */}
      <div className="border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
            LEVERAGE SENSITIVITY
          </span>
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 border"
            style={{
              borderColor: sensLeverage > 20 ? 'var(--accent-danger)' : 'var(--border)',
              color: sensLeverage > 20 ? 'var(--accent-danger)' : 'var(--accent-primary)',
            }}
          >
            {sensLeverage}×
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={125}
          value={sensLeverage}
          onChange={(e) => setSensLeverage(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: sensLeverage > 20 ? 'var(--accent-danger)' : 'var(--accent-primary)' }}
        />
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>1×</span><span>25×</span><span>50×</span><span>100×</span><span>125×</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2 border text-center" style={{ borderColor: sensLiqDanger ? 'var(--accent-danger)40' : 'var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>LIQ. PRICE</div>
            <div
              className="text-xs font-mono font-bold mt-0.5"
              style={{ color: sensLiqDanger ? 'var(--accent-danger)' : 'var(--text-primary)' }}
            >
              ${formatPrice(sensLiqPrice)}
            </div>
          </div>
          <div className="p-2 border text-center" style={{ borderColor: 'var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>MARGIN REQ.</div>
            <div className="text-xs font-mono font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              ${formatPrice(sensMarginReq)}
            </div>
          </div>
          <div className="p-2 border text-center" style={{ borderColor: sensMarginUtil >= 40 ? 'var(--accent-danger)40' : 'var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>MARGIN UTIL.</div>
            <div
              className="text-xs font-mono font-bold mt-0.5"
              style={{ color: sensMarginUtil >= 40 ? 'var(--accent-danger)' : sensMarginUtil >= 20 ? 'var(--accent-warn)' : 'var(--text-primary)' }}
            >
              {formatPct(sensMarginUtil)}
            </div>
          </div>
        </div>

        {sensLiqDanger && (
          <div
            className="text-xs px-3 py-2 border"
            style={{ borderColor: 'var(--accent-danger)60', color: 'var(--accent-danger)', backgroundColor: 'var(--accent-danger)10' }}
          >
            ⚠ Liquidation within 5% of entry at {sensLeverage}× leverage.
          </div>
        )}
      </div>

      {/* Risk Flags */}
      {allFlags.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>RISK FLAGS</div>
          {allFlags.map((flag, i) => (
            <div
              key={i}
              className={cn('flex items-start gap-2 p-3 border text-xs')}
              style={{
                borderColor: FLAG_COLOR[flag.type] + '60',
                backgroundColor: FLAG_COLOR[flag.type] + '10',
                color: FLAG_COLOR[flag.type],
              }}
            >
              <span className="mt-0.5">⚠</span>
              <span>{flag.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
