(() => {
  const grid = document.getElementById('home-featured-grid');
  const categories = document.getElementById('home-category-grid');
  if (!grid || !categories) return;

  const escape = window.catalogEscape;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const products = window.loadProductsData();
  products.then(items => {
    if (!items) throw new Error('Catalog unavailable');
    const selected = items.filter(item => item.featured === true).slice(0, 4);
    grid.innerHTML = selected.length ? selected.map(window.productCard).join('') : '<p class="home-catalog-status" role="status">Explore the <a href="/product">full product catalog</a> or <a href="#request-quote">send your requirements</a> for help finding a part.</p>';
  }).catch(() => {
    grid.innerHTML = '<p class="home-catalog-status" role="status">Selected products are temporarily unavailable. <a href="/product">Try the catalog</a> or <a href="#request-quote">send your requirements</a>.</p>';
  }).finally(() => grid.setAttribute('aria-busy', 'false'));

  // Reuse the Product menu's request so both entry points show the same category data.
  const categoryRequest = window.__ipackCategoryPromise ||= fetch('/api/categories', { cache: 'no-store', headers: { Accept: 'application/json' } })
    .then(async response => {
      if (!response.ok) throw new Error('Categories unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid categories');
      return data;
    });
  Promise.all([products, categoryRequest]).then(([items, allCategories]) => {
    if (!items) throw new Error('Catalog unavailable');
    const roots = allCategories.filter(item => !item.parentId);
    categories.innerHTML = roots.map(category => {
      const ids = [category.id, ...allCategories.filter(item => item.parentId === category.id).map(item => item.id)];
      const aliases = [category.name, category.slug, ...(category.aliases || [])].map(value => String(value).toLowerCase());
      const product = items.find(item => item.image && !String(item.image).endsWith('/parts-showcase.webp') && ((item.categoryPath || []).some(part => ids.includes(part.id)) || aliases.includes(String(item.category || '').trim().toLowerCase())));
      const image = product?.image ? `<img src="${escape(window.catalogImage(product.image))}" alt="" loading="lazy" decoding="async" width="320" height="240"/>` : '<div class="home-category-no-image">Explore this category</div>';
      return `<a class="home-category" href="/product?category=${encodeURIComponent(category.slug)}"><div class="home-category-image">${image}</div><div class="home-category-title"><h3>${escape(category.name)}</h3>${arrow}</div></a>`;
    }).join('') || '<p class="home-catalog-status" role="status">Browse the <a href="/product">full product catalog</a> to find your part.</p>';
  }).catch(() => {
    categories.innerHTML = '<p class="home-catalog-status" role="status">Product categories are temporarily unavailable. <a href="/product">Browse all products</a> or <a href="#request-quote">ask us about your part</a>.</p>';
  });
})();
