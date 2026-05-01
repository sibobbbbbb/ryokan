'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { CharacterState } from '@/types/ryokan';

interface RyokanCharacterProps {
  state: CharacterState;
  size?: number;
}

const STATE_LABEL: Record<CharacterState, string> = {
  idle: 'STANDBY',
  analyzing: 'ANALYZING',
  warning: 'CAUTION',
  reject: 'REJECTED',
  approve: 'APPROVED',
  typing: 'EVALUATING',
};

const STATE_COLOR: Record<CharacterState, string> = {
  idle: 'var(--text-muted)',
  analyzing: 'var(--accent-primary)',
  warning: 'var(--accent-warn)',
  reject: 'var(--accent-danger)',
  approve: 'var(--accent-safe)',
  typing: 'var(--accent-primary)',
};

export function RyokanCharacter({ state, size = 160 }: RyokanCharacterProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={`/character/${state}.svg`}
              alt={`Ryokan Tetsu — ${state}`}
              width={size}
              height={size}
              priority
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: STATE_COLOR[state] }}
        />
        <span
          className="text-xs tracking-widest font-mono"
          style={{ color: STATE_COLOR[state] }}
        >
          {STATE_LABEL[state]}
        </span>
      </div>
    </div>
  );
}
