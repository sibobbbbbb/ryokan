'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { PositionFormData } from '@/types/forms';
import type { Timeframe } from '@/types/market';

const POPULAR_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];
const TIMEFRAMES: Timeframe[] = ['1h', '4h', '1d'];

interface PositionFormProps {
  onSubmit: (data: PositionFormData) => void;
  isLoading: boolean;
}

export function PositionForm({ onSubmit, isLoading }: PositionFormProps) {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [accountSize, setAccountSize] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [timeframe, setTimeframe] = useState<Timeframe>('4h');
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    setPriceLoading(true);
    fetch(`/api/market-data?symbol=${sym}&timeframe=${timeframe}&direction=${direction}`)
      .then((r) => r.json())
      .then((data: { currentPrice?: number }) => {
        if (data.currentPrice) setEntryPrice(data.currentPrice.toString());
      })
      .catch(() => {})
      .finally(() => setPriceLoading(false));
  }, [symbol, timeframe, direction]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry = parseFloat(entryPrice);
    const account = parseFloat(accountSize);
    if (!entry || !account || entry <= 0 || account <= 0) return;
    const target = parseFloat(targetPrice);
    onSubmit({
      symbol: symbol.trim().toUpperCase(),
      direction,
      entryPrice: entry,
      accountSize: account,
      leverage,
      timeframe,
      targetPrice: target > 0 ? target : undefined,
    });
  }

  const highLeverage = leverage > 20;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Symbol */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          SYMBOL
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {POPULAR_PAIRS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSymbol(p)}
              className={cn(
                'px-2.5 py-1 text-xs border transition-colors',
                symbol === p
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'
              )}
            >
              {p.replace('USDT', '')}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="BTCUSDT"
          className="w-full px-3 py-2 text-sm border outline-none font-mono"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}
        />
      </div>

      {/* Direction */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          DIRECTION
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['long', 'short'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={cn(
                'py-2.5 text-sm font-mono border transition-colors',
                direction === d
                  ? d === 'long'
                    ? 'bg-[var(--accent-safe)] border-[var(--accent-safe)] text-black'
                    : 'bg-[var(--accent-danger)] border-[var(--accent-danger)] text-white'
                  : 'border-[var(--border)] text-[var(--text-secondary)]'
              )}
            >
              {d.toUpperCase()} {d === 'long' ? '↑' : '↓'}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Price + Account Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            ENTRY PRICE {priceLoading && <span style={{ color: 'var(--accent-primary)' }}>●</span>}
          </label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="0.00"
            step="any"
            required
            className="w-full px-3 py-2 text-sm border outline-none font-mono"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            ACCOUNT (USDT)
          </label>
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            placeholder="1000"
            step="any"
            required
            className="w-full px-3 py-2 text-sm border outline-none font-mono"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}
          />
        </div>
      </div>

      {/* Take Profit Target */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          TAKE PROFIT TARGET{' '}
          <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>(OPTIONAL)</span>
        </label>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Target price for R:R calculation"
          step="any"
          className="w-full px-3 py-2 text-sm border outline-none font-mono"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}
        />
      </div>

      {/* Leverage */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          LEVERAGE —{' '}
          <span className="font-semibold" style={{ color: highLeverage ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
            {leverage}×
          </span>
          {highLeverage && (
            <span className="ml-2 text-xs" style={{ color: 'var(--accent-danger)' }}>⚠ HIGH RISK</span>
          )}
        </label>
        <input
          type="range"
          min={1}
          max={125}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          <span>1×</span><span>20×</span><span>50×</span><span>125×</span>
        </div>
      </div>

      {/* Timeframe */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          TIMEFRAME
        </label>
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={cn(
                'flex-1 py-2 text-xs border transition-colors font-mono',
                timeframe === tf
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              )}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !entryPrice || !accountSize}
        className="w-full py-3 text-sm font-mono border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
      >
        {isLoading ? 'ANALYZING MARKET STRUCTURE...' : 'ANALYZE MARKET STRUCTURE →'}
      </button>
    </form>
  );
}
