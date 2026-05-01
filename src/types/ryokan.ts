import type { EntryGrade, EMARegime } from '@/types/market';

export type CharacterState =
  | 'idle'
  | 'analyzing'
  | 'warning'
  | 'reject'
  | 'approve'
  | 'typing';

export type VerdictType =
  | 'STRUCTURALLY_SOUND'
  | 'PROCEED_WITH_CAUTION'
  | 'HIGH_RISK_WARNING'
  | 'THESIS_REJECTED';

export type RiskFlag = 'none' | 'caution' | 'reject';

export interface ThesisMarketContext {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  entryGrade: EntryGrade;
  emaRegime: EMARegime;
  nearestSupport: number | null;
  nearestResistance: number | null;
  suggestedStop: number | null;
}

export interface ThesisEvalRequest {
  thesis: string;
  marketContext: ThesisMarketContext;
}

export interface ThesisEvalResult {
  thesisScore: number;
  entryGrade: EntryGrade;
  alignmentSummary: string;
  structuralValidity: string;
  riskFlag: RiskFlag;
  ryokanStatement: string;
  whatWouldChangeAssessment: string;
}

// Raw shape expected from the LLM JSON output
export interface LLMThesisResponse {
  thesisScore: number;
  entryGrade: string;
  alignmentSummary: string;
  structuralValidity: string;
  riskFlag: string;
  ryokanStatement: string;
  whatWouldChangeAssessment: string;
}
