(() => {
  const figures = [...document.querySelectorAll('.company-figures')];
  if (!figures.length) return;
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  // Final values are the default HTML, including when enhancement APIs are absent.
  if (!window.IntersectionObserver || !window.requestAnimationFrame) return;
  const running = new Map();
  const completed = new Set();
  let pageActive = true;
  const canAnimate = () => pageActive && !document.hidden && !motion?.matches;
  const values = figure => [...figure.querySelectorAll('[data-company-count]')];
  const format = number => Math.round(number).toLocaleString('en-US') + '+';
  const finish = figure => {
    if (running.has(figure)) window.cancelAnimationFrame(running.get(figure));
    running.delete(figure);
    values(figure).forEach(value => { value.textContent = format(Number(value.dataset.companyCount)); });
  };
  const start = figure => {
    if (!canAnimate() || completed.has(figure) || running.has(figure)) return;
    let beginning;
    const frame = timestamp => {
      if (!canAnimate()) { finish(figure); return; }
      beginning ??= timestamp;
      const progress = Math.min((timestamp - beginning) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      values(figure).forEach(value => { value.textContent = format(Number(value.dataset.companyCount) * eased); });
      if (progress < 1) running.set(figure, window.requestAnimationFrame(frame));
      else {
        completed.add(figure);
        finish(figure);
        observer.unobserve(figure);
      }
    };
    running.set(figure, window.requestAnimationFrame(frame));
  };
  const observer = new window.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .35) start(entry.target);
      else if (running.has(entry.target)) finish(entry.target);
    });
  }, { threshold: .35 });
  const pause = () => {
    observer.disconnect();
    figures.forEach(finish);
  };
  const resume = () => {
    if (!canAnimate()) return;
    observer.disconnect();
    figures.forEach(figure => { if (!completed.has(figure)) observer.observe(figure); });
  };
  motion?.addEventListener?.('change', () => { motion.matches ? pause() : resume(); });
  document.addEventListener('visibilitychange', () => { document.hidden ? pause() : resume(); });
  window.addEventListener('pagehide', () => { pageActive = false; pause(); });
  window.addEventListener('pageshow', () => { pageActive = true; resume(); });
  resume();
})();
