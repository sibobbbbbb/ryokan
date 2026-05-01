import type { Candle, Timeframe } from '@/types/market';

const BASE_URL = process.env.BINANCE_BASE_URL ?? 'https://api.binance.com';

const INTERVAL_MAP: Record<Timeframe, string> = {
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

export async function fetchKlines(
  symbol: string,
  timeframe: Timeframe,
  limit = 200
): Promise<Candle[]> {
  const interval = INTERVAL_MAP[timeframe];
  const url = `${BASE_URL}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (res.status === 400) {
    const body = (await res.json()) as { msg?: string };
    throw new BinanceError(body.msg ?? 'Invalid symbol', 400);
  }
  if (res.status === 429) {
    throw new BinanceError('Binance rate limit exceeded', 429);
  }
  if (!res.ok) {
    throw new BinanceError(`Binance API error: ${res.status}`, res.status);
  }

  // Binance klines: array of arrays
  // [openTime,open,high,low,close,volume,closeTime,...]
  const raw = (await res.json()) as unknown[][];

  return raw.map((c) => ({
    openTime: c[0] as number,
    open: parseFloat(c[1] as string),
    high: parseFloat(c[2] as string),
    low: parseFloat(c[3] as string),
    close: parseFloat(c[4] as string),
    volume: parseFloat(c[5] as string),
    closeTime: c[6] as number,
  }));
}

export async function fetchCurrentPrice(symbol: string): Promise<number> {
  const url = `${BASE_URL}/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`;

  const res = await fetch(url, { next: { revalidate: 10 } });

  if (res.status === 400) {
    throw new BinanceError(`Symbol not found: ${symbol}`, 400);
  }
  if (!res.ok) {
    throw new BinanceError(`Binance API error: ${res.status}`, res.status);
  }

  const data = (await res.json()) as { price: string };
  return parseFloat(data.price);
}

export class BinanceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'BinanceError';
  }
}
