import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('product.html');
const search = read('products.html');
const script = read('assets/js/product-directory.js');
const config = JSON.parse(read('vercel.json'));

assert.match(page, /href="product">Product<\/a><a href="products">Search<\/a>/);
assert.match(page, /id="product-directory-grid"/);
assert.match(script, /fetch\('\/api\/catalog'/);
assert.match(script, /const pageSize = 20/);
assert.match(search, /Search &amp; Vehicle Fitment RFQ Center/);
assert(config.headers.some(({ source }) => source === '/product'));
assert.match(read('sitemap-core.xml'), /https:\/\/www\.ipackautoparts\.com\/product<\/loc>/);
for(const path of ['index.html', 'blog.html', 'about.html', 'contact.html', 'blog/auto-parts-rfq-guide-for-importers.html']) {
  assert.match(read(path), /href="(?:\.\.\/)?product">Product<\/a><a href="(?:\.\.\/)?products">Search<\/a>/, `${path} must show Product and Search in its static navigation`);
}

console.log('Product directory checks passed.');
