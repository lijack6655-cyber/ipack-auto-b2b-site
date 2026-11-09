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
  let callback, nextFrame = 0;
  const observed = new Set();
  class IntersectionObserver {
    constructor(fn) { callback = fn; }
    observe(target) { observed.add(target); }
    unobserve(target) { observed.delete(target); }
    disconnect() { observed.clear(); }
  }
  const window = events({ matchMedia: () => motion, cancelAnimationFrame: id => frames.delete(id) });
  if (frameAvailable) window.requestAnimationFrame = fn => { const id = ++nextFrame; frames.set(id, fn); return id; };
  if (observerAvailable) window.IntersectionObserver = IntersectionObserver;
  vm.runInNewContext(source, { document, window });
  return { values, document, motion, window, frames, observed: () => observed.size,
    visible(value = true, ratio = value ? 1 : 0) { callback?.([{ target: figure, isIntersecting: value, intersectionRatio: ratio }]); },
    hide() { document.hidden = true; document.emit('visibilitychange'); },
    show() { document.hidden = false; document.emit('visibilitychange'); },
    reduce(value) { motion.matches = value; motion.emit('change', { matches: value }); },
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
normal.tick(900);
assert(Number(normal.values[0].textContent.replace(/\D/g, '')) > 0);
assert(Number(normal.values[0].textContent.replace(/\D/g, '')) < 30500);
normal.tick(1799);
assert(normal.frames.size > 0, 'The animation remains visible for the requested 1.8 seconds');
normal.tick(1800);
assert.deepEqual(finals(normal), expected);
assert.equal(normal.frames.size, 0, 'Animation ends after its finite duration');
normal.visible();
assert.equal(normal.frames.size, 0, 'A second viewport entry cannot replay the counter');
assert.equal(normal.observed(), 0, 'Completed figures stop observing');
normal.hide(); normal.show(); normal.window.emit('pagehide'); normal.window.emit('pageshow');
normal.reduce(true); normal.reduce(false); normal.visible();
assert.equal(normal.frames.size, 0, 'Completed figures remain one-shot across lifecycle changes');

const threshold = setup();
threshold.visible(true, .01);
threshold.visible(true, .349);
assert.equal(threshold.frames.size, 0, 'Intersection below 35 percent cannot start the counter');
threshold.visible(true, .35);
assert.equal(threshold.frames.size, 1, '35 percent visibility starts the counter');
threshold.visible(true, .6);
assert.equal(threshold.frames.size, 1, 'Additional entries cannot duplicate a running animation');

const unseen = setup();
unseen.hide();
unseen.visible();
assert.equal(unseen.frames.size, 0, 'Hidden-tab observer callbacks cannot consume unseen figures');
assert.deepEqual(finals(unseen), expected);
unseen.show();
assert.equal(unseen.observed(), 1);
unseen.visible();
assert.equal(unseen.frames.size, 1, 'An unseen figure still animates after returning to the tab');

const hiddenStartup = setup({ hidden: true });
hiddenStartup.show();
assert.equal(hiddenStartup.observed(), 1, 'Hidden startup still attaches resume listeners');
hiddenStartup.visible();
assert.equal(hiddenStartup.frames.size, 1, 'Hidden startup can animate after becoming visible');

for (const end of ['motion', 'visibility', 'pagehide', 'viewport']) {
  const state = setup(); state.visible(); state.tick(0); state.tick(250);
  if (end === 'motion') state.reduce(true);
  if (end === 'visibility') state.hide();
  if (end === 'pagehide') state.window.emit('pagehide');
  if (end === 'viewport') state.visible(true, .2);
  assert.deepEqual(finals(state), expected, `${end} finalizes values`);
  assert.equal(state.frames.size, 0, `${end} cancels pending frames`);
  if (end !== 'viewport') {
    state.visible();
    assert.equal(state.frames.size, 0, `${end} prevents a restart while inactive`);
  }
  if (end === 'motion') state.reduce(false);
  if (end === 'visibility') state.show();
  if (end === 'pagehide') state.window.emit('pageshow');
  assert.equal(state.observed(), 1, `${end} preserves unfinished figures for retry`);
  state.visible();
  assert.equal(state.frames.size, 1, `${end} can retry after re-entry`);
  state.tick(2000); state.tick(3800);
  assert.deepEqual(finals(state), expected);
  assert.equal(state.frames.size, 0);
  state.visible();
  assert.equal(state.frames.size, 0, `${end} retry becomes one-shot after completing`);
}
const reducedStartup = setup({ reduced: true });
reducedStartup.visible();
assert.equal(reducedStartup.frames.size, 0);
reducedStartup.reduce(false); reducedStartup.visible();
assert.equal(reducedStartup.frames.size, 1, 'Changing reduced motion to allow animation observes pending figures');
console.log('Company figures: static/API fallbacks, 35% threshold, hidden startup/resume, unseen preservation, interrupted retries, 1.8-second completion, one-shot lifecycle and reduced-motion changes passed.');
