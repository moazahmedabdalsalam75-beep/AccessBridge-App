import { motion } from 'motion/react';

interface AudioWaveProps {
  active: boolean;
  levels: number[];
  accent?: 'indigo' | 'emerald';
}

export function AudioWave({ active, levels, accent = 'indigo' }: AudioWaveProps) {
  const barColor =
    accent === 'emerald'
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : 'bg-indigo-600 dark:bg-indigo-400';

  const glowColor =
    accent === 'emerald'
      ? 'from-emerald-500/25 via-teal-400/15 to-transparent'
      : 'from-indigo-600/25 via-emerald-500/15 to-transparent';

  return (
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center h-14 px-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 overflow-hidden"
    >
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-r ${glowColor} pointer-events-none`}
        />
      )}
      <div className="relative z-10 flex items-center justify-center gap-1.5 h-9">
        {levels.map((level, index) => {
          const targetScale = active ? Math.max(0.24, Math.min(1, level)) : 0.18;
          return (
            <motion.span
              key={index}
              animate={{
                scaleY: targetScale,
                opacity: active ? 0.95 : 0.35,
              }}
              transition={{
                duration: 0.12,
                ease: 'easeOut',
              }}
              className={`w-1.5 h-9 rounded-full origin-center ${barColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}
