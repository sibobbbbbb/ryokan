import { NextRequest, NextResponse } from 'next/server';
import { calculateRisk } from '@/lib/riskCalculator';
import type { RiskMatrixRequest, RiskOutput } from '@/types/risk';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const data = body as Partial<RiskMatrixRequest>;

  // Validate required fields
  const missing = (
    ['entryPrice', 'stopPrice', 'accountSize', 'leverage', 'direction'] as const
  ).filter((k) => data[k] === undefined || data[k] === null);

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  const { entryPrice, stopPrice, accountSize, leverage, direction, targetPrice } =
    data as RiskMatrixRequest;

  if (!['long', 'short'].includes(direction)) {
    return NextResponse.json(
      { error: 'direction must be "long" or "short"' },
      { status: 400 }
    );
  }
  if (leverage < 1 || leverage > 125) {
    return NextResponse.json(
      { error: 'leverage must be between 1 and 125' },
      { status: 400 }
    );
  }
  if (entryPrice <= 0 || stopPrice <= 0 || accountSize <= 0) {
    return NextResponse.json(
      { error: 'entryPrice, stopPrice, and accountSize must be positive' },
      { status: 400 }
    );
  }

  // Calculate for 1%, 1.5%, 2% risk tiers simultaneously
  const tiers = [1, 1.5, 2] as const;
  const results: Record<string, RiskOutput> = {};

  for (const riskPercent of tiers) {
    results[`${riskPercent}pct`] = calculateRisk({
      entryPrice,
      stopPrice,
      accountSize,
      leverage,
      direction,
      riskPercent,
      targetPrice,
    });
  }

  return NextResponse.json(
    {
      tiers: results,
      // Convenience: default 1% tier for quick reads
      default: results['1pct'],
    },
    { status: 200 }
  );
}
