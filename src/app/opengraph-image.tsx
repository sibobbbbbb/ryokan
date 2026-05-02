import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RYOKAN — AI Risk Accountability System';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#0a0a0f',
          padding: '80px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 32, left: 32, width: 40, height: 40, borderTop: '3px solid #7c6af7', borderLeft: '3px solid #7c6af7', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 32, right: 32, width: 40, height: 40, borderTop: '3px solid #7c6af7', borderRight: '3px solid #7c6af7', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 32, left: 32, width: 40, height: 40, borderBottom: '3px solid #7c6af7', borderLeft: '3px solid #7c6af7', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 32, right: 32, width: 40, height: 40, borderBottom: '3px solid #7c6af7', borderRight: '3px solid #7c6af7', display: 'flex' }} />

        {/* Tag */}
        <div style={{ fontSize: 14, letterSpacing: '0.3em', color: '#5a5a7a', marginBottom: 24, display: 'flex' }}>
          PRE-TRADE ACCOUNTABILITY SYSTEM
        </div>

        {/* Title */}
        <div style={{ fontSize: 80, color: '#e8e8f0', lineHeight: 1.1, marginBottom: 32, display: 'flex' }}>
          RYOKAN
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 24, color: '#9898b0', maxWidth: 700, lineHeight: 1.5, marginBottom: 48, display: 'flex' }}>
          Defend your thesis. Earn your risk numbers.
        </div>

        {/* Divider */}
        <div style={{ width: 64, height: 2, backgroundColor: '#7c6af7', marginBottom: 32, display: 'flex' }} />

        {/* Footer */}
        <div style={{ fontSize: 16, color: '#5a5a7a', letterSpacing: '0.15em', display: 'flex' }}>
          凌寒 鉄 · AI RISK ANALYST
        </div>
      </div>
    ),
    { ...size }
  );
}
