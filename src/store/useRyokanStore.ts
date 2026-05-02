import { create } from 'zustand';
import type { MarketStructure, Candle } from '@/types/market';
import type { EMAArrays } from '@/lib/indicators';
import type { RiskTiersResponse } from '@/types/risk';
import type { ThesisEvalResult, CharacterState } from '@/types/ryokan';
import type { PositionFormData } from '@/types/forms';

interface RyokanStore {
  // Form
  positionData: PositionFormData | null;

  // Step gating
  currentStep: 1 | 2 | 3;

  // API responses
  marketStructure: MarketStructure | null;
  candles: Candle[];
  emaArrays: EMAArrays | null;
  thesisEvalResult: ThesisEvalResult | null;
  riskTiers: RiskTiersResponse | null;

  // UI
  isLoading: boolean;
  loadingMessage: string;
  characterState: CharacterState;
  currentStatement: string;
  errorMessage: string | null;

  // Actions
  setPositionData: (data: PositionFormData) => void;
  setMarketStructure: (data: MarketStructure) => void;
  setCandles: (candles: Candle[]) => void;
  setEmaArrays: (arrays: EMAArrays) => void;
  setThesisResult: (result: ThesisEvalResult) => void;
  setRiskTiers: (tiers: RiskTiersResponse) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setCharacterState: (state: CharacterState) => void;
  setCurrentStatement: (text: string) => void;
  setError: (msg: string | null) => void;
  advanceStep: (step: 1 | 2 | 3) => void;
  resetAnalysis: () => void;
}

export const useRyokanStore = create<RyokanStore>((set) => ({
  positionData: null,
  currentStep: 1,
  marketStructure: null,
  candles: [],
  emaArrays: null,
  thesisEvalResult: null,
  riskTiers: null,
  isLoading: false,
  loadingMessage: '',
  characterState: 'idle',
  currentStatement: 'Awaiting position parameters.',
  errorMessage: null,

  setPositionData: (data) => set({ positionData: data }),
  setMarketStructure: (data) => set({ marketStructure: data }),
  setCandles: (candles) => set({ candles }),
  setEmaArrays: (arrays) => set({ emaArrays: arrays }),
  setThesisResult: (result) => set({ thesisEvalResult: result }),
  setRiskTiers: (tiers) => set({ riskTiers: tiers }),
  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),
  setCharacterState: (state) => set({ characterState: state }),
  setCurrentStatement: (text) => set({ currentStatement: text }),
  setError: (msg) => set({ errorMessage: msg }),
  advanceStep: (step) => set({ currentStep: step }),
  resetAnalysis: () =>
    set({
      positionData: null,
      currentStep: 1,
      marketStructure: null,
      candles: [],
      emaArrays: null,
      thesisEvalResult: null,
      riskTiers: null,
      isLoading: false,
      loadingMessage: '',
      characterState: 'idle',
      currentStatement: 'Awaiting position parameters.',
      errorMessage: null,
    }),
}));
