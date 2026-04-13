(function () {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let finished = false;

  document.body.classList.add("page-loader-is-active");

  function finish() {
    if (finished) return;
    finished = true;
    root.classList.add("is-loaded");
    loader.classList.add("is-exiting");
    loader.setAttribute("aria-busy", "false");
    const hideAfterMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 220 : 1350;
    window.setTimeout(() => {
      loader.hidden = true;
      loader.setAttribute("aria-hidden", "true");
      document.body.classList.remove("page-loader-is-active");
    }, hideAfterMs);
  }

  function whenDomReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else window.requestAnimationFrame(fn);
  }

  if (reduceMotion) {
    whenDomReady(() => {
      finish();
    });
    return;
  }

  let displayed = 0;
  let loadDone = false;
  const t0 = performance.now();
  const minShowMs = 1500;
  const maxWaitMs = 7200;

  window.addEventListener(
    "load",
    () => {
      loadDone = true;
    },
    { once: true }
  );

  window.setTimeout(() => {
    loadDone = true;
  }, maxWaitMs);

  function tick(now) {
    const elapsed = now - t0;
    const creepTarget = Math.min(86, (elapsed / 2600) * 86);

    if (loadDone) {
      displayed += (100 - displayed) * 0.11;
      if (displayed > 99.65) displayed = 100;
    } else {
      displayed += (creepTarget - displayed) * 0.055;
    }

    const ready = displayed >= 99.98 && elapsed >= minShowMs;

    if (ready) {
      window.requestAnimationFrame(() => finish());
      return;
    }

    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
