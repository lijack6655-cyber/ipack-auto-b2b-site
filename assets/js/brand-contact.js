(() => {
  const update = () => document.documentElement.classList.toggle('contact-motion-paused', document.hidden);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pagehide', () => document.documentElement.classList.add('contact-motion-paused'));
  window.addEventListener('pageshow', update);
  update();
})();
