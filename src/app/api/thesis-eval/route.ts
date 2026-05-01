import { NextRequest, NextResponse } from 'next/server';
import {
  RYOKAN_SYSTEM_PROMPT,
  callOpenRouter,
  parseLLMThesisResponse,
  OpenRouterError,
} from '@/lib/openrouter';
import type { ThesisEvalRequest, ThesisEvalResult, RiskFlag } from '@/types/ryokan';
import type { EntryGrade } from '@/types/market';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const data = body as Partial<ThesisEvalRequest>;

  if (!data.thesis || typeof data.thesis !== 'string' || data.thesis.trim().length < 10) {
    return NextResponse.json(
      { error: 'thesis must be a string of at least 10 characters' },
      { status: 400 }
    );
  }

  if (!data.marketContext) {
    return NextResponse.json({ error: 'Missing marketContext' }, { status: 400 });
  }

  const { thesis, marketContext } = data as ThesisEvalRequest;

  // Build the user message with market context embedded
  const userMessage = buildUserMessage(thesis, marketContext);

  try {
    const rawResponse = await callOpenRouter([
      { role: 'system', content: RYOKAN_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    const llmData = parseLLMThesisResponse(rawResponse);

    // Normalize and clamp values
    const thesisScore = Math.min(10, Math.max(1, Math.round(llmData.thesisScore)));

    const validGrades: EntryGrade[] = ['A', 'B', 'C', 'D'];
    const entryGrade: EntryGrade = validGrades.includes(llmData.entryGrade as EntryGrade)
      ? (llmData.entryGrade as EntryGrade)
      : marketContext.entryGrade;

    const validFlags: RiskFlag[] = ['none', 'caution', 'reject'];
    const riskFlag: RiskFlag = validFlags.includes(llmData.riskFlag as RiskFlag)
      ? (llmData.riskFlag as RiskFlag)
      : deriveRiskFlag(thesisScore);

    const result: ThesisEvalResult = {
      thesisScore,
      entryGrade,
      alignmentSummary: llmData.alignmentSummary,
      structuralValidity: llmData.structuralValidity,
      riskFlag,
      ryokanStatement: llmData.ryokanStatement,
      whatWouldChangeAssessment: llmData.whatWouldChangeAssessment,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof OpenRouterError) {
      if (error.statusCode === 401) {
        return NextResponse.json(
          { error: 'AI evaluation unavailable — API key issue' },
          { status: 503 }
        );
      }
      if (error.statusCode === 429) {
        return NextResponse.json(
          { error: 'AI evaluation rate limited — please wait and retry' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI evaluation service unavailable' },
        { status: 503 }
      );
    }

    if (error instanceof Error && error.message.includes('LLM')) {
      console.error('[thesis-eval] parse error:', error.message);
      return NextResponse.json(
        { error: 'AI returned an unparseable response — please retry' },
        { status: 502 }
      );
    }

    console.error('[thesis-eval]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildUserMessage(
  thesis: string,
  ctx: ThesisEvalRequest['marketContext']
): string {
  const supportStr = ctx.nearestSupport !== null
    ? `$${ctx.nearestSupport.toLocaleString()}`
    : 'none identified';
  const resistanceStr = ctx.nearestResistance !== null
    ? `$${ctx.nearestResistance.toLocaleString()}`
    : 'none identified';
  const stopStr = ctx.suggestedStop !== null
    ? `$${ctx.suggestedStop.toLocaleString()}`
    : 'not set';

  return `MARKET CONTEXT:
Symbol: ${ctx.symbol}
Direction: ${ctx.direction.toUpperCase()}
Entry Price: $${ctx.entryPrice.toLocaleString()}
EMA Regime: ${ctx.emaRegime}
Entry Grade (structural): ${ctx.entryGrade}
Nearest Support: ${supportStr}
Nearest Resistance: ${resistanceStr}
Suggested Stop: ${stopStr}

TRADER THESIS:
"${thesis.trim()}"

Evaluate this thesis against the market context. Return JSON only.`;
}

function deriveRiskFlag(score: number): RiskFlag {
  if (score <= 3) return 'reject';
  if (score <= 6) return 'caution';
  return 'none';
}
