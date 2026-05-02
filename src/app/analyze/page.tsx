'use client';

import { useCallback } from 'react';
import { useRyokanStore } from '@/store/useRyokanStore';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { PositionForm } from '@/components/forms/PositionForm';
import { ThesisForm } from '@/components/forms/ThesisForm';
import { MarketStructurePanel } from '@/components/analysis/MarketStructurePanel';
import { RiskMatrixPanel } from '@/components/risk/RiskMatrixPanel';
import { RyokanCharacter } from '@/components/ryokan/RyokanCharacter';
import { RyokanSpeech } from '@/components/ryokan/RyokanSpeech';
import { RyokanVerdictCard } from '@/components/ryokan/RyokanVerdictCard';
import { CandlestickChart } from '@/components/chart/CandlestickChart';
import type { PositionFormData } from '@/types/forms';
import type { MarketStructure, Candle, Timeframe } from '@/types/market';
import type { ThesisEvalResult } from '@/types/ryokan';
import type { RiskTiersResponse } from '@/types/risk';

export default function AnalyzePage() {
  const {
    currentStep,
    marketStructure,
    candles,
    thesisEvalResult,
    riskTiers,
    positionData,
    isLoading,
    currentStatement,
    characterState,
    errorMessage,
    setPositionData,
    setMarketStructure,
    setCandles,
    setThesisResult,
    setRiskTiers,
    setLoading,
    setError,
    setCharacterState,
    setCurrentStatement,
    advanceStep,
    resetAnalysis,
  } = useRyokanStore();

  // Step 1 → fetch market data + candles
  const handlePositionSubmit = useCallback(
    async (data: PositionFormData) => {
      setPositionData(data);
      setLoading(true, 'Fetching market structure...');
      setCharacterState('analyzing');
      setCurrentStatement('Pulling candles. Checking structure.');
      setError(null);

      try {
        const params = new URLSearchParams({
          symbol: data.symbol,
          timeframe: data.timeframe,
          entryPrice: data.entryPrice.toString(),
          direction: data.direction,
        });

        // Fetch market structure and raw candles in parallel
        const [marketRes, candlesRes] = await Promise.all([
          fetch(`/api/market-data?${params}`),
          fetch(`/api/candles?symbol=${data.symbol}&timeframe=${data.timeframe}`),
        ]);

        const marketJson = (await marketRes.json()) as MarketStructure & { error?: string };
        if (!marketRes.ok) throw new Error(marketJson.error ?? 'Market data request failed');

        setMarketStructure(marketJson);

        if (candlesRes.ok) {
          const candleJson = (await candlesRes.json()) as { candles?: Candle[] };
          if (candleJson.candles) setCandles(candleJson.candles);
        }

        setCharacterState('idle');
        setCurrentStatement('Structure confirmed. Now — justify this trade. One sentence. Make it count.');
        advanceStep(2);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Market data unavailable — check symbol and try again';
        setError(msg);
        setCharacterState('warning');
        setCurrentStatement(msg);
      } finally {
        setLoading(false);
      }
    },
    [setPositionData, setLoading, setCharacterState, setCurrentStatement, setError, setMarketStructure, setCandles, advanceStep]
  );

  // Step 2 → evaluate thesis → fetch risk
  const handleThesisSubmit = useCallback(
    async (thesis: string) => {
      if (!marketStructure || !positionData) return;
      setLoading(true, 'Ryokan is evaluating...');
      setCharacterState('typing');
      setCurrentStatement('Reading your thesis...');
      setError(null);

      try {
        const evalRes = await fetch('/api/thesis-eval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            thesis,
            marketContext: {
              symbol: positionData.symbol,
              direction: positionData.direction,
              entryPrice: positionData.entryPrice,
              entryGrade: marketStructure.entryGrade,
              emaRegime: marketStructure.ema.regime,
              nearestSupport: marketStructure.nearestSupport?.priceLevel ?? null,
              nearestResistance: marketStructure.nearestResistance?.priceLevel ?? null,
              suggestedStop: marketStructure.suggestedStop,
            },
          }),
        });

        const evalJson = (await evalRes.json()) as ThesisEvalResult & { error?: string };
        if (!evalRes.ok) throw new Error(evalJson.error ?? 'Thesis evaluation failed');

        setThesisResult(evalJson);
        setCurrentStatement(evalJson.ryokanStatement);

        if (evalJson.thesisScore <= 3) {
          setCharacterState('reject');
          setLoading(false);
          return;
        }

        setCharacterState(evalJson.thesisScore >= 7 ? 'approve' : 'warning');

        const stopPrice =
          marketStructure.suggestedStop ??
          positionData.entryPrice * (positionData.direction === 'long' ? 0.98 : 1.02);

        const riskRes = await fetch('/api/risk-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryPrice: positionData.entryPrice,
            stopPrice,
            accountSize: positionData.accountSize,
            leverage: positionData.leverage,
            direction: positionData.direction,
          }),
        });

        const riskJson = (await riskRes.json()) as RiskTiersResponse & { error?: string };
        if (!riskRes.ok) throw new Error(riskJson.error ?? 'Risk calculation failed');

        setRiskTiers(riskJson);
        advanceStep(3);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Evaluation failed';
        setError(msg);
        setCharacterState('warning');
        setCurrentStatement(msg);
      } finally {
        setLoading(false);
      }
    },
    [marketStructure, positionData, setLoading, setCharacterState, setCurrentStatement, setError, setThesisResult, setRiskTiers, advanceStep]
  );

  const handleTimeframeChange = useCallback(
    async (tf: Timeframe) => {
      if (!positionData) return;
      // Re-fetch with new timeframe — reuse same flow from step 1
      await handlePositionSubmit({ ...positionData, timeframe: tf });
    },
    [positionData, handlePositionSubmit]
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <LogoIcon size={22} />
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem' }}>RYOKAN</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— Risk Accountability System</span>
        </div>
        <div className="flex items-center gap-4">
          <StepIndicator currentStep={currentStep} />
          {currentStep > 1 && (
            <button
              onClick={resetAnalysis}
              className="text-xs border px-3 py-1 transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              RESET
            </button>
          )}
        </div>
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-49px)]">

        {/* LEFT — Character + Input + Analysis */}
        <div className="border-r flex flex-col" style={{ borderColor: 'var(--border)' }}>

          {/* Character section */}
          <div
            className="flex items-start gap-4 p-5 border-b"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
          >
            <RyokanCharacter state={characterState} size={120} />
            <div className="flex-1 min-w-0 pt-1">
              <RyokanSpeech text={isLoading ? 'Processing...' : currentStatement} speed={25} />
              {errorMessage && (
                <div
                  className="mt-2 px-3 py-2 border text-xs"
                  style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <section>
                <SectionHeader label="STEP 1" title="Position Parameters" />
                <PositionForm onSubmit={handlePositionSubmit} isLoading={isLoading} />
              </section>
            )}

            {/* STEP 2 — Market Structure + Thesis */}
            {currentStep >= 2 && marketStructure && (
              <>
                <section>
                  <SectionHeader label="STEP 2" title="Market Structure" />
                  <MarketStructurePanel data={marketStructure} />
                </section>

                {!thesisEvalResult && (
                  <section>
                    <SectionHeader label="" title="Thesis Review" />
                    <ThesisForm onSubmit={handleThesisSubmit} isLoading={isLoading} />
                  </section>
                )}
              </>
            )}

            {/* STEP 3 — Verdict */}
            {currentStep >= 3 && thesisEvalResult && positionData && (
              <section>
                <SectionHeader label="STEP 3" title="Verdict" />
                <RyokanVerdictCard
                  result={thesisEvalResult}
                  positionInfo={{
                    symbol: positionData.symbol,
                    direction: positionData.direction,
                    entryPrice: positionData.entryPrice,
                  }}
                />
              </section>
            )}
          </div>
        </div>

        {/* RIGHT — Chart + Risk */}
        <div className="flex flex-col overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>

          {/* Chart — shown when candles are available */}
          {candles.length > 0 && marketStructure && positionData ? (
            <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <CandlestickChart
                candles={candles}
                emaData={{
                  ema9: [],
                  ema21: [],
                  ema50: [],
                  ema200: [],
                }}
                srZones={marketStructure.srZones}
                entryPrice={positionData.entryPrice}
                suggestedStop={marketStructure.suggestedStop}
                timeframe={positionData.timeframe}
                onTimeframeChange={handleTimeframeChange}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center p-8 border-b"
              style={{ borderColor: 'var(--border)', minHeight: 360 }}
            >
              <div className="text-center">
                <div
                  className="text-5xl mb-3"
                  style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--border)' }}
                >
                  凌寒 鉄
                </div>
                <div className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  AWAITING SYMBOL
                </div>
              </div>
            </div>
          )}

          {/* Risk panel — shown after thesis approval */}
          <div className="flex-1 p-5">
            {currentStep >= 3 && riskTiers && positionData ? (
              <RiskMatrixPanel
                data={riskTiers}
                entryPrice={positionData.entryPrice}
                direction={positionData.direction}
                leverage={positionData.leverage}
                accountSize={positionData.accountSize}
              />
            ) : (
              <div
                className="flex items-center justify-center h-full text-center py-12"
                style={{ color: 'var(--text-muted)' }}
              >
                <div>
                  <div className="text-xs tracking-widest mb-2">RISK MATRIX</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    Unlocks after thesis is approved.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      {([1, 2, 3] as const).map((s) => (
        <span
          key={s}
          className="w-5 h-5 flex items-center justify-center border"
          style={{
            borderColor: s <= currentStep ? 'var(--accent-primary)' : 'var(--border)',
            color: s <= currentStep ? 'var(--accent-primary)' : 'var(--text-muted)',
            backgroundColor: s === currentStep ? 'rgba(124,106,247,0.12)' : 'transparent',
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-4">
      {label && (
        <span
          className="text-xs px-1.5 py-0.5 border"
          style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
        >
          {label}
        </span>
      )}
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h2>
    </div>
  );
}
