const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/company-figures.js'), 'utf8');
function events(object = {}) {
  const listeners = {};
  return Object.assign(object, { addEventListener(type, listener) { (listeners[type] ||= []).push(listener); }, emit(type, event) { for (const listener of listeners[type] || []) listener(event); } });
}
function setup({ reduced = false, observerAvailable = true, frameAvailable = true, hidden = false } = {}) {
  const values = [30500, 60, 20].map(value => ({ dataset: { companyCount: String(value) }, textContent: value.toLocaleString('en-US') + '+' }));
  const figure = { querySelectorAll: () => values };
  const document = events({ hidden, querySelectorAll: () => [figure] });
  const motion = events({ matches: reduced });
  const frames = new Map();
  let callback, nextFrame = 0, observed = 0;
  class IntersectionObserver {
    constructor(fn) { callback = fn; }
    observe() { observed++; }
    unobserve() { observed--; }
    disconnect() { observed = 0; }
  }
  const window = events({ matchMedia: () => motion, cancelAnimationFrame: id => frames.delete(id) });
  if (frameAvailable) window.requestAnimationFrame = fn => { const id = ++nextFrame; frames.set(id, fn); return id; };
  if (observerAvailable) window.IntersectionObserver = IntersectionObserver;
  vm.runInNewContext(source, { document, window });
  return { values, document, motion, window, frames, observed: () => observed,
    visible(value = true) { callback?.([{ target: figure, isIntersecting: value }]); },
    tick(timestamp) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(timestamp)); },
  };
}
const finals = state => state.values.map(value => value.textContent);
const expected = ['30,500+', '60+', '20+'];
for (const options of [{ reduced: true }, { observerAvailable: false }, { frameAvailable: false }, { hidden: true }]) {
  const state = setup(options);
  assert.deepEqual(finals(state), expected, 'Fallback preserves final company values');
  assert.equal(state.frames.size, 0);
  assert.equal(state.observed(), 0);
}
const normal = setup();
assert.deepEqual(finals(normal), expected, 'Before visibility final HTML stays visible');
normal.visible(false);
assert.equal(normal.frames.size, 0);
normal.visible();
normal.tick(0);
normal.tick(600);
assert(Number(normal.values[0].textContent.replace(/\D/g, '')) > 0);
assert(Number(normal.values[0].textContent.replace(/\D/g, '')) < 30500);
normal.tick(1200);
assert.deepEqual(finals(normal), expected);
assert.equal(normal.frames.size, 0, 'Animation ends after its finite duration');
normal.visible();
assert.equal(normal.frames.size, 0, 'A second viewport entry cannot replay the counter');
for (const end of ['motion', 'visibility', 'pagehide']) {
  const state = setup(); state.visible(); state.tick(0); state.tick(250);
  if (end === 'motion') state.motion.emit('change', { matches: true });
  if (end === 'visibility') { state.document.hidden = true; state.document.emit('visibilitychange'); }
  if (end === 'pagehide') state.window.emit('pagehide');
  assert.deepEqual(finals(state), expected, `${end} finalizes values`);
  assert.equal(state.frames.size, 0, `${end} cancels pending frames`);
  state.visible();
  assert.equal(state.frames.size, 0, `${end} prevents a restart`);
}
console.log('Company figures: static/reduced-motion/API fallbacks, viewport start, finite count-up, one-shot behavior and interruption cleanup passed.');
