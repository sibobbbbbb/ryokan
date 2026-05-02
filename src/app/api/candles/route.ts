import { NextRequest, NextResponse } from 'next/server';
import { fetchKlines, BinanceError } from '@/lib/binance';
import { calculateEMAArrays } from '@/lib/indicators';
import type { Timeframe } from '@/types/market';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const timeframe = searchParams.get('timeframe') as Timeframe | null;

  if (!symbol) return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  if (!timeframe || !['1h', '4h', '1d'].includes(timeframe)) {
    return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 });
  }

  try {
    const candles = await fetchKlines(symbol, timeframe, 200);
    const emaArrays = calculateEMAArrays(candles);
    return NextResponse.json({ candles, emaArrays }, { status: 200 });
  } catch (error) {
    if (error instanceof BinanceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[candles]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
