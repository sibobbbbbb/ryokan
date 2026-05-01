# RYOKAN — AI Risk Accountability System

> *"Before I calculate your risk, tell me why you're taking this trade. Make it count."*

A pre-trade accountability system for cryptocurrency futures traders. RYOKAN forces deliberate thinking before execution by combining live market structure analysis, AI-powered thesis evaluation, and mathematically rigorous risk management — all gated behind a strict AI character who can and will reject your trade.

**Live:** https://ryokan-nine.vercel.app/

---

## What it does

Most traders enter positions based on gut feeling. RYOKAN introduces deliberate friction:

1. **Submit your position parameters** — symbol, direction, entry price, account size, leverage
2. **Receive live market structure analysis** — EMA regime (9/21/50/200), S/R zones, entry grade (A–D)
3. **Defend your thesis to Ryokan Tetsu** — the AI character evaluates your reasoning against actual market conditions
4. **Earn your risk numbers** — only a structurally sound thesis unlocks the full 3-tier risk matrix

If your thesis scores ≤ 3/10, Ryokan refuses. You must revise and resubmit.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties |
| State | Zustand |
| Animations | Framer Motion |
| Chart | lightweight-charts v4 |
| Market Data | Binance public REST API |
| AI Evaluation | OpenRouter (DeepSeek R1 / GPT fallback) |
| Deployment | Vercel |

---

## Features

### Ryokan Tetsu — AI Character
- 6 animated states: `idle`, `analyzing`, `warning`, `reject`, `approve`, `typing`
- Strict, analytical persona — no encouragement, no padding
- Typewriter speech delivery at 30ms/character
- Rejects weak theses with specific structural reasoning

### Market Structure Analysis
- Live OHLCV data from Binance (200 candles)
- EMA 9/21/50/200 calculation and regime detection
- S/R zone clustering from swing highs/lows (0.5% merge threshold)
- Entry grade A–D based on EMA stack alignment
- Suggested stop at nearest structural zone

### Candlestick Chart
- Interactive chart with EMA overlays (9/21/50/200)
- Entry price and stop price lines
- Nearest S/R zone lines
- Timeframe toggle: 1H / 4H / 1D

### Risk Matrix (3-Tier Comparison)
- Simultaneous 1% / 1.5% / 2% risk comparison
- Position size, dollar risk, stop distance
- Liquidation price with 0.5% maintenance margin
- Margin utilization with color-coded thresholds
- Risk flags: overleveraged, poor R:R, margin warning

### Verdict Card
- `STRUCTURALLY_SOUND` — score ≥ 7, R:R ≥ 2, risk ≤ 1.5%
- `PROCEED_WITH_CAUTION` — score 5–7 or risk 1.5–2%
- `HIGH_RISK_WARNING` — leverage > 20x or margin > 40%
- `THESIS_REJECTED` — score ≤ 3

---

## Local Setup

```bash
git clone https://github.com/sibobbbbbb/ryokan
cd ryokan
npm install
```

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=deepseek/deepseek-r1
BINANCE_BASE_URL=https://api.binance.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── analyze/page.tsx      # Main 3-step analysis flow
│   └── api/
│       ├── market-data/      # Binance + EMA + S/R zones
│       ├── thesis-eval/      # OpenRouter LLM evaluation
│       ├── risk-matrix/      # Risk calculations
│       └── candles/          # Raw OHLCV for chart
├── components/
│   ├── ryokan/               # Character, speech, verdict
│   ├── forms/                # PositionForm, ThesisForm
│   ├── analysis/             # MarketStructurePanel
│   ├── chart/                # CandlestickChart
│   └── risk/                 # RiskMatrixPanel
├── lib/
│   ├── binance.ts            # Binance API client
│   ├── indicators.ts         # EMA calculations
│   ├── srZones.ts            # S/R clustering algorithm
│   ├── riskCalculator.ts     # Position sizing math
│   └── openrouter.ts         # LLM client + Ryokan prompt
└── store/
    └── useRyokanStore.ts     # Zustand global store
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `OPENROUTER_MODEL` | Yes | Model ID (e.g. `deepseek/deepseek-r1`) |
| `BINANCE_BASE_URL` | Yes | `https://api.binance.com` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployment URL |

---

## Design Philosophy

Dark tactical terminal aesthetic — Bloomberg meets anime character.

- Font: IBM Plex Mono (UI) + DM Serif Display (headings)
- Colors: `#0a0a0f` background, `#7c6af7` brand purple, green/red for market direction
- Motion: purposeful only — character state transitions, typewriter speech, verdict reveal
- No border-radius > 8px. No shadows. No defaults.

---

Built for Wealthy People Stage 2 — Web & AI Creativity Challenge.
