const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '..');

// Execute the production helper without initializing unrelated RFQ/catalog code.
const main = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');
const helper = main.slice(0, main.indexOf('\nnormalizeBrandNavigation(document.'));
class Link {
  constructor(href = '', text = '') {
    this.href = href; this.textContent = text; this.attributes = {};
    const classes = new Set();
    this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name), toggle(name, value) { value ? classes.add(name) : classes.delete(name); } };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  remove() {
    if (this.parentElement) {
      this.parentElement.links.splice(this.parentElement.links.indexOf(this), 1);
      this.parentElement = null;
    }
  }
  after(link) {
    const parent = this.parentElement;
    link.remove();
    parent.links.splice(parent.links.indexOf(this) + 1, 0, link);
    link.parentElement = parent;
  }
}
class Nav {
  constructor(links) { this.links = []; links.forEach(link => this.appendChild(link)); }
  querySelectorAll() { return this.links; }
  appendChild(link) { link.remove(); this.links.push(link); link.parentElement = this; }
}
const context = { URL, document: { createElement: () => new Link() } };
vm.runInNewContext(helper, context);
const normalize = context.normalizeBrandNavigation;
for (const pathname of ['/our-brand', '/our-brand/', '/our-brand.html', '/our-brand.html/']) {
  const blog = new Link('/blog.html', 'Blog');
  const about = new Link('/about', 'About'); about.classList.add('active');
  const nav = new Nav([new Link('/', 'Home'), blog, about]);
  normalize(nav, pathname, 'https://www.ipackautoparts.com' + pathname);
  normalize(nav, pathname, 'https://www.ipackautoparts.com' + pathname);
  assert.equal(nav.links.filter(link => link.href === '/our-brand').length, 1, 'Repeated normalization creates one link');
  const brand = nav.links[2];
  assert.equal(brand.textContent, 'Our Brand');
  assert.equal(brand.attributes['aria-current'], 'page');
  assert(brand.classList.contains('active'));
  assert(!about.classList.contains('active'));
}
const blog = new Link('../blog', 'Blog');
const nav = new Nav([blog, new Link('/our-brand.html', 'Old brand'), new Link('/our-brand/', 'Duplicate'), new Link('/about', 'About')]);
normalize(nav, '/products/headlight-part', 'https://www.ipackautoparts.com/products/headlight-part');
assert.equal(nav.links.length, 3);
assert.equal(nav.links[1].href, '/our-brand');
assert.equal(nav.links[1].attributes['aria-current'], undefined);
assert(!nav.links[1].classList.contains('active'), 'Product route does not activate Our Brand');
normalize(null, '/', 'https://www.ipackautoparts.com/');
const noBlog = new Nav([new Link('/', 'Home')]);
normalize(noBlog, '/about', 'https://www.ipackautoparts.com/about');
assert.equal(noBlog.links.at(-1).href, '/our-brand', 'Pages without Blog still receive a route');

const html = fs.readFileSync(path.join(root, 'our-brand.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/brand-contact.css'), 'utf8');
assert.match(html, /rel="canonical" href="https:\/\/www.ipackautoparts.com\/our-brand"/);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@type'], 'AboutPage');
assert.equal(schema.breadcrumb.itemListElement.at(-1).item, schema.url);
assert(!/17\+|certif|HTML \+ CSS|crawlable/i.test(html), 'Unverified changing history/certifications and internal copy are excluded');
for (const page of [home, html]) {
  for (const value of ['Since 2009', '30,500+', '60+', '20+']) assert(page.includes(value), `Confirmed company figure appears: ${value}`);
  assert.equal((page.match(/data-company-count=/g) || []).length, 3);
  assert.equal((page.match(/class="company-figure-accessible"/g) || []).length, 3);
  assert(!/aria-live=["'](?:polite|assertive)["'][^>]*data-company-count/.test(page));
}
assert(html.includes('Company figures from our Alibaba storefront materials.'));
assert(!home.includes('Company figures from our Alibaba storefront materials.'));
for (const page of [html, home]) {
  assert.equal((page.match(/class="brand-contact brand-contact-whatsapp"/g) || []).length, 1);
  assert.equal((page.match(/class="brand-contact brand-contact-quote"/g) || []).length, 1);
  assert(!page.includes('class="home-whatsapp"'));
  assert(!page.includes('class="floating-whatsapp'));
}
assert.match(home, /class="brand-contact brand-contact-quote" href="#request-quote"/);
assert.match(html, /class="brand-contact brand-contact-quote" href="\/#request-quote"/);
assert.match(html, /<video[^>]*controls[^>]*preload="none"/);
assert(!/<video[^>]*(?:autoplay|\bloop\b)/.test(html), 'Brand film plays only by buyer action');
assert.match(css, /animation: brand-contact-arrive 1\.4s [^;]+ 1;/);
assert(!css.includes('infinite'));
assert.match(css, /prefers-reduced-motion: reduce[\s\S]*animation: none; transition: none/);
assert.match(css, /\.home-page:has\(\.rfq-section :focus\) \.brand-contact,[\s\S]*visibility: hidden/);
for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)(?:\?[^"\s]*)?"/g)) {
  assert(fs.existsSync(path.join(root, match[1])), `Local asset exists: ${match[1]}`);
}
assert.match(fs.readFileSync(path.join(root, 'sitemap-core.xml'), 'utf8'), /<loc>https:\/\/www.ipackautoparts.com\/our-brand<\/loc>/);
const trackedHTML = execFileSync('git', ['ls-files', '-z', '--', '*.html'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
let versionedReferences = 0;
for (const file of new Set([...trackedHTML, 'our-brand.html'])) {
  const page = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of page.matchAll(/(?:src|href)="([^"\s]*assets\/(?:js\/main\.js|css\/(?:product-menu|home-design)\.css)(?:\?[^"\s]*)?)"/g)) {
    assert(match[1].endsWith('?v=20261029-brand2'), `${file} must request a new immutable asset URL: ${match[1]}`);
    versionedReferences++;
  }
}
assert(versionedReferences >= 224, 'The shared navigation assets are checked across all existing static pages');
console.log(`Brand navigation: routes, idempotence, active state, content, contacts, motion, assets and ${versionedReferences} immutable cache URLs passed.`);
