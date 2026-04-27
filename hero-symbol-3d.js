/* NIUSN hero symbol — replaces the static <img class="wf-hero__mark"> with a
 * looping <video> of the brand mark, using mix-blend-mode: screen so the
 * video's black background drops out against the purple hero.
 *
 * Note: the preview/CDN serving media files does not honor HTTP range
 * requests, which causes <video> streaming to stall. We fetch the whole
 * file once as a Blob and hand the element an object-URL so playback is
 * local and deterministic.
 */
(function () {
  const wrap = document.querySelector('.wf-hero__symbol-wrap');
  if (!wrap) return;
  const oldImg = wrap.querySelector('img.wf-hero__mark');

  // Respect reduced motion — keep the static image, don't autoplay video.
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tag the wrap so hero-upgrades.css can style it, and neutralize any parent
  // fade-up animation that otherwise holds it at opacity:0 on this page.
  wrap.classList.add('wf-hero__symbol-wrap--video');
  wrap.style.setProperty('animation', 'none', 'important');
  wrap.style.setProperty('opacity', '1', 'important');
  wrap.style.setProperty('transform', 'none', 'important');

  if (prefersReduced) return;

  const video = document.createElement('video');
  video.className = 'wf-hero__mark wf-hero__mark--video';
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  video.setAttribute('aria-hidden', 'true');
  video.muted = true;       // required for autoplay on iOS/Safari
  video.loop = true;
  video.playsInline = true;

  // Style matches reference: screen-blend drops the video's black bg.
  video.style.cssText = [
    'width:100%',
    'height:100%',
    'object-fit:contain',
    'display:block',
    'position:relative',
    'z-index:2',
    'pointer-events:none',
    'mix-blend-mode:screen',
    'border-radius:50%',
    'opacity:1',
  ].join(';');

  // Fallback: if all sources fail to load, show the static PNG again.
  video.addEventListener('error', () => {
    video.remove();
    if (oldImg) oldImg.style.display = '';
  });

  // Insert the video now; hide the PNG (kept for no-JS / error fallback).
  wrap.appendChild(video);
  if (oldImg) oldImg.style.display = 'none';

  // Load-via-blob: avoids the preview server's lack of range-request support.
  const candidates = [
    { url: 'media/hero-symbol.webm', type: 'video/webm' },
    { url: 'media/hero-symbol.mp4',  type: 'video/mp4'  },
  ];

  (async () => {
    for (const { url } of candidates) {
      try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) continue;
        const blob = await res.blob();
        video.src = URL.createObjectURL(blob);
        try { await video.play(); } catch (_) { /* autoplay blocked — ignore */ }
        return;
      } catch (_) { /* try next candidate */ }
    }
    // All candidates failed — restore the still image.
    video.remove();
    if (oldImg) oldImg.style.display = '';
  })();
})();
