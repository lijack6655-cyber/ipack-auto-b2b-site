const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/js/articles.js'), 'utf8');
function element() { return { children: [], style: {}, append(...items) { this.children.push(...items); } }; }
async function check(payload, ok = true) {
  const container = element(), status = element();
  await vm.runInNewContext(script, {
    URL,
    document: { getElementById: id => id === 'company-news' ? container : status, createElement: element },
    fetch: async (url, options) => {
      assert.equal(url, '/api/articles'); assert.equal(options.cache, 'no-store');
      return { ok, json: async () => payload };
    },
  });
  return { container, status };
}
(async () => {
  const { container } = await check({ articles: [
    { slug: 'safe-article', title: '<script>alert(1)</script>', excerpt: 'Plain text', featured_image_path: '/assets/images/event.jpg' },
    { slug: 'javascript:alert(1)', title: 'Unsafe' },
  ] });
  assert.equal(container.children.length, 1);
  assert.equal(container.children[0].href, '/news/safe-article');
  assert.equal(container.children[0].children[1].textContent, '<script>alert(1)</script>');
  assert.match((await check({ articles: [] })).status.textContent, /will appear/);
  assert.match((await check(null, false)).status.textContent, /temporarily unavailable/);
  assert.match((await check({})).status.textContent, /temporarily unavailable/);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  for (const route of ['/news/:slug', '/api/articles', '/sitemap-articles.xml']) assert(config.rewrites.some(r => r.source === route));
  for (const route of ['/news/(.*)', '/sitemap-articles.xml']) assert(config.headers.some(r => r.source === route && r.headers.some(h => h.key === 'Cache-Control' && h.value === 'no-store')));
  assert.equal((fs.readFileSync(path.join(root, 'blog.html'), 'utf8').match(/<h1>/g) || []).length, 1);
  assert(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').includes('/sitemap-articles.xml'));
  console.log('Article list, safe text rendering, failures, routes and sitemap checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
