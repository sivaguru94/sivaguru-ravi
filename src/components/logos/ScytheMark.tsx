/* Secondary mark — "Scythe": curved blade + vertical shaft. Used small, for
 * meaning (shinigami), never as the primary lockup (design/handoff README). */
export function ScytheMark({
  size,
  fill = "var(--dim)",
}: {
  size: number;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M46 6C24 5 8 16 4 34C13 21 27 17 46 20Z" fill={fill} />
      <rect x="37" y="6" width="9" height="52" fill={fill} />
    </svg>
  );
}
