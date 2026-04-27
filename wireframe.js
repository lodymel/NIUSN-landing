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

  const heroSection = document.getElementById("top");
  let heroEventParallaxRaf = 0;
  function syncHeroEventParallax() {
    if (!heroSection) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroSection.style.removeProperty("--hero-event-y");
      return;
    }
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const drift = Math.min(18, Math.round(y * 0.038 * 100) / 100);
    heroSection.style.setProperty("--hero-event-y", `${drift}px`);
  }
  function scheduleHeroEventParallax() {
    if (!heroSection) return;
    if (heroEventParallaxRaf) return;
    heroEventParallaxRaf = requestAnimationFrame(() => {
      heroEventParallaxRaf = 0;
      syncHeroEventParallax();
    });
  }
  if (heroSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", scheduleHeroEventParallax, { passive: true });
    window.addEventListener("resize", scheduleHeroEventParallax, { passive: true });
    scheduleHeroEventParallax();
  }

  const heroCompanyVideo =
    document.getElementById("hero-trailer") || document.getElementById("hero-company-video");
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
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prm.matches) {
      heroCompanyVideo.removeAttribute("autoplay");
      heroCompanyVideo.pause();
    } else {
      applySoundToMedia();
      const tryPlay = () => {
        applySoundToMedia();
        const p = heroCompanyVideo.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };
      tryPlay();
      heroCompanyVideo.addEventListener("pause", () => {
        if (document.visibilityState !== "visible") return;
        if (heroCompanyVideo.ended) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        tryPlay();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          tryPlay();
        }
      });
    }
  }

  syncSoundToggleUi();
  applySoundToMedia();

  const nav = document.getElementById("site-nav");
  const headerInner = document.querySelector(".header-inner");
  const toggle = document.querySelector(".nav-toggle");
  const triggers = document.querySelectorAll(".nav-item.has-dropdown .nav-trigger");
  const mqNavMobile = window.matchMedia("(max-width: 768px)");
  let mobileNavScrollLockY = 0;

  function lockMobileNavScroll() {
    if (!mqNavMobile.matches) return;
    mobileNavScrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${mobileNavScrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockMobileNavScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    if (mqNavMobile.matches) {
      window.scrollTo(0, mobileNavScrollLockY);
    }
  }

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
    unlockMobileNavScroll();
  }

  document.addEventListener("niusn:close-mobile-nav", closeMobileNav);

  mqNavMobile.addEventListener("change", (e) => {
    if (!e.matches) closeMobileNav();
  });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) lockMobileNavScroll();
      else {
        unlockMobileNavScroll();
        closeAllDropdowns();
      }
      requestAnimationFrame(() => {
        syncHeaderOffsetVar();
        if (open) {
          requestAnimationFrame(updateNavSpyLine);
        }
      });
    });
  }

  const SPY_SECTION_IDS = ["top", "booth-info", "what-we-do", "contact"];

  /**
   * `.site-header` is `position: sticky` in document flow, so `#top` starts below the header.
   * Native `#top` navigation scrolls that section’s top edge to the viewport origin, which is
   * lower than the first-visit layout at scroll 0 (header + hero). Match home entry by scrolling to 0.
   */
  function scrollToLandingDocumentOrigin(behavior) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : behavior });
  }

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

  function navLinkSelectorForSectionSpy(sectionId) {
    const map = {
      top: 'a[href="#top"]',
      "booth-info": 'a[href="#booth-info"]',
      "what-we-do": 'a[href="#what-we-do"]',
      contact: 'a[href="#contact"]',
    };
    return map[sectionId] || null;
  }

  function spyMarkerTarget(navEl, sectionId) {
    if (!navEl) return null;
    const sel = navLinkSelectorForSectionSpy(sectionId);
    return sel ? navEl.querySelector(sel) : null;
  }

  /** `#site-nav` 아래쪽과 `.header-inner` 바닥 사이 간격 — 활성 라인을 내려 겹침 */
  function navLineFlushBottomPx() {
    if (!headerInner || !nav) return 0;
    const innerRect = headerInner.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    return Math.max(0, Math.round((innerRect.bottom - navRect.bottom) * 100) / 100);
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
      nav.querySelectorAll(".nav-link, .nav-cta").forEach((el) => {
        el.classList.remove("is-active");
      });
      return;
    }

    const sectionId = sectionIdForNavLine();
    const target = spyMarkerTarget(nav, sectionId);
    nav.querySelectorAll(".nav-link, .nav-cta").forEach((el) => {
      el.classList.remove("is-active");
    });
    if (!target) return;
    target.classList.add("is-active");

    const navRect = nav.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const left = tRect.left - navRect.left + nav.scrollLeft;
    const width = Math.max(20, tRect.width);

    line.style.left = `${left}px`;
    line.style.width = `${width}px`;
    line.style.removeProperty("opacity");

    if (mqMobile.matches) {
      line.style.bottom = "auto";
      line.style.top = `${tRect.top - navRect.top + tRect.height - 3}px`;
    } else {
      line.style.top = "auto";
      const flush = navLineFlushBottomPx();
      line.style.bottom = flush > 0 ? `${-flush}px` : "0";
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
  window.visualViewport?.addEventListener("resize", scheduleNavSpyUpdate);
  window.addEventListener("hashchange", () => {
    const h = (location.hash || "").replace(/^#/, "");
    if (h === "top") {
      scrollToLandingDocumentOrigin("auto");
    }
    if (h && SPY_SECTION_IDS.includes(h)) setNavSpyIntent(h);
    else {
      spyRaf = 0;
      updateNavSpyLine();
    }
  });
  window.addEventListener("niusn:lang", scheduleNavSpyUpdate);
  nav?.addEventListener("scroll", scheduleNavSpyUpdate, { passive: true });

  scheduleNavSpyUpdate();

  document.querySelectorAll('a[href="#top"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (location.hash !== "#top") {
        history.pushState(null, "", "#top");
      }
      scrollToLandingDocumentOrigin("smooth");
      setNavSpyIntent("top");
      closeMobileNav();
    });
  });

  nav?.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const href = a.getAttribute("href");
      if (href === "#top") return;
      if (href && href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        if (SPY_SECTION_IDS.includes(id)) setNavSpyIntent(id);
      }
      closeMobileNav();
    });
  });

  if ((location.hash || "").replace(/^#/, "") === "top") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToLandingDocumentOrigin("auto");
      });
    });
  }

  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    if ((location.hash || "").replace(/^#/, "") !== "top") return;
    scrollToLandingDocumentOrigin("auto");
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

  /** Per-line stagger — delays on .wwd-line (--wwd-td) for the line mask reveal. */
  function setWwdLineDelays() {
    if (!wwdCopy) return;
    const step = 0.092;
    const pLines = wwdCopy.querySelectorAll(".wwd-display--primary .wwd-line");
    const sLines = wwdCopy.querySelectorAll(".wwd-display--secondary .wwd-line");
    pLines.forEach((line, i) => {
      line.style.setProperty("--wwd-td", `${(0.04 + i * step).toFixed(3)}s`);
    });
    const sStart = 0.04 + pLines.length * step + 0.055;
    sLines.forEach((line, i) => {
      line.style.setProperty("--wwd-td", `${(sStart + i * step).toFixed(3)}s`);
    });
  }

  setWwdLineDelays();
  window.addEventListener("niusn:lang", setWwdLineDelays, { passive: true });
  const contactHeadlines = document.getElementById("contact-title");
  const contactNaya = document.querySelector(".contact-naya");
  const boothInfoSection = document.getElementById("booth-info");
  const reduceMotionReveal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let revealLastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let revealScrollDirection = "down";
  function trackRevealScrollDirection() {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y < revealLastScrollY - 2) revealScrollDirection = "up";
    else if (y > revealLastScrollY + 2) revealScrollDirection = "down";
    revealLastScrollY = y;
  }

  const stageEventSection = document.getElementById("stage-event");

  if (
    !reduceMotionReveal &&
    "IntersectionObserver" in window &&
    (wwdCopy || contactNaya || boothInfoSection || stageEventSection)
  ) {
    window.addEventListener("scroll", trackRevealScrollDirection, { passive: true });
  }

  const wwdCblockRoot = document.querySelector("[data-wwd-cblock]");
  const wwdSectionEl = document.getElementById("what-we-do");
  const wwdCblockVideo = document.querySelector("[data-wwd-cblock-video]");

  let wwdCblockRaf = 0;
  function syncWwdCblockScrollProgress() {
    if (!wwdCblockRoot || !wwdSectionEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wwdCblockRoot.style.setProperty("--wwd-scroll-p", "0.5");
      return;
    }
    const r = wwdSectionEl.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const h = Math.max(1, r.height);
    const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + h)));
    wwdCblockRoot.style.setProperty("--wwd-scroll-p", String(Math.round(p * 10000) / 10000));
  }

  function scheduleWwdCblockScroll() {
    if (!wwdCblockRoot || !wwdSectionEl) return;
    if (wwdCblockRaf) return;
    wwdCblockRaf = requestAnimationFrame(() => {
      wwdCblockRaf = 0;
      syncWwdCblockScrollProgress();
    });
  }

  if (wwdCblockRoot && wwdSectionEl) {
    syncWwdCblockScrollProgress();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.addEventListener("scroll", scheduleWwdCblockScroll, { passive: true });
      window.addEventListener("resize", scheduleWwdCblockScroll, { passive: true });
    }
    window.addEventListener("niusn:lang", scheduleWwdCblockScroll, { passive: true });
    if (wwdCblockVideo && "IntersectionObserver" in window && !reduceMotionReveal) {
      const ioWwdVid = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) wwdCblockVideo.play().catch(() => {});
            else wwdCblockVideo.pause();
          });
        },
        { root: null, rootMargin: "100px 0px", threshold: 0.02 }
      );
      ioWwdVid.observe(wwdSectionEl);
    } else if (wwdCblockVideo && reduceMotionReveal) {
      wwdCblockVideo.pause();
    } else if (wwdCblockVideo) {
      wwdCblockVideo.muted = true;
      wwdCblockVideo.play().catch(() => {});
    }
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
            wwdCopy.classList.add("wwd-copy--was-in-view");
            wwdCopy.removeAttribute("data-wwd-exit");
            wwdCopy.classList.remove("is-revealed");
            wwdCopy.classList.toggle("wwd-scroll-up-in", revealScrollDirection === "up");
            /* Two rAFs so the browser paints the off-screen start (below vs above) before settling to .is-revealed */
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                wwdCopy.classList.add("is-revealed");
              });
            });
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

  if (boothInfoSection) {
    if (reduceMotionReveal || !("IntersectionObserver" in window)) {
      boothInfoSection.classList.add("is-revealed", "booth-reveal--was-in-view");
    } else {
      const ioBoothReveal = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) {
            boothInfoSection.classList.add("booth-reveal--was-in-view");
            boothInfoSection.classList.toggle("booth-enter-from-up", revealScrollDirection === "up");
            boothInfoSection.removeAttribute("data-booth-exit");
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                boothInfoSection.classList.add("is-revealed");
              });
            });
          } else {
            boothInfoSection.setAttribute(
              "data-booth-exit",
              revealScrollDirection === "up" ? "up" : "down"
            );
            boothInfoSection.classList.remove("is-revealed", "booth-enter-from-up");
          }
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );
      ioBoothReveal.observe(boothInfoSection);
    }
  }

  if (stageEventSection) {
    if (reduceMotionReveal || !("IntersectionObserver" in window)) {
      stageEventSection.classList.add("is-revealed", "stage-reveal--was-in-view");
    } else {
      const ioStageReveal = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) {
            stageEventSection.classList.add("stage-reveal--was-in-view");
            stageEventSection.classList.toggle("stage-enter-from-up", revealScrollDirection === "up");
            stageEventSection.removeAttribute("data-stage-exit");
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                stageEventSection.classList.add("is-revealed");
              });
            });
          } else {
            stageEventSection.setAttribute(
              "data-stage-exit",
              revealScrollDirection === "up" ? "up" : "down"
            );
            stageEventSection.classList.remove("is-revealed", "stage-enter-from-up");
          }
        },
        { root: null, rootMargin: "0px 0px -14% 0px", threshold: 0.14 }
      );
      ioStageReveal.observe(stageEventSection);
    }
  }

  const contactFormNaya = document.querySelector(".contact-form.contact-form--naya");
  const contactSubmitNaya = contactFormNaya?.querySelector(".contact-submit-naya");

  function syncContactSubmitNayaEnabled() {
    if (!contactFormNaya || !contactSubmitNaya) return;
    contactSubmitNaya.disabled = !contactFormNaya.checkValidity();
  }

  if (contactFormNaya && contactSubmitNaya) {
    contactFormNaya.addEventListener("input", syncContactSubmitNayaEnabled);
    contactFormNaya.addEventListener("change", syncContactSubmitNayaEnabled);
    window.addEventListener("niusn:lang", syncContactSubmitNayaEnabled);
    syncContactSubmitNayaEnabled();

    contactFormNaya.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactFormNaya.checkValidity() || contactSubmitNaya.disabled) return;
      /* 와이어프레임: 백엔드 없음 — 추후 Formspree / API 연동 시 이 핸들러만 교체 */
      contactFormNaya.reset();
      syncContactSubmitNayaEnabled();
    });
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
    const line = tablist?.querySelector(".schedule-tabs__active-line");
    const tabs = tablist ? [...tablist.querySelectorAll('[role="tab"]')] : [];
    if (tabs.length) {
      const panels = tabs
        .map((t) => document.getElementById(t.getAttribute("aria-controls") || ""))
        .filter((el) => el instanceof HTMLElement);

      function focusTab(index) {
        const t = tabs[index];
        if (t) t.focus();
      }

      function updateScheduleTabLine() {
        if (!tablist || !line) return;
        const active = tabs.find((t) => t.classList.contains("is-active")) || tabs[0];
        if (!active) return;
        const w = Math.max(16, active.offsetWidth);
        const left = active.offsetLeft;
        line.style.left = `${left}px`;
        line.style.width = `${w}px`;
        tablist.classList.add("schedule-tabs__list--has-line");
      }

      function scheduleTabLineUpdate() {
        requestAnimationFrame(updateScheduleTabLine);
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
        scheduleTabLineUpdate();
        requestAnimationFrame(scheduleTabLineUpdate);
      }

      window.addEventListener("resize", scheduleTabLineUpdate, { passive: true });
      window.visualViewport?.addEventListener("resize", scheduleTabLineUpdate);
      document.addEventListener("niusn:lang", scheduleTabLineUpdate);
      if ("ResizeObserver" in window && tablist) {
        new ResizeObserver(scheduleTabLineUpdate).observe(tablist);
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

      if (document.fonts && typeof document.fonts.ready !== "undefined") {
        document.fonts.ready.then(() => scheduleTabLineUpdate());
      }
      scheduleTabLineUpdate();
    }
  }
})();
