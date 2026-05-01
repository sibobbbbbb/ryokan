import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RYOKAN — AI Risk Accountability System',
  description: 'Pre-trade accountability for crypto futures traders. Earn the right to see your risk numbers.',
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
