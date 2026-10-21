/** Tala's eight-point morning star: gold on deep rose. */
export default function StarMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 52 52" aria-hidden="true">
      <circle cx="26" cy="26" r="24" className="fill-mark" />
      <polygon points="26,9 29.5,22.5 43,26 29.5,29.5 26,43 22.5,29.5 9,26 22.5,22.5" className="fill-gold" />
    </svg>
  );
}
