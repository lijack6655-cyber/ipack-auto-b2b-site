(() => {
  const video = document.getElementById('home-background-video');
  const toggle = document.getElementById('home-video-toggle');
  const companyVideo = document.getElementById('home-company-video');
  if (!video || !toggle || !companyVideo) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const constrained = () => connection?.saveData || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType || '') || (connection?.downlink > 0 && connection.downlink < 1.5);
  let wanted = !motion.matches && !constrained();
  let ready = false;
  let pending = false;
  let manual = false;
  let attempt = 0;
  let bufferTimer;
  const bounds = video.parentElement.getBoundingClientRect();
  let inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
  video.muted = true;
  toggle.hidden = false;

  function render() {
    toggle.textContent = video.paused ? 'Play background video' : 'Pause background video';
  }
  function clearBuffer() {
    window.clearTimeout(bufferTimer);
    bufferTimer = undefined;
  }
  function poster() {
    ++attempt;
    wanted = false;
    pending = false;
    clearBuffer();
    video.pause();
    video.classList.remove('is-playing');
    video.removeAttribute('src');
    video.load();
    render();
  }
  function watchBuffer() {
    if (bufferTimer || !shouldPlay()) return;
    bufferTimer = window.setTimeout(poster, manual ? 15000 : 8000);
  }
  function shouldPlay() {
    return (ready || manual) && wanted && inView && !document.hidden && companyVideo.paused;
  }
  function update() {
    if (!shouldPlay()) {
      clearBuffer();
      video.pause();
      return;
    }
    if (pending) { watchBuffer(); return; }
    if (!video.paused) return;
    if (!video.src) {
      const compact = window.matchMedia('(max-width: 760px)').matches || constrained();
      video.src = compact ? video.dataset.mobileSrc : video.dataset.src;
    }
    const currentAttempt = ++attempt;
    pending = true;
    watchBuffer();
    video.play().then(() => {
      if (currentAttempt !== attempt) return;
      pending = false;
      if (!shouldPlay()) video.pause();
    }).catch(error => {
      if (currentAttempt !== attempt) return;
      pending = false;
      if (error.name === 'AbortError' && !shouldPlay()) return;
      poster();
    });
  }
  toggle.addEventListener('click', () => {
    manual = true;
    wanted = video.paused;
    update();
  });
  video.addEventListener('playing', () => {
    clearBuffer();
    video.classList.add('is-playing');
    render();
  });
  video.addEventListener('waiting', watchBuffer);
  video.addEventListener('stalled', watchBuffer);
  video.addEventListener('pause', render);
  video.addEventListener('error', poster);
  document.addEventListener('visibilitychange', update);
  companyVideo.addEventListener('play', update);
  companyVideo.addEventListener('pause', update);
  companyVideo.addEventListener('ended', update);
  function preferencesChanged() {
    if (motion.matches || constrained()) poster();
  }
  motion.addEventListener('change', preferencesChanged);
  connection?.addEventListener('change', preferencesChanged);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }).observe(video.parentElement);
  } else {
    wanted = false;
  }
  // Give navigation and catalog requests priority; the poster is visible throughout.
  function boot() {
    Promise.resolve(window.__ipackHomeReady).then(() => {
      window.setTimeout(() => { ready = true; update(); }, 500);
    });
  }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
  render();
})();
