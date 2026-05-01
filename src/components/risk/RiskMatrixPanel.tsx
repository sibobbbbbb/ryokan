'use client';

import { cn, formatPrice, formatPct } from '@/lib/utils';
import type { RiskTiersResponse, RiskOutput, RiskFlag } from '@/types/risk';

interface RiskMatrixPanelProps {
  data: RiskTiersResponse;
  entryPrice: number;
  direction: 'long' | 'short';
}

const FLAG_COLOR: Record<RiskFlag['type'], string> = {
  high_leverage: 'var(--accent-danger)',
  high_margin: 'var(--accent-danger)',
  low_rr: 'var(--accent-warn)',
  liq_near_stop: 'var(--accent-danger)',
};

export function RiskMatrixPanel({ data, entryPrice, direction }: RiskMatrixPanelProps) {
  const tiers = [
    { key: '1pct' as const, label: '1%', output: data.tiers['1pct'] },
    { key: '1.5pct' as const, label: '1.5%', output: data.tiers['1.5pct'] },
    { key: '2pct' as const, label: '2%', output: data.tiers['2pct'] },
  ];

  const allFlags = data.tiers['1pct'].flags;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
        RISK MATRIX
      </h3>

      {/* Risk Tier Comparison Table */}
      <div className="border" style={{ borderColor: 'var(--border)' }}>
        {/* Header */}
        <div
          className="grid grid-cols-4 text-xs px-3 py-2 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        >
          <span>METRIC</span>
          {tiers.map((t) => (
            <span key={t.key} className="text-center">{t.label} RISK</span>
          ))}
        </div>

        {/* Rows */}
        {(
          [
            { label: 'Dollar Risk', fn: (o: RiskOutput) => `$${formatPrice(o.dollarRisk)}`, grade: (o: RiskOutput) => o.riskGrade },
            { label: 'Position Size', fn: (o: RiskOutput) => `$${formatPrice(o.positionSizeUSDT)}`, grade: () => 'safe' as const },
            { label: 'Stop Distance', fn: (o: RiskOutput) => formatPct(o.stopDistancePct), grade: () => 'safe' as const },
            { label: 'Margin Required', fn: (o: RiskOutput) => `$${formatPrice(o.marginRequired)}`, grade: () => 'safe' as const },
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

      {/* Liquidation Price — always shown prominently */}
      <div
        className="flex items-center justify-between p-3 border"
        style={{ borderColor: 'var(--accent-danger)40', backgroundColor: 'var(--bg-card)' }}
      >
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>LIQUIDATION PRICE</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {direction === 'long' ? 'Position liquidated below this price' : 'Position liquidated above this price'}
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
