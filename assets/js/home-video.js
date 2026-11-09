(() => {
  const video = document.getElementById('home-background-video');
  const toggle = document.getElementById('home-video-toggle');
  const companyVideo = document.getElementById('home-company-video');
  if (!video || !toggle || !companyVideo) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let wanted = !motion.matches && !connection?.saveData;
  const bounds = video.parentElement.getBoundingClientRect();
  let inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
  let pending = false;
  video.muted = true;
  toggle.hidden = false;

  function render() {
    if (toggle.disabled) return;
    toggle.textContent = video.paused ? 'Play background video' : 'Pause background video';
  }

  function shouldPlay() {
    return wanted && inView && !document.hidden && companyVideo.paused;
  }

  function update() {
    if (!shouldPlay()) {
      video.pause();
      return;
    }
    if (!video.paused || pending || toggle.disabled) return;
    if (!video.src) video.src = video.dataset.src;
    pending = true;
    video.play().then(() => {
      pending = false;
      if (!shouldPlay()) video.pause();
    }).catch(error => {
      pending = false;
      if (error.name === 'AbortError') {
        update();
        return;
      }
      wanted = false;
      if (!toggle.disabled) render();
    });
  }

  toggle.addEventListener('click', () => {
    wanted = video.paused;
    update();
  });
  video.addEventListener('playing', () => {
    video.classList.add('is-playing');
    render();
  });
  video.addEventListener('pause', render);
  video.addEventListener('error', () => {
    wanted = false;
    video.classList.remove('is-playing');
    toggle.disabled = true;
    toggle.textContent = 'Background video unavailable';
  });
  document.addEventListener('visibilitychange', update);
  companyVideo.addEventListener('play', update);
  companyVideo.addEventListener('pause', update);
  companyVideo.addEventListener('ended', update);

  function preferencesChanged() {
    if (motion.matches || connection?.saveData) {
      wanted = false;
      update();
    }
  }
  motion.addEventListener('change', preferencesChanged);
  connection?.addEventListener('change', preferencesChanged);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }).observe(video.parentElement);
  } else {
    // shortcut: older browsers keep the poster until explicitly played; no scroll polling.
    wanted = false;
  }
  update();
})();
