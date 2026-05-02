import type { Candle, SRZone } from '@/types/market';

interface SwingPoint {
  price: number;
  openTime: number;
}

interface Cluster {
  prices: number[];
  openTimes: number[];
}

function identifySwingPoints(candles: Candle[]): SwingPoint[] {
  const swings: SwingPoint[] = [];
  // Need at least 2 candles on each side → valid range [2, len-3]
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];

    const isSwingHigh =
      c.high > candles[i - 1].high &&
      c.high > candles[i - 2].high &&
      c.high > candles[i + 1].high &&
      c.high > candles[i + 2].high;

    const isSwingLow =
      c.low < candles[i - 1].low &&
      c.low < candles[i - 2].low &&
      c.low < candles[i + 1].low &&
      c.low < candles[i + 2].low;

    if (isSwingHigh) {
      swings.push({ price: c.high, openTime: c.openTime });
    }
    if (isSwingLow) {
      swings.push({ price: c.low, openTime: c.openTime });
    }
  }
  return swings;
}

function clusterSwingPoints(swings: SwingPoint[]): Cluster[] {
  if (swings.length === 0) return [];

  // Sort ascending by price
  const sorted = [...swings].sort((a, b) => a.price - b.price);

  const clusters: Cluster[] = [
    { prices: [sorted[0].price], openTimes: [sorted[0].openTime] },
  ];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].price;
    const curr = sorted[i].price;
    const threshold = prev * 0.005; // 0.5% of the previous level

    if (curr - prev < threshold) {
      // Merge into current cluster
      clusters[clusters.length - 1].prices.push(curr);
      clusters[clusters.length - 1].openTimes.push(sorted[i].openTime);
    } else {
      clusters.push({ prices: [curr], openTimes: [sorted[i].openTime] });
    }
  }

  return clusters;
}

function scoreStrength(testCount: number): SRZone['strength'] {
  if (testCount >= 3) return 'high';
  if (testCount === 2) return 'medium';
  return 'low';
}

export function computeSRZones(candles: Candle[], entryPrice: number): SRZone[] {
  if (candles.length < 10) return [];

  const swings = identifySwingPoints(candles);
  if (swings.length === 0) return [];

  const clusters = clusterSwingPoints(swings);

  const zones: SRZone[] = clusters.map((cluster) => {
    const priceLevel =
      cluster.prices.reduce((sum, p) => sum + p, 0) / cluster.prices.length;

    const testCount = cluster.prices.length;
    const mostRecentTime = Math.max(...cluster.openTimes);
    const distanceFromEntry =
      (Math.abs(priceLevel - entryPrice) / entryPrice) * 100;

    return {
      priceLevel,
      type: priceLevel < entryPrice ? 'support' : 'resistance',
      strength: scoreStrength(testCount),
      testCount,
      lastTestedAt: new Date(mostRecentTime).toISOString(),
      distanceFromEntry,
    };
  });

  // Sort by distance from entry ascending
  return zones.sort((a, b) => a.distanceFromEntry - b.distanceFromEntry);
}

export function findNearestZones(
  zones: SRZone[],
  direction: 'long' | 'short'
): { nearestSupport: SRZone | null; nearestResistance: SRZone | null; suggestedStop: number | null } {
  const supports = zones.filter((z) => z.type === 'support');
  const resistances = zones.filter((z) => z.type === 'resistance');

  // Already sorted by distanceFromEntry ascending
  const nearestSupport = supports[0] ?? null;
  const nearestResistance = resistances[0] ?? null;

  // Suggested stop: within 5% of entry, highest testCount
  const suggestedStop =
    direction === 'long'
      ? (supports.filter((z) => z.distanceFromEntry <= 5).sort((a, b) => b.testCount - a.testCount)[0]?.priceLevel ?? null)
      : (resistances.filter((z) => z.distanceFromEntry <= 5).sort((a, b) => b.testCount - a.testCount)[0]?.priceLevel ?? null);

  return { nearestSupport, nearestResistance, suggestedStop };
}
