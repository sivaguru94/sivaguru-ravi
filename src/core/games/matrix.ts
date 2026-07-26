/*
 * Matrix digital rain — fullscreen canvas easter egg. Pure TS, owns its DOM
 * (React only triggers start via a command). Any key or click exits.
 * Backing store capped at DPR ≤ 2 (battery/fill-rate on 3x phones);
 * recomputes size + columns on resize/orientation change.
 */

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789$#@ラリルレロ";
const FONT_SIZE = 16;

let active = false;

export function startMatrix(onExit?: () => void): void {
  if (active) return;
  active = true;

  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || "#4af07a";

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:120;background:rgba(0,0,0,0.92);cursor:pointer;width:100vw;height:100vh";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  let cols = 0;
  let drops: number[] = [];
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(window.innerWidth / FONT_SIZE);
    drops = Array.from(
      { length: cols },
      (_, i) => drops[i] ?? Math.floor(Math.random() * -50),
    );
  };
  resize();

  let raf = 0;
  const tick = () => {
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      ctx.fillStyle = Math.random() > 0.975 ? "#eaffea" : accent;
      ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);
      if (drops[i] * FONT_SIZE > window.innerHeight && Math.random() > 0.975)
        drops[i] = 0;
      drops[i]++;
    }
    raf = requestAnimationFrame(tick);
  };
  tick();

  const stop = (e?: Event) => {
    e?.stopPropagation();
    e?.preventDefault();
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    document.removeEventListener("keydown", stop, true);
    canvas.removeEventListener("click", stop);
    canvas.remove();
    active = false;
    onExit?.();
  };

  window.addEventListener("resize", resize);
  canvas.addEventListener("click", stop);
  document.addEventListener("keydown", stop, true);
}
