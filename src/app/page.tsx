'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LogoIcon } from '@/components/ui/LogoIcon';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const STEPS = [
  {
    index: '01',
    title: 'Submit Position Parameters',
    body: 'Symbol, direction, entry price, account size, leverage. The machine needs numbers — not feelings.',
  },
  {
    index: '02',
    title: 'Defend Your Thesis',
    body: 'Write why you are entering. Ryokan Tetsu evaluates it against live EMA structure and S/R zones.',
  },
  {
    index: '03',
    title: 'Earn Your Risk Numbers',
    body: 'A weak thesis is rejected. A sound thesis unlocks 3-tier position sizing with liquidation levels.',
  },
];

const PROBLEMS = [
  { label: 'Entering without structure', detail: 'Chasing price instead of reading market regime.' },
  { label: 'Skipping invalidation logic', detail: 'No plan for when you are wrong costs accounts.' },
  { label: 'Sizing from gut, not math', detail: 'Position size should follow risk — not hope.' },
];

export default function Home() {
  return (
    <main
      className="min-h-screen font-mono"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Nav */}
      <nav className="border-b flex items-center justify-between px-6 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <LogoIcon size={22} />
          <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            凌寒 鉄 / RYOKAN
          </span>
        </div>
        <Link
          href="/analyze"
          className="text-xs border px-3 py-1.5 transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          OPEN TERMINAL →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <span
                className="text-xs tracking-[0.3em] border px-2 py-1 inline-block mb-4"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                PRE-TRADE ACCOUNTABILITY SYSTEM
              </span>
              <h1
                className="text-5xl leading-tight"
                style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--text-primary)' }}
              >
                Your position.<br />Your accountability.
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Ryokan Tetsu does not predict markets. He evaluates whether your thesis is structurally
              sound before you risk capital. No approval — no position sizing.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <Link
                href="/analyze"
                className="px-6 py-3 text-sm border transition-colors hover:bg-[var(--accent-primary)] hover:text-white"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
              >
                BEGIN POSITION REVIEW
              </Link>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No account required
              </span>
            </motion.div>
          </div>

          {/* Character */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
              <Image
                src="/character/idle.svg"
                alt="Ryokan Tetsu"
                width={280}
                height={280}
                className="relative"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="border-t mx-6" style={{ borderColor: 'var(--border)' }} />

      {/* Problem statement */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp}>
            <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              THE PROBLEM
            </span>
            <h2
              className="text-2xl mt-2"
              style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--text-primary)' }}
            >
              Most traders enter the same three ways.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROBLEMS.map((p) => (
              <motion.div
                key={p.label}
                variants={fadeUp}
                className="border p-4 space-y-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-danger)' }} className="text-xs mt-0.5">✕</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                </div>
                <p className="text-xs pl-4" style={{ color: 'var(--text-muted)' }}>{p.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                HOW IT WORKS
              </span>
              <h2
                className="text-2xl mt-2"
                style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--text-primary)' }}
              >
                Three steps. No shortcuts.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border" style={{ borderColor: 'var(--border)' }}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.index}
                  variants={fadeUp}
                  className={`p-6 space-y-3 ${i < 2 ? 'md:border-r' : ''}`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span
                    className="text-3xl"
                    style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--accent-primary)', opacity: 0.4 }}
                  >
                    {step.index}
                  </span>
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center space-y-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl"
              style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--text-primary)' }}
            >
              Earn the right to your position.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ryokan does not judge your trade direction. He judges your reasoning.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/analyze"
                className="inline-block px-8 py-4 text-sm border transition-colors hover:bg-[var(--accent-primary)] hover:text-white"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
              >
                START POSITION REVIEW →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>RYOKAN — AI Risk Accountability System</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>凌寒 鉄</span>
      </footer>
    </main>
  );
}
