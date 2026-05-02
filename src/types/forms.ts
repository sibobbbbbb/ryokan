import type { Timeframe } from '@/types/market';

export interface PositionFormData {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  accountSize: number;
  leverage: number;
  timeframe: Timeframe;
  targetPrice?: number;
}
