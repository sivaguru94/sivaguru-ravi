/* Primary mark — "Tapered Blade": filled tapered `>` caret with a block
 * cursor in its mouth. Geometry is signed off (design/handoff README §Brand). */
export function BladeMark({
  size,
  fill = "var(--accent)",
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
      <path
        d="M12 8C34 17 48 25 51 32C48 39 34 47 12 56L12 45C25 40.5 31 36.5 34.5 32C31 27.5 25 23.5 12 19Z"
        fill={fill}
      />
      <rect x="13" y="26" width="13" height="12" fill={fill} />
    </svg>
  );
}
