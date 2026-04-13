(function () {
  const siteHeader = document.querySelector(".site-header");
  function syncHeaderScrolled() {
    if (!siteHeader) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    siteHeader.classList.toggle("is-scrolled", y > 24);
  }

  /** Real header height → mobile full-screen nav `top` / `min-height` (wrap, safe area, font load). */
  function syncHeaderOffsetVar() {
    if (!siteHeader) return;
    const h = siteHeader.getBoundingClientRect().height;
    if (h > 0) {
      document.documentElement.style.setProperty("--header-h", `${Math.round(h * 100) / 100}px`);
    }
  }

  syncHeaderScrolled();
  syncHeaderOffsetVar();
  window.addEventListener("scroll", syncHeaderScrolled, { passive: true });
  window.addEventListener("resize", syncHeaderOffsetVar, { passive: true });
  if ("ResizeObserver" in window && siteHeader) {
    new ResizeObserver(() => syncHeaderOffsetVar()).observe(siteHeader);
  }

  const heroCompanyVideo = document.getElementById("hero-company-video");
  const soundToggle = document.getElementById("sound-toggle");
  const ambientAudio = document.getElementById("niusn-ambient-audio");

  function readSoundPref() {
    try {
      return localStorage.getItem("niusn-sound") === "1";
    } catch (_) {
      return false;
    }
  }

  let soundOn = readSoundPref();

  function soundStateLabelText() {
    const L = document.documentElement.lang || "en";
    const api = window.NIUSN_I18N;
    if (api && typeof api.t === "function") return api.t(L, soundOn ? "sound.on" : "sound.off");
    return soundOn ? "ON" : "OFF";
  }

  function syncSoundToggleUi() {
    if (!soundToggle) return;
    soundToggle.setAttribute("aria-pressed", soundOn ? "true" : "false");
    soundToggle.classList.toggle("is-sound-on", soundOn);
    const stateEl = soundToggle.querySelector("[data-sound-state-label]");
    if (stateEl) stateEl.textContent = soundStateLabelText();
  }

  function applySoundToMedia() {
    if (heroCompanyVideo) {
      heroCompanyVideo.muted = !soundOn;
      if (soundOn) heroCompanyVideo.removeAttribute("muted");
      else heroCompanyVideo.setAttribute("muted", "");
    }
    if (ambientAudio) {
      if (soundOn) {
        const p = ambientAudio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        ambientAudio.pause();
        ambientAudio.currentTime = 0;
      }
    }
  }

  function setSoundGlobal(on) {
    soundOn = !!on;
    try {
      localStorage.setItem("niusn-sound", soundOn ? "1" : "0");
    } catch (_) {}
    applySoundToMedia();
    syncSoundToggleUi();
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", () => setSoundGlobal(!soundOn));
    document.addEventListener("niusn:lang", () => syncSoundToggleUi());
  }

  if (heroCompanyVideo) {
    heroCompanyVideo.defaultMuted = true;
    heroCompanyVideo.loop = true;
    applySoundToMedia();
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!prm.matches) {
      const tryPlay = () => {
        applySoundToMedia();
        const p = heroCompanyVideo.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };
      tryPlay();
      heroCompanyVideo.addEventListener("pause", () => {
        if (document.visibilityState !== "visible") return;
        if (heroCompanyVideo.ended) return;
        tryPlay();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") tryPlay();
      });
    }
  }

  syncSoundToggleUi();
  applySoundToMedia();

  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const triggers = document.querySelectorAll(".nav-item.has-dropdown .nav-trigger");

  function closeAllDropdowns() {
    document.querySelectorAll(".nav-item.is-open").forEach((el) => {
      el.classList.remove("is-open");
      const btn = el.querySelector(".nav-trigger");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function closeMobileNav() {
    if (nav) nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    closeAllDropdowns();
  }

  document.addEventListener("niusn:close-mobile-nav", closeMobileNav);

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) closeAllDropdowns();
      requestAnimationFrame(() => {
        syncHeaderOffsetVar();
        if (open) {
          requestAnimationFrame(updateNavSpyLine);
        }
      });
    });
  }

  const SPY_SECTION_IDS = ["top", "schedule", "prizes", "what-we-do", "product", "contact"];

  /** After in-nav # click, keep underline on target until scroll catches up (avoids lag vs smooth scroll). */
  let navIntentSectionId = null;
  let navIntentClearTimer = 0;

  function setNavSpyIntent(sectionId) {
    if (!SPY_SECTION_IDS.includes(sectionId)) return;
    navIntentSectionId = sectionId;
    if (navIntentClearTimer) clearTimeout(navIntentClearTimer);
    navIntentClearTimer = setTimeout(() => {
      navIntentClearTimer = 0;
      navIntentSectionId = null;
    }, 2200);
    spyRaf = 0;
    updateNavSpyLine();
  }

  function computeActiveSpySection() {
    const header = document.querySelector(".site-header");
    const offset = (header ? header.getBoundingClientRect().height : 56) + 16;
    const y = (window.scrollY || document.documentElement.scrollTop || 0) + offset;
    let active = "top";
    for (const id of SPY_SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.offsetTop <= y) active = id;
    }
    return active;
  }

  function spyMarkerTarget(navEl, sectionId) {
    if (!navEl) return null;
    /* 스케줄·경품 네비 링크 제거됨 — 해당 구간에서는 이벤트 홈(#top) 링크에 밑줄 */
    if (sectionId === "top" || sectionId === "schedule" || sectionId === "prizes") {
      return navEl.querySelector('a[href="#top"]');
    }
    const hrefMap = {
      "what-we-do": 'a[href="#what-we-do"]',
      product: 'a[href="#product"]',
      contact: 'a[href="#contact"]',
    };
    const sel = hrefMap[sectionId];
    return sel ? navEl.querySelector(sel) : null;
  }

  function sectionIdForNavLine() {
    if (navIntentSectionId && SPY_SECTION_IDS.includes(navIntentSectionId)) {
      const scrolledTo = computeActiveSpySection();
      if (scrolledTo === navIntentSectionId) {
        navIntentSectionId = null;
        if (navIntentClearTimer) {
          clearTimeout(navIntentClearTimer);
          navIntentClearTimer = 0;
        }
      } else {
        return navIntentSectionId;
      }
    }
    return computeActiveSpySection();
  }

  function updateNavSpyLine() {
    if (!nav) return;
    const line = nav.querySelector(".nav-active-line");
    if (!line) return;

    const mqMobile = window.matchMedia("(max-width: 768px)");
    if (mqMobile.matches && !nav.classList.contains("is-open")) {
      nav.classList.remove("nav-has-active-line");
      line.style.opacity = "0";
      return;
    }

    const sectionId = sectionIdForNavLine();
    const target = spyMarkerTarget(nav, sectionId);
    if (!target) return;

    const navRect = nav.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const left = tRect.left - navRect.left + nav.scrollLeft;
    const width = Math.max(20, tRect.width);

    line.style.left = `${left}px`;
    line.style.width = `${width}px`;

    if (mqMobile.matches) {
      line.style.bottom = "auto";
      line.style.top = `${tRect.top - navRect.top + tRect.height - 3}px`;
    } else {
      line.style.top = "auto";
      line.style.bottom = "0";
    }

    nav.classList.add("nav-has-active-line");
  }

  let spyRaf = 0;
  function scheduleNavSpyUpdate() {
    if (spyRaf) return;
    spyRaf = requestAnimationFrame(() => {
      spyRaf = 0;
      updateNavSpyLine();
    });
  }

  window.addEventListener("scroll", scheduleNavSpyUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavSpyUpdate);
  window.addEventListener("hashchange", () => {
    const h = (location.hash || "").replace(/^#/, "");
    if (h && SPY_SECTION_IDS.includes(h)) setNavSpyIntent(h);
    else {
      spyRaf = 0;
      updateNavSpyLine();
    }
  });
  window.addEventListener("niusn:lang", scheduleNavSpyUpdate);
  nav?.addEventListener("scroll", scheduleNavSpyUpdate, { passive: true });

  scheduleNavSpyUpdate();

  nav?.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        if (SPY_SECTION_IDS.includes(id)) setNavSpyIntent(id);
      }
      closeMobileNav();
    });
  });

  document.querySelector('a.logo[href="#top"]')?.addEventListener("click", () => {
    setNavSpyIntent("top");
  });

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".nav-item");
      const willOpen = !item.classList.contains("is-open");
      closeAllDropdowns();
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item.has-dropdown")) closeAllDropdowns();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileNav();
    }
  });

  const countdownEl = document.getElementById("countdown");
  const countdownDock = document.getElementById("countdown-dock");
  const countdownDockInner = document.getElementById("countdown-dock-inner");
  const heroCountdownSection = document.getElementById("hero-countdown");

  if (countdownEl) {
    const targetStr = countdownEl.getAttribute("data-target");
    const target = targetStr ? Date.parse(targetStr) : NaN;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function countdownLbl() {
      const lang = document.documentElement.lang || "ko";
      const M = {
        ko: { Days: "일", Hrs: "시", Min: "분", Sec: "초" },
        en: { Days: "Days", Hrs: "Hrs", Min: "Min", Sec: "Sec" },
        "zh-Hans": { Days: "天", Hrs: "时", Min: "分", Sec: "秒" },
        "zh-Hant": { Days: "天", Hrs: "時", Min: "分", Sec: "秒" },
      };
      return M[lang] || M.ko;
    }

    function buildCountdownHtml() {
      if (!Number.isFinite(target)) {
        return '<span class="unit"><span class="num">—</span><span class="lbl"></span></span>';
      }
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / 86400000);
      diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000);
      diff -= hours * 3600000;
      const minutes = Math.floor(diff / 60000);
      diff -= minutes * 60000;
      const seconds = Math.floor(diff / 1000);

      const L = countdownLbl();
      return [
        { num: pad(days), lbl: L.Days },
        { num: pad(hours), lbl: L.Hrs },
        { num: pad(minutes), lbl: L.Min },
        { num: pad(seconds), lbl: L.Sec },
      ]
        .map(
          (u) =>
            `<span class="unit"><span class="num">${u.num}</span><span class="lbl">${u.lbl}</span></span>`
        )
        .join("");
    }

    function tick() {
      if (!Number.isFinite(target)) {
        const msg = "목표 시각이 없습니다.";
        countdownEl.textContent = msg;
        if (countdownDockInner) countdownDockInner.textContent = msg;
        return;
      }
      const html = buildCountdownHtml();
      countdownEl.innerHTML = html;
      if (countdownDockInner) countdownDockInner.innerHTML = html;
    }

    tick();
    setInterval(tick, 1000);
    window.addEventListener("niusn:lang", tick);

    if (countdownDock && heroCountdownSection && "IntersectionObserver" in window) {
      const syncDock = ([entry]) => {
        const hh = siteHeader ? siteHeader.getBoundingClientRect().height : 52;
        const past = entry.boundingClientRect.bottom < hh + 10;
        if (past) {
          countdownDock.classList.add("is-visible");
          countdownDock.removeAttribute("hidden");
        } else {
          countdownDock.classList.remove("is-visible");
          countdownDock.setAttribute("hidden", "");
        }
      };
      const ioCd = new IntersectionObserver(syncDock, {
        root: null,
        threshold: [0, 0.02, 0.08, 0.15, 0.35, 0.6, 1],
      });
      ioCd.observe(heroCountdownSection);
    }

    if (countdownDock && heroCountdownSection) {
      countdownDock.addEventListener("click", () => {
        heroCountdownSection.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
      countdownDock.style.cursor = "pointer";
    }
  }

  const dialog = document.getElementById("booth-dialog");
  const openers = document.querySelectorAll(".js-open-booth");

  function openBoothMap() {
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
      closeMobileNav();
    }
  }

  openers.forEach((btn) => {
    btn.addEventListener("click", openBoothMap);
  });

  if (dialog) {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.querySelector(".dialog-close")?.addEventListener("click", () => {
      if (dialog.open) dialog.close();
    });
  }

  const wwdCopy = document.querySelector("#what-we-do .wwd-copy");
  const wwdRevealSentinel = document.querySelector(".wwd-description-wrapper");
  const contactHeadlines = document.getElementById("contact-title");
  const contactNaya = document.querySelector(".contact-naya");
  const reduceMotionReveal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let revealLastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let revealScrollDirection = "down";
  function trackRevealScrollDirection() {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y < revealLastScrollY - 2) revealScrollDirection = "up";
    else if (y > revealLastScrollY + 2) revealScrollDirection = "down";
    revealLastScrollY = y;
  }

  if (!reduceMotionReveal && "IntersectionObserver" in window && (wwdCopy || contactNaya)) {
    window.addEventListener("scroll", trackRevealScrollDirection, { passive: true });
  }

  if (wwdCopy) {
    if (reduceMotionReveal || !("IntersectionObserver" in window)) {
      wwdCopy.classList.add("is-revealed", "wwd-copy--was-in-view");
    } else {
      const ioWwd = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) {
            wwdCopy.classList.add("wwd-copy--was-in-view", "is-revealed");
            wwdCopy.classList.toggle("wwd-scroll-up-in", revealScrollDirection === "up");
            wwdCopy.removeAttribute("data-wwd-exit");
          } else {
            wwdCopy.setAttribute("data-wwd-exit", revealScrollDirection === "up" ? "up" : "down");
            wwdCopy.classList.remove("is-revealed", "wwd-scroll-up-in");
          }
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
      );
      const target = wwdRevealSentinel || wwdCopy;
      ioWwd.observe(target);
    }
  }

  if (contactNaya) {
    if (reduceMotionReveal || !("IntersectionObserver" in window)) {
      contactNaya.classList.add("is-revealed");
      if (contactHeadlines) {
        contactHeadlines.classList.add("is-revealed", "wwd-copy--was-in-view");
      }
    } else {
      /* 한 번의 뷰포트 판정으로 태그·카피·폼·헤드라인(단어 reveal) 모두 WWD와 동일하게 in/out */
      const ioContactReveal = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) {
            contactNaya.classList.add("is-revealed");
            if (contactHeadlines && contactHeadlines.classList.contains("wwd-copy--contact-headlines")) {
              contactHeadlines.classList.add("wwd-copy--was-in-view", "is-revealed");
              contactHeadlines.classList.toggle("wwd-scroll-up-in", revealScrollDirection === "up");
              contactHeadlines.removeAttribute("data-wwd-exit");
            }
          } else {
            contactNaya.classList.remove("is-revealed");
            if (contactHeadlines && contactHeadlines.classList.contains("wwd-copy--contact-headlines")) {
              contactHeadlines.setAttribute("data-wwd-exit", revealScrollDirection === "up" ? "up" : "down");
              contactHeadlines.classList.remove("is-revealed", "wwd-scroll-up-in");
            }
          }
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
      );
      ioContactReveal.observe(contactNaya);
    }
  }

  const scrollTopBtn = document.getElementById("scroll-to-top");
  if (scrollTopBtn) {
    const rootEl = document.documentElement;
    let fabHideTimer = null;

    function setScrollTopProgress() {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY || doc.scrollTop || 0;
      const p = maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, y / maxScroll));
      scrollTopBtn.style.setProperty("--scroll-p", String(Math.round(p * 10000) / 100));
    }

    function syncScrollTopFab() {
      const loaded = rootEl.classList.contains("is-loaded");
      const y = window.scrollY || document.documentElement.scrollTop;
      const show = loaded && y > 420;

      setScrollTopProgress();

      if (show) {
        if (fabHideTimer) {
          window.clearTimeout(fabHideTimer);
          fabHideTimer = null;
        }
        scrollTopBtn.removeAttribute("hidden");
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => scrollTopBtn.classList.add("is-visible"));
        });
      } else {
        scrollTopBtn.classList.remove("is-visible");
        if (scrollTopBtn.hasAttribute("hidden")) return;
        if (fabHideTimer) window.clearTimeout(fabHideTimer);
        fabHideTimer = window.setTimeout(() => {
          fabHideTimer = null;
          scrollTopBtn.setAttribute("hidden", "");
        }, 700);
      }
    }

    window.addEventListener("scroll", syncScrollTopFab, { passive: true });
    window.addEventListener("resize", syncScrollTopFab, { passive: true });
    window.addEventListener("niusn:lang", syncScrollTopFab);
    const moFab = new MutationObserver(syncScrollTopFab);
    moFab.observe(rootEl, { attributes: true, attributeFilter: ["class"] });

    scrollTopBtn.addEventListener("click", () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

    syncScrollTopFab();
  }

  const scheduleTabsRoot = document.querySelector("[data-schedule-tabs]");
  if (scheduleTabsRoot) {
    const tablist = scheduleTabsRoot.querySelector('[role="tablist"]');
    const tabs = tablist ? [...tablist.querySelectorAll('[role="tab"]')] : [];
    if (tabs.length) {
      const panels = tabs
        .map((t) => document.getElementById(t.getAttribute("aria-controls") || ""))
        .filter((el) => el instanceof HTMLElement);

      function focusTab(index) {
        const t = tabs[index];
        if (t) t.focus();
      }

      function select(index) {
        const n = tabs.length;
        if (!n) return;
        const i = ((index % n) + n) % n;
        tabs.forEach((tab, j) => {
          const on = j === i;
          tab.classList.toggle("is-active", on);
          tab.setAttribute("aria-selected", on ? "true" : "false");
          tab.tabIndex = on ? 0 : -1;
        });
        panels.forEach((p, j) => {
          if (j === i) p.removeAttribute("hidden");
          else p.setAttribute("hidden", "");
        });
      }

      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => select(i));
        tab.addEventListener("keydown", (e) => {
          const k = e.key;
          if (k === "ArrowRight" || k === "ArrowDown") {
            e.preventDefault();
            const next = (i + 1) % tabs.length;
            select(next);
            focusTab(next);
          } else if (k === "ArrowLeft" || k === "ArrowUp") {
            e.preventDefault();
            const prev = (i - 1 + tabs.length) % tabs.length;
            select(prev);
            focusTab(prev);
          } else if (k === "Home") {
            e.preventDefault();
            select(0);
            focusTab(0);
          } else if (k === "End") {
            e.preventDefault();
            const last = tabs.length - 1;
            select(last);
            focusTab(last);
          }
        });
      });
    }
  }
})();
