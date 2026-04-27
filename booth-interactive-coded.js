/* NIUSN coded floor plan — interactivity (zoom, pan focus, booth hover).
 * Also generates neighboring booth tiles around the NIUSN highlight so the
 * hall feels populated without requiring static imagery. */
(function () {
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const cur = document.getElementById('bi-cursor');
  const ring = document.getElementById('bi-cursor-ring');
  const tip = document.getElementById('bi-tooltip');
  const wrap = document.getElementById('codedMapWrap');
  const svg = document.getElementById('codedMap');
  const scroll = document.getElementById('mapScroll');
  const hudScale = document.getElementById('hudScale');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const zoomResetBtn = document.getElementById('zoomReset');
  if (!wrap || !svg) return;

  // ---- Cursor ----
  if (cur && ring && !prm.matches && hasFinePointer) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    }, { passive: true });
    (function anim() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(anim);
    })();
  } else if (cur && ring) {
    cur.style.display = 'none';
    ring.style.display = 'none';
  }

  // ---- Generate neighboring booths ----
  const boothsGroup = svg.querySelector('#booths');
  // grid definition: 4 zone columns × 2 rows (A/B/C/D top, E/F/G/H bottom)
  const zones = [
    { id: 'A', x0: 60,  y0: 60,  w: 258, h: 318, cells: [3, 4] },
    { id: 'B', x0: 346, y0: 60,  w: 280, h: 318, cells: [3, 4] },
    { id: 'C', x0: 654, y0: 60,  w: 266, h: 318, cells: [3, 4] },
    { id: 'D', x0: 948, y0: 60,  w: 192, h: 318, cells: [2, 4], skip: { r: 2, c: 1 } }, // NIUSN sits here
    { id: 'E', x0: 60,  y0: 422, w: 258, h: 358, cells: [3, 4] },
    { id: 'F', x0: 346, y0: 422, w: 280, h: 358, cells: [3, 4] },
    { id: 'G', x0: 654, y0: 422, w: 266, h: 358, cells: [3, 4] },
    { id: 'H', x0: 948, y0: 422, w: 192, h: 358, cells: [2, 4] },
  ];
  const PAD_X = 10, PAD_Y = 10, GAP = 8;
  const NS = 'http://www.w3.org/2000/svg';
  const boothCounter = {};
  zones.forEach((z) => {
    const [cols, rows] = z.cells;
    const cellW = (z.w - PAD_X * 2 - GAP * (cols - 1)) / cols;
    const cellH = (z.h - PAD_Y * 2 - GAP * (rows - 1)) / rows;
    boothCounter[z.id] = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (z.skip && z.skip.r === r && z.skip.c === c) continue;
        boothCounter[z.id] += 1;
        const n = String(boothCounter[z.id]).padStart(2, '0');
        const x = z.x0 + PAD_X + c * (cellW + GAP);
        const y = z.y0 + PAD_Y + r * (cellH + GAP);
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('transform', `translate(${x} ${y})`);
        g.setAttribute('data-booth', `#3E-${z.id}${n}`);
        g.classList.add('booth-unit');

        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('class', 'booth-tile');
        rect.setAttribute('width', cellW);
        rect.setAttribute('height', cellH);
        rect.setAttribute('rx', '4');
        rect.setAttribute('fill', 'url(#cBoothGrad)');
        rect.setAttribute('stroke', 'rgba(165,90,214,0.26)');
        rect.setAttribute('stroke-width', '1');
        g.appendChild(rect);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', cellW / 2);
        label.setAttribute('y', cellH / 2 + 4);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-family', 'IBM Plex Mono, monospace');
        label.setAttribute('font-size', Math.max(8, Math.min(11, cellW / 8)));
        label.setAttribute('fill', 'rgba(196,181,253,0.55)');
        label.setAttribute('letter-spacing', '0.14em');
        label.setAttribute('pointer-events', 'none');
        label.textContent = `${z.id}${n}`;
        g.appendChild(label);

        boothsGroup.appendChild(g);
      }
    }
  });

  // ---- Booth tooltip/hover ----
  function bindBoothInteractivity(root) {
    root.querySelectorAll('[data-booth]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const name = el.getAttribute('data-booth') || '';
        if (tip) { tip.textContent = name; tip.classList.add('show'); }
        if (ring) {
          ring.style.width = '44px'; ring.style.height = '44px';
          ring.style.borderColor = 'rgba(217,70,239,0.55)';
        }
      });
      el.addEventListener('mousemove', (e) => {
        if (!tip) return;
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top = (e.clientY - 8) + 'px';
      }, { passive: true });
      el.addEventListener('mouseleave', () => {
        if (tip) tip.classList.remove('show');
        if (ring) {
          ring.style.width = '30px'; ring.style.height = '30px';
          ring.style.borderColor = 'rgba(167,139,250,0.5)';
        }
      });
    });
  }
  bindBoothInteractivity(svg);

  // ---- Zoom / pan focus ----
  let scale = 1;
  const MIN = 0.6, MAX = 3, STEP = 0.25;
  function setScale(n) {
    scale = Math.max(MIN, Math.min(MAX, n));
    wrap.style.transform = `scale(${scale})`;
    if (hudScale) hudScale.textContent = scale.toFixed(2) + '×';
  }
  zoomInBtn && zoomInBtn.addEventListener('click', () => setScale(scale + STEP));
  zoomOutBtn && zoomOutBtn.addEventListener('click', () => setScale(scale - STEP));
  zoomResetBtn && zoomResetBtn.addEventListener('click', () => {
    setScale(1);
    if (scroll) scroll.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  });

  // Tap NIUSN booth → zoom & center
  const niusnBooth = svg.querySelector('#niusnBooth');
  const NIUSN_CENTER_X = 1050, NIUSN_CENTER_Y = 300; // matches transform in SVG
  function focusNiusn() {
    setScale(1.9);
    requestAnimationFrame(() => {
      if (!scroll || !wrap) return;
      const bb = svg.getBoundingClientRect();
      const vw = svg.viewBox.baseVal.width || 1200;
      const ratio = (bb.width / vw) * scale; // scaled pixels per viewBox unit
      const targetX = NIUSN_CENTER_X * ratio - scroll.clientWidth / 2;
      const targetY = NIUSN_CENTER_Y * ratio - scroll.clientHeight / 2;
      scroll.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: 'smooth' });
    });
  }
  if (niusnBooth) {
    niusnBooth.addEventListener('click', focusNiusn);
    niusnBooth.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusNiusn(); }
    });
  }

  setScale(1);
})();
