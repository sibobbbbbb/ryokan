import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ryokan-nine.vercel.app'),
  title: 'RYOKAN — AI Risk Accountability System',
  description: 'Pre-trade accountability for crypto futures traders. Defend your thesis against live market structure. Earn your risk numbers.',
  keywords: ['crypto trading', 'risk management', 'trade thesis', 'position sizing', 'futures trading', 'EMA analysis', 'support resistance', 'AI trading tool'],
  openGraph: {
    type: 'website',
    siteName: 'RYOKAN',
    title: 'RYOKAN — AI Risk Accountability System',
    description: 'Defend your thesis. Earn your risk numbers. AI-powered pre-trade accountability for crypto futures traders.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RYOKAN — AI Risk Accountability System',
    description: 'Defend your thesis. Earn your risk numbers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: '#0a0a0f',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
