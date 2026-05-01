export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export type Timeframe = '1h' | '4h' | '1d';

export type EntryGrade = 'A' | 'B' | 'C' | 'D';

export type EMARegime = 'bullish' | 'bearish' | 'mixed';

export interface EMAResult {
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  regime: EMARegime;
}

export interface SRZone {
  priceLevel: number;
  type: 'support' | 'resistance';
  strength: 'high' | 'medium' | 'low';
  testCount: number;
  lastTestedAt: string;
  distanceFromEntry: number;
}

export interface MarketStructure {
  symbol: string;
  currentPrice: number;
  ema: EMAResult;
  entryGrade: EntryGrade;
  entryGradeReason: string;
  srZones: SRZone[];
  nearestSupport: SRZone | null;
  nearestResistance: SRZone | null;
  suggestedStop: number | null;
}
