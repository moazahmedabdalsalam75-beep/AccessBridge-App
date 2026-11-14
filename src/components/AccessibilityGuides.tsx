interface SignLanguageIconProps {
  className?: string;
}

/**
 * Custom vector icon representing Sign Language & Visual communication.
 */
export function SignLanguageIcon({ className = 'w-6 h-6' }: SignLanguageIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Left signing hand */}
      <path d="M7.5 14V7.5a1 1 0 0 1 2 0V11" />
      <path d="M9.5 10.5V5.5a1 1 0 0 1 2 0v5.5" />
      <path d="M11.5 10.5V6.5a1 1 0 0 1 2 0V12" />
      <path d="M7.5 11.5l-1.3-1.3a1 1 0 0 0-1.4 1.4l2.7 3.4c.7.9 1.7 1.5 2.9 1.5h1.1" />
      {/* Right expressive signing hand */}
      <path d="M14.5 19.5c1.8 0 3.2-1.1 3.9-2.8l1.4-4.2a1 1 0 0 0-1.9-.6l-.8 2.1V8.5a1 1 0 0 0-2 0V13" />
      <path d="M15.1 13.5l-1.5-1.1a1 1 0 0 0-1.2 1.6l2.1 2" />
    </svg>
  );
}

interface BrailleCellProps {
  /** Standard 6-dot Braille numbering (1-3 left column top-to-bottom, 4-6 right column top-to-bottom) */
  dots: (1 | 2 | 3 | 4 | 5 | 6)[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

const DOT_ORDER: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 4, 2, 5, 3, 6];

/**
 * Authentic 6-dot Braille cell visualization for tactile and visual guides.
 */
export function BrailleCell({
  dots,
  label,
  size = 'md',
  inverted = false,
}: BrailleCellProps) {
  const dotSize =
    size === 'lg' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gapSize = size === 'lg' ? 'gap-1.5' : size === 'sm' ? 'gap-1' : 'gap-1';

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-grid grid-cols-2 ${gapSize} shrink-0`}
    >
      {DOT_ORDER.map((dotNum) => {
        const active = dots.includes(dotNum);
        return (
          <span
            key={dotNum}
            className={`${dotSize} rounded-full transition-colors ${
              active
                ? inverted
                  ? 'bg-white'
                  : 'bg-current'
                : inverted
                  ? 'border border-white/40 bg-transparent'
                  : 'border border-current/35 bg-transparent'
            }`}
          />
        );
      })}
    </span>
  );
}
