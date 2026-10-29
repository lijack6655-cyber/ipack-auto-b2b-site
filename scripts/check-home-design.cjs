const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/js/home-design.js'), 'utf8');

async function render({ products = [], categories = [], categoryError = false } = {}) {
  const grid = { innerHTML: '', setAttribute(key, value) { this[key] = value; } };
  const categoryGrid = { innerHTML: '' };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  vm.runInNewContext(script, {
    document: { getElementById: id => ({ 'home-featured-grid': grid, 'home-category-grid': categoryGrid })[id] },
    window: { catalogEscape: escape, catalogImage: value => value, productCard: item => `<article>${escape(item.title)}</article>`, loadProductsData: async () => products },
    fetch: async () => ({ ok: !categoryError, json: async () => categories }),
  });
  await new Promise(resolve => setImmediate(resolve));
  return { grid, categoryGrid };
}

(async () => {
  const products = Array.from({ length: 6 }, (_, index) => ({ id: index, title: `Part ${index}`, featured: true, image: '/assets/images/headlights.webp', categoryPath: [{ id: 'child' }] }));
  const categories = [{ id: 'root', slug: 'automotive-lighting', name: 'Lighting & Lamps <script>bad()</script>' }, { id: 'child', parentId: 'root', slug: 'headlights', name: 'Headlights' }];
  const normal = await render({ products, categories });
  assert.equal((normal.grid.innerHTML.match(/<article>/g) || []).length, 4, 'Selected products are capped at four');
  assert.equal(normal.grid['aria-busy'], 'false');
  assert.match(normal.categoryGrid.innerHTML, /\/product\?category=automotive-lighting/);
  assert.match(normal.categoryGrid.innerHTML, /Lighting &amp; Lamps/);
  assert(!normal.categoryGrid.innerHTML.includes('<script>'), 'Category display data is escaped');
  assert(!normal.categoryGrid.innerHTML.includes('category=headlights'), 'Homepage shows root categories only');
  const placeholder = await render({ products: [{ ...products[0], image: 'assets/images/parts-showcase.webp' }], categories });
  assert(!placeholder.categoryGrid.innerHTML.includes('<img'), 'Generic showcase must not represent a specific category');
  assert.match(placeholder.categoryGrid.innerHTML, /Explore this category/);
  const empty = await render();
  assert.match(empty.grid.innerHTML, /full product catalog/);
  assert.match(empty.categoryGrid.innerHTML, /full product catalog/);
  const unavailable = await render({ products: null, categoryError: true });
  assert.match(unavailable.grid.innerHTML, /temporarily unavailable/);
  assert.match(unavailable.categoryGrid.innerHTML, /temporarily unavailable/);
  assert.equal(unavailable.grid['aria-busy'], 'false');

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/<section\b/g) || []).length, 7);
  assert(html.indexOf('class="home-video-story"') < html.indexOf('class="home-categories home-section"'), 'The compact company introduction precedes the catalog');
  assert(!html.includes('company-building-v12.webp'), 'Detailed company imagery belongs on Our Brand');
  assert.equal((html.match(/action="https:\/\/formspree.io\/f\/xnjybvyy"/g) || []).length, 1);
  for (const name of ['name', 'email', 'vehicle', 'oe_number', 'message']) assert.match(html, new RegExp(`<label[^>]*>[\\s\\S]*?name="${name}"[\\s\\S]*?<\\/label>`));
  for (const name of ['product_photos', 'pasted_image_summary']) assert(html.includes(`name="${name}"`));
  assert(html.includes('href="#request-quote"'));
  assert.match(html, /type="checkbox" name="privacy_consent" value="accepted" required/);
  console.log('Home design: live categories, selected products, empty/error states, section order and RFQ hooks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
