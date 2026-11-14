const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const guides = fs.readdirSync(path.join(root, 'blog')).filter(file => file.endsWith('.html'));
const categories = fs.readdirSync(path.join(root, 'categories')).filter(file => file.endsWith('.html'));
const index = read('blog.html');
const sitemap = read('sitemap-content.xml');
const dates = new Map([...sitemap.matchAll(/<loc>https:\/\/www\.ipackautoparts\.com([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(match => [match[1], match[2]]));
const runtimeLinks = new Set();
for (const file of ['blog.html', ...guides.map(file => `blog/${file}`), ...categories.map(file => `categories/${file}`)]) {
  const source = read(file);
  assert.doesNotMatch(source, /Target keywords?:|Internal Links for SEO|data-id="10001"/i, `${file}: internal copy or placeholder card`);
  assert.doesNotMatch(source, /100% (?:precision|fitment|flush fitment|mechanical)|zero fitment (?:risk|defects)/i, `${file}: absolute fitment claim`);
  assert.doesNotMatch(source, /href="\.\.\/products">product catalog/i, `${file}: catalog must use /product`);
  for (const match of source.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), `https://www.ipackautoparts.com/${file.replace(/\.html$/, '')}`);
    if (url.origin !== 'https://www.ipackautoparts.com') continue;
    // Product detail and article sitemap targets are served by the backend; verify them in the HTTP audit.
    if (url.pathname.startsWith('/products/') || url.pathname === '/sitemap-articles.xml') {
      runtimeLinks.add(url.pathname);
      continue;
    }
    const target = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\//, '');
    assert(fs.existsSync(path.join(root, target)) || fs.existsSync(path.join(root, target + '.html')), `${file}: missing target ${url.pathname}`);
    if (url.pathname === '/product' && url.search) assert.equal(url.searchParams.get('category'), 'headlights');
  }
}
for (const file of guides) {
  const route = `/blog/${file.replace(/\.html$/, '')}`;
  const source = read(`blog/${file}`);
  assert(index.includes(`href="${route.slice(1)}"`), `Undiscoverable guide ${route}`);
  const article = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])).find(item => item['@type'] === 'Article');
  assert(article, `Missing Article schema ${route}`);
  assert.equal(article.dateModified, dates.get(route), `${route}: sitemap/Article date mismatch`);
  assert(source.includes(`<time datetime="${article.dateModified}">`), `${route}: missing visible updated date`);
  const body = source.match(/<article class="content">([\s\S]*?)<\/article>/)[1];
  assert.match(body, /href="\.\.\/blog\//, `${route}: no related guide`);
}
const headlamp = read('blog/headlight-assembly-vs-head-lamp-difference.html');
for (const href of ['../categories/aftermarket-headlights-supplier', '../product?category=headlights', '../contact']) {
  assert(headlamp.includes(`href="${href}"`), `Missing headlamp next step ${href}`);
}
assert.match(read('categories/aftermarket-headlights-supplier.html'), /href="\.\.\/blog\/headlight-assembly-vs-head-lamp-difference"/);
for (const file of categories) {
  const source = read(`categories/${file}`);
  const breadcrumb = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])).find(item => item['@type'] === 'BreadcrumbList');
  assert.equal(breadcrumb.itemListElement[1].item, 'https://www.ipackautoparts.com/product');
}
const indexLastmod = read('sitemap-core.xml').match(/<loc>https:\/\/www\.ipackautoparts\.com\/blog<\/loc>\s*<lastmod>([^<]+)/)[1];
assert.match(indexLastmod, /^\d{4}-\d{2}-\d{2}$/);
console.log(`SEO guide checks passed: ${guides.length} discoverable guides, ${categories.length} categories, static targets, buyer copy, conversion links, and matching update dates. ${runtimeLinks.size} backend routes left for HTTP verification.`);
