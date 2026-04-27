(function () {
  const prm = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prm.matches) {
    document.body.classList.remove("page--cursor");
  } else {
    document.body.classList.add("page--cursor");
  }

  const cur = document.getElementById("bi-cursor");
  const ring = document.getElementById("bi-cursor-ring");
  const tip = document.getElementById("bi-tooltip");
  const mapHost = document.getElementById("biMapSvg");
  const mapScroll = document.getElementById("mapScroll");
  const mapLoading = document.getElementById("biMapLoading");
  let mapWrap = null;

  let mx = 0;
  let my = 0;
  let rx2 = 0;
  let ry2 = 0;
  if (cur && ring && !prm.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        cur.style.left = `${mx}px`;
        cur.style.top = `${my}px`;
      },
      { passive: true }
    );
    (function animRing() {
      rx2 += (mx - rx2) * 0.12;
      ry2 += (my - ry2) * 0.12;
      ring.style.left = `${rx2}px`;
      ring.style.top = `${ry2}px`;
      requestAnimationFrame(animRing);
    })();
  } else if (cur && ring) {
    cur.style.display = "none";
    ring.style.display = "none";
  }

  function bindBoothInteractivity(root) {
    if (!root) return;
    const nodes = root.querySelectorAll("[data-booth]");
    nodes.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const name = el.getAttribute("data-booth");
        if (tip) {
          tip.textContent = name || "";
          tip.classList.add("show");
        }
        if (ring) {
          ring.style.width = "44px";
          ring.style.height = "44px";
          ring.style.borderColor = "rgba(217,70,239,0.55)";
        }
      });
      el.addEventListener(
        "mousemove",
        (e) => {
          if (!tip) return;
          tip.style.left = `${e.clientX + 14}px`;
          tip.style.top = `${e.clientY - 8}px`;
        },
        { passive: true }
      );
      el.addEventListener("mouseleave", () => {
        if (tip) tip.classList.remove("show");
        if (ring) {
          ring.style.width = "30px";
          ring.style.height = "30px";
          ring.style.borderColor = "rgba(167,139,250,0.5)";
        }
      });
    });
  }

  let scale = 1;
  const MIN = 0.5;
  const MAX = 3;
  const STEP = 0.25;

  function setScale(n) {
    scale = n;
    if (!mapWrap) return;
    mapWrap.style.transform = `scale(${scale})`;
    mapWrap.style.transformOrigin = "0 0";
    mapWrap.dataset.scale = String(scale);
  }

  function wireNiusn(niusn) {
    if (!niusn || !mapScroll || !mapWrap) return;
    niusn.setAttribute("tabindex", "0");
    niusn.setAttribute("role", "button");
    niusn.setAttribute("aria-label", "NIUSN booth #3E-D29, zoom in");
    const go = () => {
      setScale(2);
      requestAnimationFrame(() => {
        const s = parseFloat(mapWrap.dataset.scale) || 2;
        mapScroll.scrollTo({
          left: Math.max(0, 661 * s - mapScroll.clientWidth / 2),
          top: Math.max(0, 265 * s - mapScroll.clientHeight / 2),
          behavior: "smooth",
        });
      });
    };
    niusn.addEventListener("click", go);
    niusn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  }

  async function loadMap() {
    if (!mapHost) return;
    const url = new URL("assets/booth-hall3e.svg", document.baseURI).href;
    try {
      const r = await fetch(url, { cache: "force-cache" });
      if (!r.ok) throw new Error("bad status");
      const t = await r.text();
      const doc = new DOMParser().parseFromString(t, "image/svg+xml");
      const err = doc.querySelector("parsererror");
      if (err) throw new Error("parse");
      const svg = doc.documentElement;
      if (mapLoading) mapLoading.remove();
      mapHost.textContent = "";
      mapHost.appendChild(svg);
      mapHost.setAttribute("aria-busy", "false");
      mapWrap = svg;
      if (getComputedStyle(svg).display === "inline") svg.style.display = "block";
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.setAttribute("role", "img");
      setScale(1);
      bindBoothInteractivity(svg);
      wireNiusn(svg.querySelector("#niusnBooth"));
    } catch (_) {
      if (mapLoading) {
        mapLoading.textContent = "Map could not load. Use the site floor image or try again on a local server.";
      }
      mapHost.setAttribute("aria-busy", "false");
    }
  }

  if (mapHost) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadMap, { once: true });
    } else {
      loadMap();
    }
  }

  function zIn() {
    setScale(Math.min(MAX, scale + STEP));
  }
  function zOut() {
    setScale(Math.max(MIN, scale - STEP));
  }
  function zReset() {
    setScale(1);
    if (mapScroll) {
      mapScroll.scrollLeft = 0;
      mapScroll.scrollTop = 0;
    }
  }

  document.getElementById("zoomIn")?.addEventListener("click", zIn);
  document.getElementById("zoomOut")?.addEventListener("click", zOut);
  document.getElementById("zoomReset")?.addEventListener("click", zReset);

  let lastDist = null;
  if (mapScroll) {
    mapScroll.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (lastDist) {
            const delta = (dist - lastDist) * 0.008;
            setScale(Math.min(MAX, Math.max(MIN, scale + delta)));
          }
          lastDist = dist;
        }
      },
      { passive: false }
    );
    mapScroll.addEventListener("touchend", () => {
      lastDist = null;
    });
  }
})();
