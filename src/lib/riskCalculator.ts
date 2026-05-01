import type { RiskInput, RiskOutput, RiskGrade, RiskFlag } from '@/types/risk';

export function calculateRisk(input: RiskInput): RiskOutput {
  const {
    entryPrice,
    stopPrice,
    accountSize,
    leverage,
    direction,
    riskPercent,
    targetPrice,
  } = input;

  // Dollar amount at risk
  const dollarRisk = accountSize * (riskPercent / 100);

  // Stop distance as a percentage of entry
  const stopDistance = Math.abs(entryPrice - stopPrice);
  const stopDistancePct = (stopDistance / entryPrice) * 100;

  // Position size: how much USDT exposure to risk exactly dollarRisk
  const positionSizeUSDT = stopDistancePct > 0
    ? (dollarRisk / stopDistancePct) * 100
    : 0;

  // Liquidation price (simplified, 0.5% maintenance margin)
  const liquidationPrice =
    direction === 'long'
      ? entryPrice * (1 - 1 / leverage + 0.005)
      : entryPrice * (1 + 1 / leverage - 0.005);

  // Margin required to open position
  const marginRequired = positionSizeUSDT / leverage;

  // What % of account is tied up as margin
  const marginUtilization = (marginRequired / accountSize) * 100;

  // R:R ratio — only if targetPrice provided
  let rrRatio: number | null = null;
  if (targetPrice !== undefined && targetPrice !== null) {
    const reward = Math.abs(targetPrice - entryPrice);
    const risk = stopDistance;
    rrRatio = risk > 0 ? reward / risk : null;
  }

  // Build risk flags
  const flags: RiskFlag[] = [];

  if (leverage > 20) {
    flags.push({
      type: 'high_leverage',
      message: `Leverage ${leverage}x exceeds 20x — liquidation risk elevated significantly.`,
    });
  }

  if (marginUtilization >= 40) {
    flags.push({
      type: 'high_margin',
      message: `Margin utilization ${marginUtilization.toFixed(1)}% ≥ 40% — overexposure on single trade.`,
    });
  }

  if (rrRatio !== null && rrRatio < 1.5) {
    flags.push({
      type: 'low_rr',
      message: `R:R ratio ${rrRatio.toFixed(2)} is below 1.5 — reward does not justify the risk.`,
    });
  }

  // Flag if liquidation is within 2× the stop distance from entry
  const liqDistance = Math.abs(liquidationPrice - entryPrice);
  if (liqDistance < stopDistance * 2) {
    flags.push({
      type: 'liq_near_stop',
      message: `Liquidation price (${liquidationPrice.toFixed(2)}) is within 2× stop distance — position may be liquidated before stop triggers.`,
    });
  }

  // Overall grade
  const riskGrade = deriveGrade(riskPercent, marginUtilization, flags);

  return {
    dollarRisk,
    positionSizeUSDT,
    stopDistancePct,
    liquidationPrice,
    marginRequired,
    marginUtilization,
    rrRatio,
    riskGrade,
    flags,
  };
}

function deriveGrade(
  riskPercent: number,
  marginUtilization: number,
  flags: RiskFlag[]
): RiskGrade {
  const hasDangerFlag = flags.some(
    (f) => f.type === 'high_leverage' || f.type === 'liq_near_stop' || f.type === 'high_margin'
  );
  if (hasDangerFlag || riskPercent > 2) return 'danger';
  if (riskPercent > 1.5 || marginUtilization >= 20) return 'caution';
  return 'safe';
}
