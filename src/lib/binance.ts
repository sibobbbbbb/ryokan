import type { Candle, Timeframe } from '@/types/market';

const BINANCE_BASES = [
  process.env.BINANCE_BASE_URL ?? 'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
  'https://api4.binance.com',
];

const INTERVAL_MAP: Record<Timeframe, string> = {
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

async function fetchWithFallback(path: string, cacheSeconds = 60): Promise<Response> {
  let lastErr: unknown = null;
  for (const base of BINANCE_BASES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${base}${path}`, {
        signal: controller.signal,
        next: { revalidate: cacheSeconds },
      });
      clearTimeout(timer);
      if (res.status === 403 || res.status === 451) continue;
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
    }
  }
  throw new BinanceError(
    `All Binance endpoints unreachable: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`,
    503
  );
}

export async function fetchKlines(
  symbol: string,
  timeframe: Timeframe,
  limit = 200
): Promise<Candle[]> {
  const interval = INTERVAL_MAP[timeframe];
  const path = `/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;

  const res = await fetchWithFallback(path, 60);

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
  const path = `/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`;

  const res = await fetchWithFallback(path, 10);

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
