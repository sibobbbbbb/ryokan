'use client';

import { useEffect, useRef, useState } from 'react';
import type { IChartApi, Time } from 'lightweight-charts';
import type { Candle, SRZone, Timeframe } from '@/types/market';
import { cn } from '@/lib/utils';

interface EMAData {
  ema9: number[];
  ema21: number[];
  ema50: number[];
  ema200: number[];
}

interface CandlestickChartProps {
  candles: Candle[];
  emaData: EMAData;
  srZones: SRZone[];
  entryPrice?: number;
  suggestedStop?: number | null;
  timeframe: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1h', '4h', '1d'];

export function CandlestickChart({
  candles,
  emaData,
  srZones,
  entryPrice,
  suggestedStop,
  timeframe,
  onTimeframeChange,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    let chart: IChartApi;

    import('lightweight-charts').then((lc) => {
      if (!containerRef.current) return;

      chart = lc.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 320,
        layout: {
          background: { color: '#111118' },
          textColor: '#9898b0',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.08)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      candleSeries.setData(
        candles.map((c) => ({
          time: (Math.floor(c.openTime / 1000)) as unknown as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      // EMA line series
      const emaConfigs = [
        { values: emaData.ema9, color: 'rgba(255,255,255,0.4)', lineWidth: 1 as const, title: 'EMA9' },
        { values: emaData.ema21, color: '#f0a429', lineWidth: 1 as const, title: 'EMA21' },
        { values: emaData.ema50, color: '#fb923c', lineWidth: 2 as const, title: 'EMA50' },
        { values: emaData.ema200, color: '#ef4444', lineWidth: 2 as const, title: 'EMA200' },
      ];

      for (const ema of emaConfigs) {
        if (!ema.values.length) continue;
        const lineSeries = chart.addLineSeries({
          color: ema.color,
          lineWidth: ema.lineWidth,
          priceLineVisible: false,
          lastValueVisible: false,
          title: ema.title,
        });
        const offset = candles.length - ema.values.length;
        lineSeries.setData(
          ema.values.map((value, i) => ({
            time: (Math.floor(candles[offset + i].openTime / 1000)) as unknown as Time,
            value,
          }))
        );
      }

      // Entry price line
      if (entryPrice) {
        candleSeries.createPriceLine({
          price: entryPrice,
          color: '#7c6af7',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Entry',
        });
      }

      // Suggested stop line
      if (suggestedStop) {
        candleSeries.createPriceLine({
          price: suggestedStop,
          color: '#ef4444',
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
          title: 'Stop',
        });
      }

      // S/R zone lines (nearest 6 within 5%)
      const nearbyZones = srZones.filter((z) => z.distanceFromEntry <= 5).slice(0, 6);
      for (const zone of nearbyZones) {
        candleSeries.createPriceLine({
          price: zone.priceLevel,
          color: zone.type === 'support' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)',
          lineWidth: 1,
          lineStyle: 1,
          axisLabelVisible: false,
          title: '',
        });
      }

      chart.timeScale().fitContent();
      setReady(true);
    });

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.remove();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, emaData, srZones, entryPrice, suggestedStop]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
          CANDLESTICK CHART
        </span>
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange?.(tf)}
              className={cn(
                'px-2.5 py-1 text-xs border font-mono transition-colors',
                timeframe === tf
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'
              )}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="w-full border"
          style={{
            height: 320,
            borderColor: 'var(--border)',
            backgroundColor: '#111118',
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
        {!ready && candles.length > 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading chart...
          </div>
        )}
      </div>

      <div className="flex gap-4 text-xs flex-wrap">
        {[
          { label: 'EMA 9', color: 'rgba(255,255,255,0.5)' },
          { label: 'EMA 21', color: '#f0a429' },
          { label: 'EMA 50', color: '#fb923c' },
          { label: 'EMA 200', color: '#ef4444' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-4 h-px inline-block" style={{ backgroundColor: color }} />
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
