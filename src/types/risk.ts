export interface RiskInput {
  entryPrice: number;
  stopPrice: number;
  accountSize: number;
  leverage: number;
  direction: 'long' | 'short';
  riskPercent: number;
  targetPrice?: number;
}

export interface RiskOutput {
  dollarRisk: number;
  positionSizeUSDT: number;
  stopDistancePct: number;
  liquidationPrice: number;
  marginRequired: number;
  marginUtilization: number;
  rrRatio: number | null;
  riskGrade: RiskGrade;
  flags: RiskFlag[];
}

export type RiskGrade = 'safe' | 'caution' | 'danger';

export interface RiskFlag {
  type: 'high_leverage' | 'high_margin' | 'low_rr' | 'liq_near_stop';
  message: string;
}

export interface RiskMatrixRequest {
  entryPrice: number;
  stopPrice: number;
  accountSize: number;
  leverage: number;
  direction: 'long' | 'short';
  targetPrice?: number;
}

export interface RiskTiersResponse {
  tiers: {
    '1pct': RiskOutput;
    '1.5pct': RiskOutput;
    '2pct': RiskOutput;
  };
  default: RiskOutput;
}
