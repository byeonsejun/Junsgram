// Single, SSR-safe loading spinner used across the app (replaces the mix of
// react-spinners GridLoader/PropagateLoader/PulseLoader). Pure CSS — no client
// hydration gap, no extra dependency.

type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-10 h-10 border-4',
};

type Props = {
  size?: SpinnerSize;
  /** Extra classes on the spinner element (e.g. for absolute centering). */
  className?: string;
  /** Accessible label announced by screen readers. */
  label?: string;
};

export default function Spinner({ size = 'md', className = '', label = 'Loading' }: Props) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block rounded-full border-white/30 border-t-white animate-spin ${sizeMap[size]} ${className}`}
    />
  );
}
