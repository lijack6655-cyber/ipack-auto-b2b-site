const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/js/product-directory.js', 'utf8');
const categories = [
  {id: 'root', name: 'Lighting', slug: 'lighting', count: 1, aliases: ['Headlights']},
  {id: 'child', name: 'LHD Lamps', slug: 'lhd-lamps', parentId: 'root', count: 1, aliases: ['Headlights - LHD']},
  {id: 'other', name: '<Mirror>', slug: 'mirror', count: 0}
];
const products = [
  {id: 'direct', slug: 'direct', title: 'Direct product', categoryPath: [{id: 'root', name: 'Lighting', slug: 'lighting'}]},
  {id: 'child-product', slug: 'child-product', title: 'Child product', categoryPath: [{id: 'root', name: 'Lighting', slug: 'lighting'}, {id: 'child', name: 'LHD Lamps', slug: 'lhd-lamps'}]},
  {id: 'legacy', slug: 'legacy', title: 'Legacy product', category: 'Headlights - LHD'}
];

async function run(search) {
  const ids = ['product-directory-grid', 'product-directory-count', 'product-directory-category', 'product-directory-sort', 'product-directory-prev', 'product-directory-next', 'product-directory-page', 'product-directory-tree', 'product-directory-breadcrumb', 'product-directory-heading'];
  const elements = Object.fromEntries(ids.map(id => [id, {innerHTML: '', textContent: '', value: id.endsWith('sort') ? 'featured' : '', disabled: false, hidden: false, handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; }, setAttribute() {}, insertAdjacentHTML(_, html) { this.innerHTML += html; }}]));
  const state = {history: '', elements};
  const context = {
    document: {getElementById: id => elements[id], querySelector: () => ({offsetTop: 0})},
    window: {loadProductsData: () => Promise.resolve(products)},
    location: {href: `https://example.test/product${search}`, search, pathname: '/product', hash: ''},
    history: {replaceState(_, __, url) { state.history = url; }},
    fetch: () => Promise.resolve({ok: true, json: () => Promise.resolve(categories)}),
    URL, URLSearchParams, scrollTo() {}
  };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return {state, elements};
}

(async () => {
  const root = await run('?category=lighting');
  assert.match(root.elements['product-directory-grid'].innerHTML, /Direct product/);
  assert.match(root.elements['product-directory-grid'].innerHTML, /Child product/);
  assert.match(root.elements['product-directory-grid'].innerHTML, /Legacy product/);
  assert.match(root.elements['product-directory-tree'].innerHTML, /Lighting <span>2<\/span>/);

  const leaf = await run('?category=lhd-lamps');
  assert.doesNotMatch(leaf.elements['product-directory-grid'].innerHTML, /Direct product/);
  assert.equal((leaf.elements['product-directory-grid'].innerHTML.match(/class="directory-card"/g) || []).length, 2);

  const alias = await run('?category=Headlights%20-%20LHD');
  assert.equal(alias.state.history, '/product?category=lhd-lamps');
  assert.match(alias.elements['product-directory-grid'].innerHTML, /Legacy product/);

  const unknown = await run('?category=deleted-category');
  assert.equal(unknown.elements['product-directory-count'].textContent, '0 items');
  assert.match(unknown.elements['product-directory-grid'].innerHTML, /category is unavailable/);
  assert.doesNotMatch(root.elements['product-directory-tree'].innerHTML, /<Mirror>/);
  console.log('Product directory root, child, legacy alias, unknown category, counts, and escaping checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
