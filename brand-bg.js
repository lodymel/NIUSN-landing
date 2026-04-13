/**
 * NIUSN brand purple mesh — gradients follow pointer + slow drift.
 * Sets --aura-x / --aura-y / --aura-x2 / --aura-y2 for layered CSS gradients.
 */
(function () {
  const canvas = document.getElementById("brand-bg");
  const root = document.documentElement;
  if (!canvas || !canvas.getContext) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d", { alpha: false });

  /** Official NIUSN purple scale (hex) */
  const P = {
    p08: "#2A0D3D",
    p07: "#380A57",
    brand: "#440270",
    p06: "#893CBD",
    p05: "#A55AD6",
    p04: "#E2B8FF",
    p02: "#EDD1FF",
    p01: "#F3E0FF",
  };

  let w = 0;
  let h = 0;
  let dpr = 1;

  const pointer = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5 };

  if (!reduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const pad = 6;
        const iw = Math.max(1, window.innerWidth);
        const ih = Math.max(1, window.innerHeight);
        if (e.clientX < pad || e.clientY < pad || e.clientX > iw - pad || e.clientY > ih - pad) {
          pointer.tx = 0.5;
          pointer.ty = 0.42;
        } else {
          pointer.tx = e.clientX / iw;
          pointer.ty = e.clientY / ih;
        }
      },
      { passive: true }
    );
  }

  /**
   * Saturated mid / soft highlight blobs — stronger pull = obvious cursor parallax
   */
  const blobs = [
    {
      phase: 0,
      ax: 0.34,
      ay: 0.3,
      rx: 0.24,
      ry: 0.18,
      f1: 0.16,
      f2: 0.21,
      scale: 0.58,
      c0: "rgba(137, 60, 189, 0.38)",
      c1: "rgba(165, 90, 214, 0.26)",
      c2: "rgba(68, 2, 112, 0.12)",
      pull: 0.34,
    },
    {
      phase: 2.1,
      ax: 0.74,
      ay: 0.34,
      rx: 0.2,
      ry: 0.19,
      f1: 0.14,
      f2: 0.19,
      scale: 0.5,
      c0: "rgba(165, 90, 214, 0.32)",
      c1: "rgba(137, 60, 189, 0.2)",
      c2: "rgba(56, 10, 87, 0.1)",
      pull: 0.28,
    },
    {
      phase: 3.85,
      ax: 0.48,
      ay: 0.66,
      rx: 0.25,
      ry: 0.17,
      f1: 0.12,
      f2: 0.17,
      scale: 0.6,
      c0: "rgba(226, 184, 255, 0.22)",
      c1: "rgba(165, 90, 214, 0.18)",
      c2: "rgba(68, 2, 112, 0.08)",
      pull: 0.24,
    },
    {
      phase: 1.3,
      ax: 0.1,
      ay: 0.5,
      rx: 0.19,
      ry: 0.21,
      f1: 0.15,
      f2: 0.13,
      scale: 0.44,
      c0: "rgba(68, 2, 112, 0.45)",
      c1: "rgba(137, 60, 189, 0.22)",
      c2: "rgba(42, 13, 61, 0.1)",
      pull: 0.38,
    },
    {
      phase: 3.2,
      ax: 0.52,
      ay: 0.18,
      rx: 0.16,
      ry: 0.14,
      f1: 0.18,
      f2: 0.15,
      scale: 0.38,
      c0: "rgba(243, 224, 255, 0.14)",
      c1: "rgba(226, 184, 255, 0.12)",
      c2: "rgba(165, 90, 214, 0.06)",
      pull: 0.42,
    },
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(window.innerWidth * dpr));
    h = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }

  function drawBase(px, py) {
    const dx = (px - 0.5) * 0.22;
    const dy = (py - 0.5) * 0.18;
    const x0 = w * (0.02 + dx);
    const y0 = h * (0.04 + dy);
    const x1 = w * (0.98 - dx * 0.6);
    const y1 = h * (1.06 - dy * 0.4);
    const base = ctx.createLinearGradient(x0, y0, x1, y1);
    base.addColorStop(0, P.p08);
    base.addColorStop(0.28, P.p07);
    base.addColorStop(0.52, "#2a0f3a");
    base.addColorStop(0.72, P.brand);
    base.addColorStop(1, "#16081f");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
  }

  function paintBlob(b, i, elapsed, px, py) {
    const t1 = elapsed * b.f1 + b.phase;
    const t2 = elapsed * b.f2 + b.phase * 1.2;
    const pullX = (px - 0.5) * b.pull;
    const pullY = (py - 0.5) * b.pull;
    const cx =
      w *
      (b.ax + Math.sin(t1) * b.rx + Math.cos(t2 * 0.88) * b.rx * 0.38 + pullX * (0.88 + i * 0.04));
    const cy =
      h *
      (b.ay + Math.cos(t1 * 0.88) * b.ry + Math.sin(t2) * b.ry * 0.4 + pullY * (0.88 + i * 0.04));
    const pulse = 1 + Math.sin(elapsed * 0.44 + i) * 0.06;
    const r = Math.min(w, h) * b.scale * pulse;

    const breathe = 0.88 + Math.sin(elapsed * 0.5 + i * 1.4) * 0.12;
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, withAlphaScale(b.c0, breathe));
    rg.addColorStop(0.22, withAlphaScale(b.c1, breathe * 0.92));
    rg.addColorStop(0.48, withAlphaScale(b.c2, breathe * 0.75));
    rg.addColorStop(0.78, "rgba(42, 13, 61, 0.06)");
    rg.addColorStop(1, "rgba(26, 8, 32, 0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  function withAlphaScale(rgba, scale) {
    const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (!m) return rgba;
    const a = Math.min(1, parseFloat(m[4]) * scale);
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a.toFixed(3)})`;
  }

  function softVignette(px, py) {
    const cx = w * (0.5 + (px - 0.5) * 0.08);
    const cy = h * (0.48 + (py - 0.5) * 0.06);
    const rad = Math.max(w, h) * 0.84;
    const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    vg.addColorStop(0, "rgba(42, 13, 61, 0)");
    vg.addColorStop(0.62, "rgba(26, 8, 38, 0.08)");
    vg.addColorStop(1, "rgba(12, 4, 20, 0.38)");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  function clampPct(v) {
    return Math.min(100, Math.max(0, v));
  }

  function syncAuraCss() {
    const xp = clampPct(pointer.x * 100);
    const yp = clampPct(pointer.y * 100);
    root.style.setProperty("--aura-x", `${xp.toFixed(2)}%`);
    root.style.setProperty("--aura-y", `${yp.toFixed(2)}%`);
    const dx = (pointer.x - 0.5) * 38;
    const dy = (pointer.y - 0.5) * 32;
    root.style.setProperty("--aura-x2", `${clampPct(xp + dx * 0.35).toFixed(2)}%`);
    root.style.setProperty("--aura-y2", `${clampPct(yp + dy * 0.28 - 6).toFixed(2)}%`);
  }

  function drawStatic() {
    drawBase(0.5, 0.5);
    blobs.forEach((b, i) => {
      paintBlob(b, i, 0, 0.5, 0.5);
    });
    softVignette(0.5, 0.5);
    root.style.setProperty("--aura-x", "50%");
    root.style.setProperty("--aura-y", "42%");
    root.style.setProperty("--aura-x2", "58%");
    root.style.setProperty("--aura-y2", "36%");
  }

  let raf = 0;
  let t0 = performance.now();

  /** Snappier follow so gradient “tracks” the cursor clearly */
  const POINTER_LERP = 0.092;

  function drawFrame(t) {
    if (document.hidden) {
      raf = 0;
      return;
    }
    const elapsed = (t - t0) / 1000;

    if (!reduced) {
      pointer.x += (pointer.tx - pointer.x) * POINTER_LERP;
      pointer.y += (pointer.ty - pointer.y) * POINTER_LERP;
      syncAuraCss();
    }

    drawBase(pointer.x, pointer.y);
    blobs.forEach((b, i) => {
      paintBlob(b, i, elapsed, pointer.x, pointer.y);
    });
    softVignette(pointer.x, pointer.y);

    raf = requestAnimationFrame(drawFrame);
  }

  resize();
  if (reduced) {
    drawStatic();
  } else {
    raf = requestAnimationFrame(drawFrame);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduced) drawStatic();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!reduced && !raf) {
      t0 = performance.now();
      raf = requestAnimationFrame(drawFrame);
    }
  });
})();
