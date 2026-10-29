const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/js/home-video.js'), 'utf8');

function target(properties = {}) {
  const listeners = {};
  return Object.assign({
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
    emit(name) { for (const listener of listeners[name] || []) listener(); },
  }, properties);
}

async function setup({ reduced = false, saveData = false, blocked = false, observer = true } = {}) {
  const classes = new Set();
  const video = target({
    paused: true, src: '', muted: false, dataset: { src: '/company.mp4' },
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    parentElement: { getBoundingClientRect: () => ({ top: 0, bottom: 700 }) },
    plays: 0,
    play() {
      this.plays++;
      if (blocked) return Promise.reject(new Error('Autoplay blocked'));
      this.paused = false;
      this.emit('playing');
      return Promise.resolve();
    },
    pause() {
      if (this.paused) return;
      this.paused = true;
      this.emit('pause');
    },
  });
  const toggle = target({ hidden: true, disabled: false });
  const companyVideo = target({ paused: true });
  const motion = target({ matches: reduced });
  const connection = target({ saveData });
  const document = target({ hidden: false, getElementById: id => ({ 'home-background-video': video, 'home-video-toggle': toggle, 'home-company-video': companyVideo })[id] });
  let intersection;
  const window = { innerHeight: 900, matchMedia: () => motion };
  class IntersectionObserver {
    constructor(callback) { intersection = callback; }
    observe() {}
  }
  if (observer) window.IntersectionObserver = IntersectionObserver;
  vm.runInNewContext(script, { window, document, navigator: { connection }, IntersectionObserver });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  await settle();
  return { video, toggle, companyVideo, motion, connection, document, classes, settle, visible: value => intersection([{ isIntersecting: value }]) };
}

(async () => {
  const normal = await setup();
  assert.equal(normal.video.paused, false);
  assert.equal(normal.video.muted, true);
  assert.equal(normal.toggle.textContent, 'Pause background video');
  normal.toggle.emit('click');
  normal.visible(false);
  normal.visible(true);
  assert.equal(normal.video.paused, true, 'Manual pause survives leaving and reentering viewport');
  normal.toggle.emit('click');
  await normal.settle();
  normal.document.hidden = true;
  normal.document.emit('visibilitychange');
  assert.equal(normal.video.paused, true);
  normal.document.hidden = false;
  normal.document.emit('visibilitychange');
  await normal.settle();
  assert.equal(normal.video.paused, false);
  normal.visible(false);
  assert.equal(normal.video.paused, true);
  normal.visible(true);
  await normal.settle();
  assert.equal(normal.video.paused, false);
  normal.companyVideo.paused = false;
  normal.companyVideo.emit('play');
  assert.equal(normal.video.paused, true, 'Background pauses while company video plays');
  normal.companyVideo.paused = true;
  normal.companyVideo.emit('pause');
  await normal.settle();
  assert.equal(normal.video.paused, false);
  normal.motion.matches = true;
  normal.motion.emit('change');
  assert.equal(normal.video.paused, true);

  for (const preferences of [{ reduced: true }, { saveData: true }, { observer: false }]) {
    const state = await setup(preferences);
    assert.equal(state.video.plays, 0);
    assert.equal(state.video.src, '', 'Avoid requesting background media before explicit play');
    state.toggle.emit('click');
    await state.settle();
    assert.equal(state.video.paused, false, 'Explicit playback remains available');
  }
  const denied = await setup({ blocked: true });
  assert.equal(denied.toggle.textContent, 'Play background video');
  assert.equal(denied.classes.has('is-playing'), false);
  denied.video.emit('error');
  denied.video.emit('pause');
  assert.equal(denied.toggle.disabled, true);
  assert.equal(denied.toggle.textContent, 'Background video unavailable');
  assert.equal(denied.classes.has('is-playing'), false);

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /id="home-company-video"[^>]*controls playsinline preload="none"/);
  assert.match(html, /class="home-video-link home-video-link-secondary" href="product"/);
  assert.match(html, /home-video-hero[\s\S]*home-video-story[\s\S]*home-categories[\s\S]*home-featured[\s\S]*home-process[\s\S]*home-faq[\s\S]*rfq-section/);
  assert(!html.includes('home-video-eyebrow'), 'Section headings do not use decorative eyebrows');
  assert.match(html, /name="privacy_consent"|src="assets\/js\/main.js/);
  assert(!/<video\b[^>]*\sautoplay(?:\s|>)/.test(html), 'Playback policy is controlled before the media source is attached');
  console.log('Home video: playback, preferences, visibility, fallback and HTML checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
