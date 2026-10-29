(() => {
  const figures = [...document.querySelectorAll('.company-figures')];
  if (!figures.length) return;
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  // Final values are the default HTML, including when enhancement APIs are absent.
  if (motion?.matches || document.hidden || !window.IntersectionObserver || !window.requestAnimationFrame) return;
  const running = new Map();
  const started = new Set();
  const values = figure => [...figure.querySelectorAll('[data-company-count]')];
  const format = number => Math.round(number).toLocaleString('en-US') + '+';
  const finish = figure => {
    if (running.has(figure)) window.cancelAnimationFrame(running.get(figure));
    running.delete(figure);
    values(figure).forEach(value => { value.textContent = format(Number(value.dataset.companyCount)); });
  };
  const start = figure => {
    if (started.has(figure)) return;
    started.add(figure);
    observer.unobserve(figure);
    let beginning;
    const frame = timestamp => {
      beginning ??= timestamp;
      const progress = Math.min((timestamp - beginning) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      values(figure).forEach(value => { value.textContent = format(Number(value.dataset.companyCount) * eased); });
      if (progress < 1) running.set(figure, window.requestAnimationFrame(frame));
      else finish(figure);
    };
    running.set(figure, window.requestAnimationFrame(frame));
  };
  const observer = new window.IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) start(entry.target); });
  }, { threshold: .35 });
  figures.forEach(figure => observer.observe(figure));
  const finishAll = () => {
    observer.disconnect();
    figures.forEach(figure => { started.add(figure); finish(figure); });
  };
  motion?.addEventListener?.('change', event => { if (event.matches) finishAll(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.addEventListener('pagehide', finishAll, { once: true });
})();
