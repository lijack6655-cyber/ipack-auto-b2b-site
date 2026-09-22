'use strict';

const fs = require('fs');
const vm = require('vm');

const ids = [
  'product-directory-grid', 'product-directory-count', 'product-directory-category',
  'product-directory-sort', 'product-directory-prev', 'product-directory-next',
  'product-directory-page'
];
const elements = Object.fromEntries(ids.map(id => [id, {
  value: id === 'product-directory-sort' ? 'featured' : '',
  innerHTML: '', textContent: '', hidden: false, disabled: false,
  listeners: {}, setAttribute() {}, addEventListener(type, fn) { this.listeners[type] = fn; }
}]));
elements['product-directory-category'].value = 'Headlights';

const sample = [
  {id: 'h', slug: 'headlight', title: 'Headlight', displayTitle: 'Headlight', category: 'Headlights', image: 'assets/images/headlights.webp', featured: true, rank: 1},
  {id: 't', slug: 'tail-light', title: 'Tail Light', displayTitle: 'Tail Light', category: 'Tail Lights', image: 'assets/images/tail-lights.webp', featured: false, rank: 2}
];
const location = {href: 'https://example.test/product?category=Headlights', pathname: '/product', search: '?category=Headlights', hash: ''};
const context = {
  Array, Math, Number, Promise, Set, String, URL, URLSearchParams, encodeURIComponent,
  location,
  history: {replaceState(_, __, value) { location.href = 'https://example.test' + value; location.search = value.split('?')[1]?.split('#')[0] ? '?' + value.split('?')[1].split('#')[0] : ''; }},
  scrollTo() {},
  document: {getElementById(id) { return elements[id] || null; }, querySelector() { return {offsetTop: 0}; }},
  window: {loadProductsData: () => Promise.resolve(sample)},
  console
};

vm.runInNewContext(fs.readFileSync('assets/js/product-directory.js', 'utf8'), context);

setImmediate(() => {
  const grid = elements['product-directory-grid'];
  const category = elements['product-directory-category'];
  if(!grid.innerHTML.includes('Headlight') || grid.innerHTML.includes('Tail Light') || elements['product-directory-count'].textContent !== '1 items' || !elements['product-directory-next'].disabled) {
    throw new Error('category filtering or pagination check failed');
  }
  category.value = 'Tail Lights';
  category.listeners.change();
  if(!grid.innerHTML.includes('Tail Light') || grid.innerHTML.includes('Headlight') || elements['product-directory-count'].textContent !== '1 items') {
    throw new Error('category change check failed');
  }
  console.log('PASS: product-directory category filtering, featured sort data, and pagination');
});
