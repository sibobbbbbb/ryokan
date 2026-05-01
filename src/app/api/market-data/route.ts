import { NextRequest, NextResponse } from 'next/server';
import { fetchKlines, fetchCurrentPrice, BinanceError } from '@/lib/binance';
import { calculateEMAs, gradeEntry } from '@/lib/indicators';
import { computeSRZones, findNearestZones } from '@/lib/srZones';
import type { MarketStructure, Timeframe } from '@/types/market';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const symbol = searchParams.get('symbol')?.toUpperCase();
  const timeframe = searchParams.get('timeframe') as Timeframe | null;
  const entryPriceParam = searchParams.get('entryPrice');
  const direction = searchParams.get('direction') as 'long' | 'short' | null;

  // Validate required params
  if (!symbol) {
    return NextResponse.json({ error: 'Missing required param: symbol' }, { status: 400 });
  }
  if (!timeframe || !['1h', '4h', '1d'].includes(timeframe)) {
    return NextResponse.json(
      { error: 'Invalid timeframe — must be 1h, 4h, or 1d' },
      { status: 400 }
    );
  }
  if (!direction || !['long', 'short'].includes(direction)) {
    return NextResponse.json(
      { error: 'Invalid direction — must be long or short' },
      { status: 400 }
    );
  }

  try {
    // Fetch candles and current price in parallel
    const [candles, currentPrice] = await Promise.all([
      fetchKlines(symbol, timeframe, 200),
      entryPriceParam
        ? Promise.resolve(parseFloat(entryPriceParam))
        : fetchCurrentPrice(symbol),
    ]);

    if (candles.length < 50) {
      return NextResponse.json(
        { error: `Insufficient candle data for ${symbol} — need at least 50 candles` },
        { status: 422 }
      );
    }

    const entryPrice = entryPriceParam ? parseFloat(entryPriceParam) : currentPrice;

    // Compute EMA structure
    const ema = calculateEMAs(candles);
    const { grade: entryGrade, reason: entryGradeReason } = gradeEntry(ema, direction, entryPrice);

    // Compute S/R zones
    const srZones = computeSRZones(candles, entryPrice);
    const { nearestSupport, nearestResistance, suggestedStop } = findNearestZones(
      srZones,
      direction
    );

    const result: MarketStructure = {
      symbol,
      currentPrice,
      ema,
      entryGrade,
      entryGradeReason,
      srZones,
      nearestSupport,
      nearestResistance,
      suggestedStop,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BinanceError) {
      if (error.statusCode === 400) {
        return NextResponse.json(
          { error: `Market data unavailable — check symbol "${symbol}" and try again` },
          { status: 400 }
        );
      }
      if (error.statusCode === 429) {
        return NextResponse.json(
          { error: 'Binance rate limit exceeded — please wait a moment and retry' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'Market data unavailable — Binance API error' },
        { status: 503 }
      );
    }

    console.error('[market-data]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
