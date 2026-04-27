(function () {
  /**
   * HKCC 2026 tiers (four reels):
   *   Index 0 Diamond x 4 -> 1st
   *   Index 1 Star    x 4 -> 2nd
   *   Index 2 Drop    x 4 -> 3rd
   *   Any reel shows index 3 (X) OR mixed non-winning set -> Miss
   */
  const SYMBOLS = window.SLOT_SYMBOLS;
  const N = SYMBOLS.length;
  const MISS_INDEX = SYMBOLS.findIndex((s) => s.isMiss);
  const REEL_COUNT = 4;
  const CREDITS_START = 9999;

  const TIER_SYMBOL = {
    grand: SYMBOLS.findIndex((s) => s.id === "sym-diamond"),
    runner: SYMBOLS.findIndex((s) => s.id === "sym-star"),
    third: SYMBOLS.findIndex((s) => s.id === "sym-drop"),
  };

  const SYMBOL_REPEAT = 96;

  const SPIN_BASE_MS = 2200;
  const SPIN_PER_REEL_MS = 300;
  const EASING = "cubic-bezier(0.13, 0.85, 0.22, 1)";

  const reelsEl = document.getElementById("reels");
  const spinBtn = document.getElementById("spinBtn");
  const creditsEl = document.getElementById("credits");
  const lastWinEl = document.getElementById("lastWin");
  const messageEl = document.getElementById("message");
  let credits = CREDITS_START;
  let spinning = false;
  /** @type {number[]} symbol index 0..N-1 per reel (default: index 1 - star gem) */
  const DEFAULT_FACE = SYMBOLS.findIndex((s) => s.id === "sym-star");
  let faceSymbol = [DEFAULT_FACE, DEFAULT_FACE, DEFAULT_FACE, DEFAULT_FACE];

  function buildStripHTML() {
    const cells = [];
    for (let i = 0; i < SYMBOL_REPEAT; i++) {
      const sym = SYMBOLS[i % N];
      cells.push(
        `<div class="symbol-cell" data-sym="${sym.id}"><div class="symbol-inner"><img src="${sym.src}" alt="${sym.name}" draggable="false" /></div></div>`
      );
    }
    return `<div class="reel-strip">${cells.join("")}</div>`;
  }

  function initReels() {
    reelsEl.querySelectorAll(".reel").forEach((reel) => {
      reel.innerHTML = buildStripHTML();
    });
    reelsEl.querySelectorAll(".reel-strip").forEach((strip) => {
      strip.dataset.face = "0";
    });
    syncStripTransforms(false);
  }

  function cellHeightPx() {
    const first = reelsEl.querySelector(".symbol-cell");
    return first ? first.getBoundingClientRect().height : 120;
  }

  function stripEl(reelIndex) {
    return reelsEl.querySelectorAll(".reel-strip")[reelIndex];
  }

  function syncStripTransforms(animate) {
    const cellH = cellHeightPx();
    reelsEl.querySelectorAll(".reel-strip").forEach((strip, idx) => {
      const sym = faceSymbol[idx];
      const px = sym * cellH;
      strip.style.transition = animate ? `transform ${SPIN_BASE_MS + idx * SPIN_PER_REEL_MS}ms ${EASING}` : "none";
      strip.style.transform = `translateY(${-px}px)`;
      strip.dataset.face = String(sym);
    });
  }

  /**
   * @param {number} reelIndex
   * @param {number} targetSym 0..N-1
   * @param {() => void} done
   */
  function spinReel(reelIndex, targetSym, done) {
    const strip = stripEl(reelIndex);
    const cellH = cellHeightPx();
    const startSym = faceSymbol[reelIndex];
    const loops = 5 + reelIndex * 2;
    let delta = (targetSym - startSym + N) % N;
    if (delta === 0) delta = N;
    const cellsMoved = N * loops + delta;
    const startPx = startSym * cellH;
    const endPx = startPx + cellsMoved * cellH;

    strip.style.transition = "none";
    strip.style.transform = `translateY(${-startPx}px)`;
    void strip.offsetHeight;

    requestAnimationFrame(() => {
      strip.style.transition = `transform ${SPIN_BASE_MS + reelIndex * SPIN_PER_REEL_MS}ms ${EASING}`;
      strip.style.transform = `translateY(${-endPx}px)`;
    });

    const duration = SPIN_BASE_MS + reelIndex * SPIN_PER_REEL_MS + 80;

    window.setTimeout(() => {
      strip.style.transition = "none";
      strip.style.transform = `translateY(${-targetSym * cellH}px)`;
      void strip.offsetHeight;
      strip.style.transition = "";
      faceSymbol[reelIndex] = targetSym;
      strip.dataset.face = String(targetSym);
      done();
    }, duration);
  }

  /**
   * Celebration particle system.
   *
   * Shared canvas, shared particle pool, shared animation loop.
   * Call burstConfetti("high") for a grand multi-wave show (~7s).
   * Call burstConfetti("medium") for a single softer burst (~3s).
   */
  const celebration = {
    canvas: document.getElementById("confetti"),
    ctx: null,
    dpr: 1,
    w: 0,
    h: 0,
    particles: [],
    shockwaves: [],
    raf: null,
    last: 0,
    hardStopAt: 0,
  };

  const PALETTES = {
    grand: [
      "#ffd76b", "#fff4c9", "#ffe07a", // gold family
      "#ffffff", "#f6e8ff", "#e9d5ff", // luminous white / lavender
      "#d8b4fe", "#c084fc", "#a78bfa", // violet midtones
      "#9333ea", "#7c3aed",             // violet deep
      "#67e8f9",                         // cool accent
    ],
    runner: [
      "#f6e8ff", "#e9d5ff", "#d8b4fe",
      "#c084fc", "#a78bfa", "#9333ea",
    ],
    third: ["#e0f2fe", "#e9d5ff", "#d8b4fe", "#c084fc", "#a5b4fc", "#93c5fd"],
  };

  function resizeCelebrationCanvas() {
    const c = celebration;
    if (!c.canvas) return;
    c.w = window.innerWidth;
    c.h = window.innerHeight;
    c.dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.canvas.width = c.w * c.dpr;
    c.canvas.height = c.h * c.dpr;
    c.canvas.style.width = `${c.w}px`;
    c.canvas.style.height = `${c.h}px`;
    if (!c.ctx) c.ctx = c.canvas.getContext("2d");
    c.ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
  }

  function ensureLoop() {
    const c = celebration;
    if (c.raf != null) return;
    c.last = performance.now();
    const step = (now) => {
      const dt = Math.min(48, now - c.last);
      c.last = now;
      tickCelebration(dt);
      drawCelebration();
      if (c.particles.length === 0 && c.shockwaves.length === 0 && now >= c.hardStopAt) {
        c.ctx.clearRect(0, 0, c.w, c.h);
        c.raf = null;
        return;
      }
      c.raf = requestAnimationFrame(step);
    };
    c.raf = requestAnimationFrame(step);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  /**
   * Spawn a wave of confetti particles.
   * @param {{x:number,y:number,count:number,angle:number,spread:number,power:number,palette:string[],types?:string[],life?:number,size?:[number,number]}} spec
   */
  function spawnWave(spec) {
    const {
      x,
      y,
      count,
      angle,
      spread,
      power,
      palette,
      types = ["rect", "ribbon", "star5", "sparkle"],
      life = 5200,
      size = [4, 12],
    } = spec;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = power * (0.55 + Math.random() * 0.9);
      const type = pick(types);
      celebration.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.28,
        age: 0,
        life: life + (Math.random() - 0.5) * 800,
        size: size[0] + Math.random() * (size[1] - size[0]),
        color: pick(palette),
        type,
        twinkle: Math.random() * Math.PI * 2,
        drag: type === "ribbon" ? 0.0018 : 0.0008,
        gravity: type === "sparkle" ? 0.018 : type === "ribbon" ? 0.032 : 0.042,
      });
    }
  }

  function spawnShockwave(x, y, maxR, life, color) {
    celebration.shockwaves.push({ x, y, r: 0, maxR, age: 0, life, color });
  }

  function tickCelebration(dt) {
    const c = celebration;
    for (const p of c.particles) {
      p.age += dt;
      p.vx *= 1 - p.drag * dt;
      p.vy += p.gravity * dt * 0.06;
      p.x += p.vx * dt * 0.06;
      p.y += p.vy * dt * 0.06;
      p.rot += p.vr * dt * 0.06;
      p.twinkle += dt * 0.012;
    }
    c.particles = c.particles.filter((p) => p.age < p.life && p.y < c.h + 60);

    for (const sw of c.shockwaves) {
      sw.age += dt;
      const t = Math.min(1, sw.age / sw.life);
      const easeOut = 1 - Math.pow(1 - t, 3);
      sw.r = sw.maxR * easeOut;
    }
    c.shockwaves = c.shockwaves.filter((sw) => sw.age < sw.life);
  }

  function drawStar5(ctx, size) {
    const outer = size;
    const inner = size * 0.45;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawSparkle(ctx, size) {
    const l = size;
    const t = size * 0.18;
    ctx.beginPath();
    ctx.moveTo(0, -l);
    ctx.lineTo(t, -t);
    ctx.lineTo(l, 0);
    ctx.lineTo(t, t);
    ctx.lineTo(0, l);
    ctx.lineTo(-t, t);
    ctx.lineTo(-l, 0);
    ctx.lineTo(-t, -t);
    ctx.closePath();
  }

  function drawCelebration() {
    const c = celebration;
    if (!c.ctx) return;
    c.ctx.clearRect(0, 0, c.w, c.h);

    for (const sw of c.shockwaves) {
      const t = Math.min(1, sw.age / sw.life);
      const alpha = (1 - t) * 0.8;
      c.ctx.save();
      c.ctx.lineWidth = 2 + 8 * (1 - t);
      c.ctx.strokeStyle = `rgba(216, 180, 254, ${alpha * 0.35})`;
      c.ctx.shadowBlur = 36;
      c.ctx.shadowColor = "rgba(192, 132, 252, 0.8)";
      c.ctx.beginPath();
      c.ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      c.ctx.stroke();
      c.ctx.lineWidth = 1.4;
      c.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      c.ctx.shadowBlur = 0;
      c.ctx.stroke();
      c.ctx.restore();
    }

    for (const p of c.particles) {
      const lifeFrac = p.age / p.life;
      const fadeIn = Math.min(1, p.age / 120);
      const fadeOut = Math.max(0, 1 - Math.max(0, lifeFrac - 0.65) / 0.35);
      let alpha = fadeIn * fadeOut;
      if (p.type === "sparkle") {
        alpha *= 0.55 + 0.45 * Math.abs(Math.sin(p.twinkle * 1.4));
      }
      if (alpha <= 0.02) continue;
      c.ctx.save();
      c.ctx.globalAlpha = alpha;
      c.ctx.translate(p.x, p.y);
      c.ctx.rotate(p.rot);
      c.ctx.fillStyle = p.color;
      if (p.type === "rect") {
        const w = p.size;
        const h = p.size * 1.8;
        c.ctx.fillRect(-w / 2, -h / 2, w, h);
      } else if (p.type === "ribbon") {
        const w = p.size * 0.5;
        const h = p.size * 3.2;
        c.ctx.fillRect(-w / 2, -h / 2, w, h);
      } else if (p.type === "star5") {
        c.ctx.shadowBlur = 14;
        c.ctx.shadowColor = p.color;
        drawStar5(c.ctx, p.size * 0.9);
        c.ctx.fill();
      } else if (p.type === "sparkle") {
        c.ctx.shadowBlur = 20;
        c.ctx.shadowColor = p.color;
        drawSparkle(c.ctx, p.size * 1.1);
        c.ctx.fill();
      }
      c.ctx.restore();
    }
  }

  window.addEventListener("resize", resizeCelebrationCanvas);

  function burstConfetti(intensity) {
    if (!celebration.canvas) return;
    resizeCelebrationCanvas();
    const w = celebration.w;
    const h = celebration.h;

    if (intensity === "high") {
      // Grand prize: multi-wave cinematic ~7s
      document.body.classList.add("is-grand-win");
      const cx = w / 2;
      const cy = h * 0.55;

      // Big shockwave from center
      spawnShockwave(cx, cy, Math.max(w, h) * 0.9, 1400);
      setTimeout(() => spawnShockwave(cx, cy, Math.max(w, h) * 0.6, 1100), 260);

      // Wave 1 — center-bottom upward fountain
      spawnWave({
        x: cx,
        y: h + 10,
        count: 110,
        angle: -Math.PI / 2,
        spread: Math.PI * 0.75,
        power: 26,
        palette: PALETTES.grand,
        types: ["rect", "ribbon", "star5", "sparkle"],
        life: 5600,
        size: [5, 13],
      });
      // Wave 2 — left side cannon after 420ms
      setTimeout(() => {
        spawnWave({
          x: -10,
          y: h * 0.82,
          count: 75,
          angle: -Math.PI / 4,
          spread: Math.PI * 0.35,
          power: 30,
          palette: PALETTES.grand,
          types: ["rect", "ribbon", "star5", "sparkle"],
          life: 5200,
          size: [5, 12],
        });
      }, 420);
      // Wave 3 — right side cannon
      setTimeout(() => {
        spawnWave({
          x: w + 10,
          y: h * 0.82,
          count: 75,
          angle: (-Math.PI * 3) / 4,
          spread: Math.PI * 0.35,
          power: 30,
          palette: PALETTES.grand,
          types: ["rect", "ribbon", "star5", "sparkle"],
          life: 5200,
          size: [5, 12],
        });
      }, 820);
      // Wave 4 — top-center soft drift
      setTimeout(() => {
        spawnWave({
          x: cx,
          y: -10,
          count: 70,
          angle: Math.PI / 2,
          spread: Math.PI * 0.9,
          power: 8,
          palette: PALETTES.grand,
          types: ["rect", "sparkle", "star5"],
          life: 5800,
          size: [4, 10],
        });
      }, 1600);
      // Wave 5 — lingering twinkle dust
      setTimeout(() => {
        spawnWave({
          x: cx,
          y: h * 0.35,
          count: 55,
          angle: -Math.PI / 2,
          spread: Math.PI,
          power: 6,
          palette: ["#fff4c9", "#f6e8ff", "#ffffff", "#d8b4fe"],
          types: ["sparkle"],
          life: 3800,
          size: [3, 7],
        });
      }, 3200);

      celebration.hardStopAt = performance.now() + 7500;
      setTimeout(() => document.body.classList.remove("is-grand-win"), 7200);
    } else if (intensity === "medium") {
      // Runner-up: single burst ~3s
      const cx = w / 2;
      const cy = h * 0.6;
      spawnShockwave(cx, cy, Math.max(w, h) * 0.5, 900);
      spawnWave({
        x: cx,
        y: h + 10,
        count: 70,
        angle: -Math.PI / 2,
        spread: Math.PI * 0.7,
        power: 22,
        palette: PALETTES.runner,
        types: ["rect", "ribbon"],
        life: 3000,
        size: [4, 10],
      });
      celebration.hardStopAt = performance.now() + 3400;
    } else if (intensity === "low") {
      // 3rd / participation: lighter burst
      const cx = w / 2;
      spawnWave({
        x: cx,
        y: h + 8,
        count: 40,
        angle: -Math.PI / 2,
        spread: Math.PI * 0.55,
        power: 15,
        palette: PALETTES.third,
        types: ["rect", "sparkle"],
        life: 2400,
        size: [3, 8],
      });
      celebration.hardStopAt = performance.now() + 2800;
    } else {
      return;
    }

    ensureLoop();
  }

  const TIER_MESSAGE_VARIANTS = new Set([
    "message--grand",
    "message--runner",
    "message--third",
  ]);

  /**
   * Render `text` into `messageEl`.
   *
   * For tier variants (grand / runner / third) each character is wrapped in a
   * `.message__ch` span exposing a `--i` index so CSS can stagger per-char
   * reveal animations. Everything else falls back to plain text.
   *
   * Additional semantic classes (message--win / message--tier / message--lose)
   * may be passed alongside a tier variant for color/weight.
   */
  function setMessage(text, ...variants) {
    messageEl.className = "message";

    const tierVariant = variants.find((v) => TIER_MESSAGE_VARIANTS.has(v));

    if (tierVariant && text) {
      messageEl.textContent = "";
      const frag = document.createDocumentFragment();
      const chars = Array.from(text);
      let visibleIndex = 0;
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const span = document.createElement("span");
        span.className = "message__ch";
        if (ch === " ") {
          span.classList.add("message__ch--space");
          span.textContent = "\u00A0";
        } else {
          span.textContent = ch;
        }
        span.style.setProperty("--i", String(visibleIndex));
        frag.appendChild(span);
        visibleIndex += 1;
      }
      messageEl.appendChild(frag);
    } else {
      messageEl.textContent = text;
    }

    for (const v of variants) {
      if (v) messageEl.classList.add(v);
    }
  }

  function highlightWin(mode) {
    reelsEl.querySelectorAll(".reel-wrap").forEach((w) => {
      w.classList.remove("is-win", "is-win--soft");
      if (mode === "grand") w.classList.add("is-win");
      if (mode === "runner") w.classList.add("is-win--soft");
    });
  }

  /** Mirrors production odds feel: mix of wins / near-miss / miss (HKCC tier rules). */
  function pickSpinTier() {
    const r = Math.random();
    if (r < 0.14) return "grand";
    if (r < 0.32) return "runner";
    if (r < 0.52) return "third";
    return "miss";
  }

  function reelTargetsForTier(tier) {
    const g = TIER_SYMBOL.grand;
    const r = TIER_SYMBOL.runner;
    const t = TIER_SYMBOL.third;
    if (tier === "grand") return [g, g, g, g];
    if (tier === "runner") return [r, r, r, r];
    if (tier === "third") return [t, t, t, t];
    const base = [g, r, t, MISS_INDEX];
    for (let i = base.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [base[i], base[j]] = [base[j], base[i]];
    }
    return base;
  }

  function runSpin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    document.body.classList.remove("is-grand-win");

    setMessage("Spinning…");
    highlightWin(null);

    const tier = pickSpinTier();
    const targets = reelTargetsForTier(tier);
    let finished = 0;

    for (let i = 0; i < REEL_COUNT; i++) {
      spinReel(i, targets[i], () => {
        finished += 1;
        if (finished < REEL_COUNT) return;

        if (tier === "grand") {
          lastWinEl.textContent = "1st";
          setMessage(
            "Grand prize — four diamonds. See staff to claim your HKCC 1st prize.",
            "message--win",
            "message--grand"
          );
          highlightWin("grand");
          burstConfetti("high");
        } else if (tier === "runner") {
          lastWinEl.textContent = "2nd";
          setMessage(
            "Runner-up — four stars. See staff for your HKCC 2nd prize.",
            "message--win",
            "message--runner"
          );
          highlightWin("runner");
          burstConfetti("medium");
        } else if (tier === "third") {
          lastWinEl.textContent = "3rd";
          setMessage("Third prize — thanks for playing.", "message--tier", "message--third");
          highlightWin("runner");
          burstConfetti("low");
        } else {
          lastWinEl.textContent = "—";
          setMessage(
            "No win this spin — line up four of a kind for HKCC prizes. Try again!",
            "message--lose"
          );
          highlightWin(null);
        }

        spinning = false;
        spinBtn.disabled = false;
      });
    }
  }

  function onResize() {
    syncStripTransforms(false);
  }

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(onResize);
  });

  creditsEl.textContent = String(credits);
  lastWinEl.textContent = "—";
  initReels();

  spinBtn.addEventListener("click", runSpin);

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement !== spinBtn && !spinning) {
      e.preventDefault();
      runSpin();
    }
  });
})();
