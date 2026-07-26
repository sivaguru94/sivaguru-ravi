/*
 * Snake — fullscreen 21×21 canvas easter egg (prototype port). Arrows/WASD
 * steer, R restarts, ESC quits; touch: swipe steers, tap restarts, visible
 * 44px ✕ quit button. Owns its DOM; cleans interval + listeners on exit.
 */

const N = 21;
const TICK_MS = 110;

let active = false;

export function startSnake(onExit?: () => void): void {
  if (active) return;
  active = true;

  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || "#4af07a";
  const cell = Math.min(
    24,
    Math.floor(Math.min(window.innerWidth, window.innerHeight - 80) / N),
  );

  const canvas = document.createElement("canvas");
  canvas.width = N * cell;
  canvas.height = N * cell;
  canvas.style.cssText = `border:1px solid ${accent};box-shadow:0 0 32px rgba(0,0,0,0.6);touch-action:none`;

  const wrap = document.createElement("div");
  wrap.style.cssText =
    'position:fixed;inset:0;z-index:120;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font-family:"JetBrains Mono",monospace';

  const hud = document.createElement("div");
  hud.style.cssText = `color:${accent};font-size:13px;letter-spacing:0.08em`;

  const foot = document.createElement("div");
  foot.style.cssText = "color:#6f7d6f;font-size:11px";
  const touchDevice = "ontouchstart" in window;
  foot.textContent = touchDevice
    ? "swipe to steer · tap to restart"
    : "arrows/wasd move · esc quit";

  const quit = document.createElement("button");
  quit.textContent = "✕ quit";
  quit.style.cssText = `background:transparent;border:1px solid ${accent};color:${accent};font-family:"JetBrains Mono",monospace;font-size:12px;padding:8px 18px;border-radius:4px;cursor:pointer;min-height:44px`;

  wrap.append(hud, canvas, foot, quit);
  document.body.appendChild(wrap);

  const ctx = canvas.getContext("2d")!;
  let snake: number[][], dir: number[], nextDir: number[];
  let food: number[], score: number, dead: boolean;

  const spawnFood = () => {
    do {
      food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    } while (snake.some((s) => s[0] === food[0] && s[1] === food[1]));
  };

  const reset = () => {
    snake = [
      [10, 10],
      [9, 10],
      [8, 10],
    ];
    dir = [1, 0];
    nextDir = dir;
    score = 0;
    dead = false;
    spawnFood();
    hud.textContent = "SNAKE — score 0";
  };
  reset();

  const draw = () => {
    ctx.fillStyle = "#050705";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = accent;
    snake.forEach(([x, y], i) => {
      ctx.globalAlpha = i === 0 ? 1 : Math.max(0.35, 1 - i * 0.04);
      ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ff5f57";
    ctx.beginPath();
    ctx.arc(
      food[0] * cell + cell / 2,
      food[1] * cell + cell / 2,
      cell / 2 - 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (dead) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accent;
      ctx.textAlign = "center";
      ctx.font = 'bold 22px "JetBrains Mono",monospace';
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 12);
      ctx.font = '13px "JetBrains Mono",monospace';
      ctx.fillText(
        "score " + score + " — R restart · ESC quit",
        canvas.width / 2,
        canvas.height / 2 + 16,
      );
    }
  };

  const step = () => {
    if (dead) return;
    dir = nextDir;
    const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
    if (
      head[0] < 0 ||
      head[1] < 0 ||
      head[0] >= N ||
      head[1] >= N ||
      snake.some((s) => s[0] === head[0] && s[1] === head[1])
    ) {
      dead = true;
      draw();
      return;
    }
    snake.unshift(head);
    if (head[0] === food[0] && head[1] === food[1]) {
      score += 10;
      hud.textContent = "SNAKE — score " + score;
      spawnFood();
    } else {
      snake.pop();
    }
    draw();
  };

  draw();
  const timer = setInterval(step, TICK_MS);

  const KEYS: Record<string, number[]> = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };

  const stop = (e?: Event) => {
    e?.stopPropagation();
    e?.preventDefault();
    clearInterval(timer);
    document.removeEventListener("keydown", onKey, true);
    wrap.remove();
    active = false;
    onExit?.();
  };

  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "escape") {
      stop(e);
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    if (dead && k === "r") {
      reset();
      draw();
      return;
    }
    const nd = KEYS[k];
    if (nd && !(nd[0] === -dir[0] && nd[1] === -dir[1])) nextDir = nd;
  };
  document.addEventListener("keydown", onKey, true);
  quit.addEventListener("click", (e) => stop(e));

  // touch: swipe steers, tap restarts when dead
  let touchStart: { x: number; y: number } | null = null;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      e.preventDefault();
    },
    { passive: false },
  );
  canvas.addEventListener(
    "touchend",
    (e) => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
        if (dead) {
          reset();
          draw();
        }
        return;
      }
      const nd =
        Math.abs(dx) > Math.abs(dy)
          ? [dx > 0 ? 1 : -1, 0]
          : [0, dy > 0 ? 1 : -1];
      if (!(nd[0] === -dir[0] && nd[1] === -dir[1])) nextDir = nd;
      e.preventDefault();
    },
    { passive: false },
  );
}
