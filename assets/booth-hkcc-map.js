/**
 * Vanilla port of map.zip / app.jsx — MapSVG + focus / reset / route behaviour.
 * Expects window.FLOORPLAN and optional window.TWEAK_DEFAULTS.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var WORLD = { w: 1000, h: 800 };

  function el(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs != null && typeof attrs === "object") {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] == null) return;
        n.setAttribute(k, String(attrs[k]));
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c) n.appendChild(c);
    }
    return n;
  }

  function boothCenter(b) {
    return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  }

  function buildRoutePath(from, to) {
    var destCx = to.x + to.w / 2;
    var destCy = to.y + to.h / 2;
    var startY = 740;
    var aisleY = 720;
    var r = 10;
    return (
      "M " +
      from.x +
      " " +
      startY +
      " L " +
      from.x +
      " " +
      (aisleY + r) +
      " Q " +
      from.x +
      " " +
      aisleY +
      " " +
      (from.x + r) +
      " " +
      aisleY +
      " L " +
      (destCx - r) +
      " " +
      aisleY +
      " Q " +
      destCx +
      " " +
      aisleY +
      " " +
      destCx +
      " " +
      (aisleY - r) +
      " L " +
      destCx +
      " " +
      (destCy + to.h / 2 + 6)
    );
  }

  function fitViewBoxCalc(aspect) {
    var contentW = WORLD.w;
    var contentH = WORLD.h;
    var contentAspect = contentW / contentH;
    var w = contentW;
    var h = contentH;
    if (aspect >= contentAspect) w = contentH * aspect;
    else h = contentW / aspect;
    return { x: (contentW - w) / 2, y: (contentH - h) / 2, w: w, h: h };
  }

  function init() {
    var fp = window.FLOORPLAN;
    if (!fp || !fp.booths) return;

    var tweaks = window.TWEAK_DEFAULTS || {};
    var accent = tweaks.accent || "#E9A5F2";
    var showLabels = tweaks.showLabels !== false;

    var DEST = fp.DESTINATION_ID;
    var destBooth = null;
    for (var i = 0; i < fp.booths.length; i++) {
      if (fp.booths[i].id === DEST) {
        destBooth = fp.booths[i];
        break;
      }
    }
    if (!destBooth) return;

    var mapWrap = document.getElementById("mapWrap");
    if (!mapWrap) return;

    var destCenter = boothCenter(destBooth);
    var routeD = buildRoutePath(fp.ENTRANCE, destBooth);

    var svg = el("svg", {
      id: "floorplanSvg",
      class: "map-svg" + (showLabels ? "" : " hide-booth-labels"),
      preserveAspectRatio: "xMidYMid meet",
      role: "img",
      "aria-label": "HKCC 2026 exhibition map — Niusn booth " + DEST,
    });

    var defs = el(
      "defs",
      null,
      el(
        "linearGradient",
        { id: "destGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        el("stop", { offset: "0%", "stop-color": "oklch(0.82 0.20 320)" }),
        el("stop", { offset: "100%", "stop-color": "oklch(0.60 0.22 295)" })
      ),
      el(
        "filter",
        { id: "softGlow", x: "-50%", y: "-50%", width: "200%", height: "200%" },
        el("feGaussianBlur", { stdDeviation: "4", result: "b" }),
        el(
          "feMerge",
          null,
          el("feMergeNode", { in: "b" }),
          el("feMergeNode", { in: "SourceGraphic" })
        )
      ),
      el(
        "filter",
        { id: "bigGlow", x: "-100%", y: "-100%", width: "300%", height: "300%" },
        el("feGaussianBlur", { stdDeviation: "14", result: "b" }),
        el(
          "feMerge",
          null,
          el("feMergeNode", { in: "b" }),
          el("feMergeNode", { in: "SourceGraphic" })
        )
      ),
      el(
        "pattern",
        { id: "grid", width: "20", height: "20", patternUnits: "userSpaceOnUse" },
        el("path", {
          d: "M 20 0 L 0 0 0 20",
          fill: "none",
          stroke: "oklch(0.40 0.03 295)",
          "stroke-width": "0.3",
          opacity: "0.2",
        })
      )
    );

    fp.HALLS.forEach(function (h) {
      var hg = el("g", { class: "hall-group" });
      hg.appendChild(
        el("rect", {
          x: h.x,
          y: h.y,
          width: h.w,
          height: h.h,
          rx: 8,
          ry: 8,
          fill: "url(#grid)",
        })
      );
      hg.appendChild(
        el("rect", {
          class: "hall-fade",
          x: h.x + h.w / 2 - 48,
          y: h.y - 30,
          width: 96,
          height: 22,
          rx: 11,
          ry: 11,
          fill: "oklch(0.20 0.04 290 / 0.96)",
          stroke: "oklch(0.72 0.18 305 / 0.55)",
          "stroke-width": "0.6",
        })
      );
      var ht = el("text", {
        class: "hall-fade",
        x: h.x + h.w / 2,
        y: h.y - 15,
        fill: "oklch(0.94 0.06 315)",
        "font-family": "'Space Grotesk', sans-serif",
        "font-size": "11.5",
        "font-weight": "700",
        "letter-spacing": "0.2em",
        "text-anchor": "middle",
      });
      ht.textContent = h.label.toUpperCase();
      hg.appendChild(ht);
      svg.appendChild(hg);
    });

    var s = fp.MAIN_STAGE;
    var stageG = el("g", { class: "main-stage-fade" });
    stageG.appendChild(
      el("rect", {
        x: s.x,
        y: s.y,
        width: s.w,
        height: s.h,
        rx: 4,
        ry: 4,
        fill: "oklch(0.34 0.10 300)",
        stroke: "oklch(0.68 0.18 305)",
        "stroke-width": "0.8",
      })
    );
    var st1 = el("text", {
      x: s.x + s.w / 2,
      y: s.y + s.h / 2 - 2,
      "text-anchor": "middle",
      fill: "oklch(0.94 0.08 320)",
      "font-family": "'Space Grotesk', sans-serif",
      "font-weight": "600",
      "font-size": "11",
    });
    st1.textContent = s.label;
    stageG.appendChild(st1);
    var st2 = el("text", {
      x: s.x + s.w / 2,
      y: s.y + s.h / 2 + 12,
      "text-anchor": "middle",
      fill: "oklch(0.80 0.08 315)",
      "font-family": "Inter, sans-serif",
      "font-size": "8.5",
    });
    st2.textContent = s.seats;
    svg.appendChild(stageG);

    fp.booths.forEach(function (b) {
      if (b.id === DEST) return;
      var bg = el("g", { class: "booth-group" });
      bg.appendChild(
        el("rect", {
          class: "booth-rect",
          x: b.x,
          y: b.y,
          width: b.w,
          height: b.h,
          rx: 1.5,
          ry: 1.5,
          fill: "oklch(0.38 0.06 300)",
          stroke: "oklch(0.52 0.09 300)",
          "stroke-width": "0.5",
        })
      );
      var shortId = b.id.split("-")[1] || "";
      var numOnly = shortId.replace(/^[A-Z]/, "");
      var label = b.w < 22 ? numOnly : shortId;
      var fontSize = b.w < 22 ? Math.min(6.5, Math.max(5, b.w / 2.4)) : Math.min(6.5, Math.max(5, b.w / 5.5));
      if (!(b.h < 8 || b.w < 10)) {
        var bt = el("text", {
          class: "booth-label",
          x: b.x + b.w / 2,
          y: b.y + b.h / 2 + fontSize * 0.35,
          fill: "oklch(0.88 0.02 295)",
          "font-size": fontSize,
          "text-anchor": "middle",
          "font-family": "'JetBrains Mono', ui-monospace, monospace",
          "font-weight": "500",
        });
        bt.textContent = label;
        bg.appendChild(bt);
      }
      svg.appendChild(bg);
    });

    var routeMain = el("path", {
      class: "route-main",
      d: routeD,
      fill: "none",
      stroke: accent,
      "stroke-width": "2.5",
      "stroke-linecap": "round",
      filter: "drop-shadow(0 0 6px oklch(0.72 0.22 305 / 0.7))",
    });

    var routeGhost = el("path", {
      class: "route-ghost",
      d: routeD,
      fill: "none",
      stroke: "oklch(0.97 0.02 320)",
      "stroke-width": "1",
      "stroke-dasharray": "2 6",
    });
    routeGhost.appendChild(
      el("animate", {
        attributeName: "stroke-dashoffset",
        from: "0",
        to: "-16",
        dur: "1.2s",
        repeatCount: "indefinite",
      })
    );

    svg.appendChild(routeMain);
    svg.appendChild(routeGhost);

    var destG = el("g", { class: "dest-group" });
    for (var ri = 0; ri < 3; ri++) {
      var c = el("circle", {
        cx: destCenter.x,
        cy: destCenter.y,
        r: "20",
        fill: "none",
        stroke: "oklch(0.80 0.22 320)",
        "stroke-width": "1.5",
        opacity: "0",
      });
      c.appendChild(
        el("animate", {
          attributeName: "r",
          from: "16",
          to: "62",
          dur: "2.6s",
          begin: ri * 0.87 + "s",
          repeatCount: "indefinite",
        })
      );
      c.appendChild(
        el("animate", {
          attributeName: "opacity",
          values: "0;0.85;0",
          dur: "2.6s",
          begin: ri * 0.87 + "s",
          repeatCount: "indefinite",
        })
      );
      c.appendChild(
        el("animate", {
          attributeName: "stroke-width",
          values: "2.2;0.3",
          dur: "2.6s",
          begin: ri * 0.87 + "s",
          repeatCount: "indefinite",
        })
      );
      destG.appendChild(c);
    }
    destG.appendChild(
      el("circle", {
        cx: destCenter.x,
        cy: destCenter.y,
        r: "48",
        fill: "oklch(0.72 0.22 305)",
        opacity: "0.22",
        filter: "url(#bigGlow)",
      })
    );
    destG.appendChild(
      el("rect", {
        x: destBooth.x,
        y: destBooth.y,
        width: destBooth.w,
        height: destBooth.h,
        rx: 2,
        ry: 2,
        fill: "url(#destGrad)",
        stroke: "oklch(0.94 0.05 320)",
        "stroke-width": "1",
        filter: "url(#softGlow)",
      })
    );
    destG.appendChild(
      el(
        "g",
        {
          transform: "translate(" + destCenter.x + "," + (destCenter.y - 1.4) + ")",
        },
        el("path", {
          d: "M -2.6 2 L -2.6 -2.6 L 2.6 2 L 2.6 -2.6",
          stroke: "white",
          "stroke-width": "0.9",
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        })
      )
    );
    var wmText = el("text", {
      x: 17,
      y: 2.4,
      "text-anchor": "middle",
      fill: "white",
      "font-family": "'Space Grotesk', sans-serif",
      "font-weight": "700",
      "font-size": "6.4",
      "letter-spacing": "0.12em",
    });
    wmText.textContent = "NIUSN";
    var wm = el(
      "g",
      {
        class: "dest-wordmark",
        transform: "translate(" + (destBooth.x + destBooth.w + 22) + "," + destCenter.y + ")",
      },
      el("rect", {
        x: -2,
        y: -6,
        width: 38,
        height: 12,
        rx: 2.5,
        ry: 2.5,
        fill: "oklch(0.18 0.02 285 / 0.95)",
        stroke: "oklch(0.82 0.18 320 / 0.75)",
        "stroke-width": "0.4",
      }),
      wmText,
      el("path", {
        d: "M -1 0 L -5 0",
        stroke: "oklch(0.82 0.18 320 / 0.75)",
        "stroke-width": "0.6",
      })
    );
    destG.appendChild(wm);
    svg.appendChild(destG);

    var markers = el("g", { class: "markers-fade" });
    function pill(transform, opts) {
      var g = el("g", { transform: transform });
      g.appendChild(
        el("rect", {
          x: opts.px,
          y: opts.py,
          width: opts.pw,
          height: 52,
          rx: 8,
          ry: 8,
          fill: opts.fill,
          stroke: opts.stroke,
          "stroke-width": "1.1",
        })
      );
      g.appendChild(
        el(
          "g",
          { transform: "translate(0,-11)" },
          el("path", {
            d: opts.ad,
            stroke: opts.ast,
            "stroke-width": "1.6",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            fill: "none",
          })
        )
      );
      var tx = el("text", {
        x: 0,
        y: 14,
        fill: opts.tf,
        "font-family": "'Space Grotesk', sans-serif",
        "font-weight": "700",
        "font-size": opts.fs,
        "letter-spacing": opts.ls,
        "text-anchor": "middle",
      });
      tx.textContent = opts.lab;
      g.appendChild(tx);
      return g;
    }
    markers.appendChild(
      pill("translate(" + fp.ENTRANCE.x + "," + fp.ENTRANCE.y + ")", {
        px: -36,
        py: -26,
        pw: 72,
        fill: "oklch(0.34 0.14 300)",
        stroke: "oklch(0.82 0.18 320)",
        ad: "M 0 7 L 0 -7 M -5.5 -1.5 L 0 -7 L 5.5 -1.5",
        ast: "oklch(0.96 0.06 320)",
        tf: "oklch(0.96 0.06 320)",
        lab: "ENTRANCE",
        fs: "8.5",
        ls: "0.22em",
      })
    );
    markers.appendChild(
      pill("translate(" + fp.EXIT.x + "," + fp.EXIT.y + ")", {
        px: -28,
        py: -26,
        pw: 56,
        fill: "oklch(0.22 0.04 290)",
        stroke: "oklch(0.68 0.14 300)",
        ad: "M 0 -7 L 0 7 M -5.5 1.5 L 0 7 L 5.5 1.5",
        ast: "oklch(0.92 0.04 300)",
        tf: "oklch(0.92 0.04 300)",
        lab: "EXIT",
        fs: "9",
        ls: "0.24em",
      })
    );
    svg.appendChild(markers);
    svg.insertBefore(markers, destG);

    svg.insertBefore(defs, svg.firstChild);
    mapWrap.appendChild(svg);

    var pathLen = 0;
    try {
      pathLen = routeMain.getTotalLength() || 1;
    } catch (e) {
      pathLen = 1;
    }

    var aspect = 1000 / 800;
    var vb = { x: 0, y: 0, w: 1000, h: 800 };
    var focused = false;
    var routeDrawn = false;
    var zoomAnimating = false;
    var zoomRaf = null;
    var resetRaf = null;

    function applyVB() {
      svg.setAttribute("viewBox", vb.x + " " + vb.y + " " + vb.w + " " + vb.h);
    }

    function fitVB() {
      return fitViewBoxCalc(aspect);
    }

    function snapToFit() {
      vb = fitVB();
      applyVB();
    }

    function clearRouteDash() {
      routeDrawn = false;
      svg.classList.remove("is-route-drawn");
      routeMain.style.transition = "none";
      routeMain.style.strokeDasharray = String(pathLen);
      routeMain.style.strokeDashoffset = String(pathLen);
    }

    function beginRouteDraw() {
      routeDrawn = true;
      svg.classList.add("is-route-drawn");
      routeMain.style.transition = "none";
      routeMain.style.strokeDasharray = String(pathLen);
      routeMain.style.strokeDashoffset = String(pathLen);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          routeMain.style.transition = "stroke-dashoffset 1.8s cubic-bezier(0.65, 0, 0.35, 1)";
          routeMain.style.strokeDashoffset = "0";
        });
      });
    }

    function runZoomIn() {
      cancelAnimationFrame(zoomRaf);
      var bx = 30;
      var by = 50;
      var bw = 930;
      var bh = 760;
      var boxAspect = bw / bh;
      var vbW;
      var vbH;
      if (aspect >= boxAspect) {
        vbH = bh;
        vbW = bh * aspect;
      } else {
        vbW = bw;
        vbH = bw / aspect;
      }
      var targetVb = {
        x: bx + bw / 2 - vbW / 2,
        y: by + bh / 2 - vbH / 2,
        w: vbW,
        h: vbH,
      };
      var startVb = { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
      var dur = 1400;
      var t0 = performance.now();
      zoomAnimating = true;
      updateFocusBtn();
      function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        vb = {
          x: startVb.x + (targetVb.x - startVb.x) * e,
          y: startVb.y + (targetVb.y - startVb.y) * e,
          w: startVb.w + (targetVb.w - startVb.w) * e,
          h: startVb.h + (targetVb.h - startVb.h) * e,
        };
        applyVB();
        if (p < 1) zoomRaf = requestAnimationFrame(step);
        else {
          zoomAnimating = false;
          beginRouteDraw();
          updateFocusBtn();
        }
      }
      zoomRaf = requestAnimationFrame(step);
    }

    function runResetZoom() {
      cancelAnimationFrame(resetRaf);
      var startVb = { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
      var targetVb = fitVB();
      var dur = 900;
      var t0 = performance.now();
      function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        vb = {
          x: startVb.x + (targetVb.x - startVb.x) * e,
          y: startVb.y + (targetVb.y - startVb.y) * e,
          w: startVb.w + (targetVb.w - startVb.w) * e,
          h: startVb.h + (targetVb.h - startVb.h) * e,
        };
        applyVB();
        if (p < 1) resetRaf = requestAnimationFrame(step);
      }
      resetRaf = requestAnimationFrame(step);
    }

    function setFocused(next) {
      if (next === focused) return;
      focused = next;
      cancelAnimationFrame(zoomRaf);
      cancelAnimationFrame(resetRaf);
      zoomAnimating = false;
      svg.classList.toggle("is-focused", focused);
      if (!focused) {
        clearRouteDash();
        snapToFit();
      } else {
        clearRouteDash();
        runZoomIn();
      }
      updateFocusBtn();
    }

    function updateFocusBtn() {
      var btn = document.getElementById("focusMapBtn");
      var lab = document.getElementById("focusMapBtnLabel");
      if (!btn || !lab) return;
      var busy = zoomAnimating || (focused && routeDrawn);
      btn.disabled = !!busy;
      lab.textContent = busy ? "Showing the way…" : "Show me the way";
    }

    function triggerFocus() {
      setFocused(false);
      setTimeout(function () {
        setFocused(true);
      }, 60);
    }

    function resetView() {
      cancelAnimationFrame(zoomRaf);
      cancelAnimationFrame(resetRaf);
      zoomAnimating = false;
      clearRouteDash();
      svg.classList.remove("is-focused");
      focused = false;
      runResetZoom();
      updateFocusBtn();
    }

    function readAspect() {
      var r = mapWrap.getBoundingClientRect();
      aspect = r.width > 0 && r.height > 0 ? r.width / r.height : 1;
    }

    function onResize() {
      readAspect();
      if (!focused) snapToFit();
      else applyVB();
    }

    var ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize);
      ro.observe(mapWrap);
    } else {
      window.addEventListener("resize", onResize);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onResize);
    }

    readAspect();
    snapToFit();
    clearRouteDash();

    var focusBtn = document.getElementById("focusMapBtn");
    if (focusBtn) focusBtn.addEventListener("click", triggerFocus);
    var resetBtn = document.getElementById("resetMapBtn");
    if (resetBtn) resetBtn.addEventListener("click", resetView);

    window.__resetMapView = resetView;

    setTimeout(function () {
      setFocused(true);
    }, 900);

    updateFocusBtn();

    window.addEventListener(
      "beforeunload",
      function () {
        if (ro) ro.disconnect();
        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", onResize);
          window.visualViewport.removeEventListener("scroll", onResize);
        }
        window.__resetMapView = undefined;
      },
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
