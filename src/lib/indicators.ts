import { EMA } from 'technicalindicators';
import type { Candle, EMAResult, EntryGrade, EMARegime } from '@/types/market';

export function calculateEMAs(candles: Candle[]): EMAResult {
  const closes = candles.map((c) => c.close);

  const last = (arr: number[]) => arr[arr.length - 1];

  // technicalindicators returns array of length (closes.length - period + 1)
  const ema9 = last(EMA.calculate({ period: 9, values: closes }));
  const ema21 = last(EMA.calculate({ period: 21, values: closes }));
  const ema50 = last(EMA.calculate({ period: 50, values: closes }));
  const ema200 = last(EMA.calculate({ period: 200, values: closes }));

  const currentPrice = closes[closes.length - 1];

  let regime: EMARegime;
  if (currentPrice > ema200 && ema21 > ema50 && ema50 > ema200) {
    regime = 'bullish';
  } else if (currentPrice < ema200 && ema21 < ema50 && ema50 < ema200) {
    regime = 'bearish';
  } else {
    regime = 'mixed';
  }

  return { ema9, ema21, ema50, ema200, regime };
}

interface GradeResult {
  grade: EntryGrade;
  reason: string;
}

export function gradeEntry(
  ema: EMAResult,
  direction: 'long' | 'short',
  entryPrice: number
): GradeResult {
  const { ema21, ema50, ema200 } = ema;

  const fullBullStack = ema21 > ema50 && ema50 > ema200;
  const fullBearStack = ema21 < ema50 && ema50 < ema200;
  const partialBullStack = ema21 > ema50 || ema50 > ema200;
  const partialBearStack = ema21 < ema50 || ema50 < ema200;

  const nearEMA21 = Math.abs(entryPrice - ema21) / ema21 <= 0.005;
  const nearEMA50 = Math.abs(entryPrice - ema50) / ema50 <= 0.01;

  if (direction === 'long') {
    if (entryPrice > ema21 && fullBullStack) {
      return {
        grade: 'A',
        reason: `Strong bullish structure. Entry above EMA21 (${fmt(ema21)}) with full EMA stack alignment (21>50>200). High-probability trend continuation.`,
      };
    }
    if (entryPrice > ema21 && partialBullStack) {
      return {
        grade: 'B',
        reason: `Entry above EMA21 (${fmt(ema21)}) with partial EMA alignment. EMAs not fully stacked — proceed with awareness of chop risk.`,
      };
    }
    if (nearEMA21 && partialBullStack) {
      return {
        grade: 'B',
        reason: `Entry near EMA21 (${fmt(ema21)}) in partially aligned bull structure. Watch for rejection at EMA21 as dynamic resistance.`,
      };
    }
    if (nearEMA50 || (entryPrice > ema50 && entryPrice < ema21)) {
      return {
        grade: 'C',
        reason: `Entry near EMA50 (${fmt(ema50)}) with mixed EMA structure. Elevated risk — EMA50 often acts as contested zone. Counter-trend possible.`,
      };
    }
    return {
      grade: 'D',
      reason: `Entry below EMA21 (${fmt(ema21)}) in ${ema.regime} structure. Counter-trend long. EMA stack does not support this direction — structural headwinds.`,
    };
  }

  // short
  if (entryPrice < ema21 && fullBearStack) {
    return {
      grade: 'A',
      reason: `Strong bearish structure. Entry below EMA21 (${fmt(ema21)}) with full EMA stack inversion (21<50<200). High-probability downtrend continuation.`,
    };
  }
  if (entryPrice < ema21 && partialBearStack) {
    return {
      grade: 'B',
      reason: `Entry below EMA21 (${fmt(ema21)}) with partial bear stack. EMAs not fully inverted — manage size for mixed structure.`,
    };
  }
  if (nearEMA21 && partialBearStack) {
    return {
      grade: 'B',
      reason: `Entry near EMA21 (${fmt(ema21)}) in partially inverted structure. EMA21 as dynamic resistance — watch for failure to reclaim.`,
    };
  }
  if (nearEMA50 || (entryPrice < ema50 && entryPrice > ema21)) {
    return {
      grade: 'C',
      reason: `Entry near EMA50 (${fmt(ema50)}) in mixed structure. High-risk zone — EMA50 contested. Confirm with price action before entry.`,
    };
  }
  return {
    grade: 'D',
    reason: `Entry above EMA21 (${fmt(ema21)}) in ${ema.regime} structure. Counter-trend short. EMA stack does not support this direction.`,
  };
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
