(() => {
  const grid = document.getElementById('product-directory-grid');
  const count = document.getElementById('product-directory-count');
  const category = document.getElementById('product-directory-category');
  const sort = document.getElementById('product-directory-sort');
  const prev = document.getElementById('product-directory-prev');
  const next = document.getElementById('product-directory-next');
  const pageLabel = document.getElementById('product-directory-page');
  const tree = document.getElementById('product-directory-tree');
  const breadcrumb = document.getElementById('product-directory-breadcrumb');
  const heading = document.getElementById('product-directory-heading');
  if(!grid || !count || !category || !sort || !prev || !next || !pageLabel || !tree || !breadcrumb || !heading) return;

  const pageSize = 20;
  let products = [];
  let categories = [];
  let page = 1;
  let selectedCategory = null;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const imageUrl = value => {
    const path = String(value || '');
    return /^(?:\/?assets\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)|\/api\/product-media\/[0-9a-f-]{36})$/.test(path) && !path.includes('..') ? '/' + path.replace(/^\//, '') : '/assets/images/headlights.webp';
  };
  const roots = () => categories.filter(item => !item.parentId);
  const childrenOf = id => categories.filter(item => item.parentId === id);
  const categoryUrl = item => `/product?category=${encodeURIComponent(item.slug)}`;
  const aliasesOf = item => [item.name, item.slug, ...(Array.isArray(item.aliases) ? item.aliases : [])].filter(Boolean).map(value => String(value).trim().toLowerCase());
  const findCategory = value => categories.find(item => aliasesOf(item).includes(String(value || '').trim().toLowerCase())) || null;
  function productPath(product) {
    if(Array.isArray(product.categoryPath) && product.categoryPath.length) return product.categoryPath;
    const legacy = findCategory(product.category);
    if(!legacy) return [];
    const parent = categories.find(item => item.id === legacy.parentId);
    return parent ? [{id: parent.id, name: parent.name, slug: parent.slug}, {id: legacy.id, name: legacy.name, slug: legacy.slug}] : [{id: legacy.id, name: legacy.name, slug: legacy.slug}];
  }
  function belongs(product, item) {
    const path = productPath(product);
    if(!path.length) return false;
    return item.parentId ? path.some(part => part.id === item.id || part.slug === item.slug) : path.some(part => part.id === item.id) || path[0].slug === item.slug;
  }
  function visibleProducts() {
    let items = products.filter(product => !selectedCategory || belongs(product, selectedCategory));
    if(sort.value === 'title') items.sort((a, b) => String(a.displayTitle || a.title).localeCompare(String(b.displayTitle || b.title)));
    else if(sort.value === 'category') items.sort((a, b) => String(a.category || '').localeCompare(String(b.category || '')) || String(a.title || '').localeCompare(String(b.title || '')));
    else items.sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || Number(a.rank || 9999) - Number(b.rank || 9999));
    return items;
  }
  function card(product, index) {
    const h = escapeHtml;
    const title = product.displayTitle || product.title || 'Auto Part';
    const url = '/products/' + encodeURIComponent(product.slug);
    const fitment = [product.make, product.model, product.years].filter(Boolean).join(' ');
    const oe = (product.oeNumbers || []).join(', ');
    const secondary = product.hoverImage ? `<img class="secondary" src="${h(imageUrl(product.hoverImage))}" alt="${h(title)} additional view" loading="lazy" decoding="async">` : '';
    const leaf = productPath(product).at(-1);
    const categoryLink = leaf ? `<a class="directory-card-category" href="${h(categoryUrl(leaf))}">${h(leaf.name)}</a>` : h(product.category || 'Auto Parts');
    const loading = index < 5 ? 'eager' : 'lazy';
    return `<article class="directory-card">
      <a class="directory-card-image" href="${h(url)}" aria-label="View ${h(title)}"><img class="primary" src="${h(imageUrl(product.image))}" alt="${h(title)}" loading="${loading}" decoding="async">${secondary}</a>
      <div class="directory-card-body"><h3>${h(title)}</h3><p class="directory-card-meta">${categoryLink}${fitment ? `<br>${h(fitment)}` : ''}${oe ? `<br>OE: ${h(oe)}` : ''}</p>
      <div class="directory-card-actions"><a href="${h(url)}">View product →</a><button type="button" data-add-inquiry data-id="${h(product.id)}" data-title="${h(title)}" data-category="${h(product.category || '')}" data-fitment="${h(fitment)}" data-oe="${h(oe)}" data-url="${h(url)}">Add RFQ</button></div></div>
    </article>`;
  }
  function renderTree() {
    tree.innerHTML = `<ul>${roots().map(root => {
      const children = childrenOf(root.id);
      const total = Number(root.count || 0) + children.reduce((sum, child) => sum + Number(child.count || 0), 0);
      const active = selectedCategory && (selectedCategory.id === root.id || selectedCategory.parentId === root.id);
      return `<li><a class="${active && !selectedCategory.parentId ? 'is-active' : ''}" href="${escapeHtml(categoryUrl(root))}">${escapeHtml(root.name)} <span>${total}</span></a>${children.length ? `<ul>${children.map(child => `<li><a class="${selectedCategory && selectedCategory.id === child.id ? 'is-active' : ''}" href="${escapeHtml(categoryUrl(child))}">${escapeHtml(child.name)} <span>${Number(child.count || 0)}</span></a></li>`).join('')}</ul>` : ''}</li>`;
    }).join('')}</ul>`;
  }
  function renderBreadcrumb() {
    const path = selectedCategory ? categories.find(item => item.id === selectedCategory.parentId) ? [categories.find(item => item.id === selectedCategory.parentId), selectedCategory] : [selectedCategory] : [];
    breadcrumb.innerHTML = `<a href="/">Home</a><span aria-hidden="true">/</span><a href="/product">Product</a>${path.map((item, index) => index === path.length - 1 ? `<span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(item.name)}</span>` : `<span aria-hidden="true">/</span><a href="${escapeHtml(categoryUrl(item))}">${escapeHtml(item.name)}</a>`).join('')}`;
    heading.textContent = selectedCategory ? selectedCategory.name : 'Product';
  }
  function render() {
    const items = visibleProducts();
    const pages = Math.max(1, Math.ceil(items.length / pageSize));
    page = Math.min(page, pages);
    grid.innerHTML = items.length ? items.slice((page - 1) * pageSize, page * pageSize).map(card).join('') : '<p class="product-directory-empty">No products found in this category.</p>';
    grid.setAttribute('aria-busy', 'false');
    count.textContent = `${items.length} items`;
    pageLabel.textContent = `Page ${page} of ${pages}`;
    prev.disabled = page === 1;
    next.disabled = page === pages;
    renderTree();
    renderBreadcrumb();
  }
  function setSelected(item) {
    selectedCategory = item;
    page = 1;
    category.value = item ? item.slug : '';
    const url = new URL(location.href);
    if(item) url.searchParams.set('category', item.slug);
    else url.searchParams.delete('category');
    history.replaceState(null, '', url.pathname + (url.search || '') + (url.hash || ''));
    render();
  }
  category.addEventListener('change', () => setSelected(categories.find(item => item.slug === category.value) || null));
  tree.addEventListener('click', event => {
    const link = event.target.closest('a[href*="category="]');
    if(!link) return;
    const slug = new URL(link.href, location.href).searchParams.get('category');
    const item = categories.find(entry => entry.slug === slug);
    if(item) { event.preventDefault(); setSelected(item); }
  });
  sort.addEventListener('change', () => { page = 1; render(); });
  prev.addEventListener('click', () => { if(page > 1) { page -= 1; render(); scrollTo({top: document.querySelector('.product-directory-section').offsetTop, behavior: 'smooth'}); } });
  next.addEventListener('click', () => { if(page < Math.ceil(visibleProducts().length / pageSize)) { page += 1; render(); scrollTo({top: document.querySelector('.product-directory-section').offsetTop, behavior: 'smooth'}); } });

  const loadProductsData = window.loadProductsData || (() => fetch('/api/catalog', {cache: 'no-store', headers: {Accept: 'application/json'}}).then(async response => { if(!response.ok) throw new Error('Catalog unavailable'); return response.json(); }));
  Promise.all([loadProductsData(), fetch('/api/categories', {cache: 'no-store', headers: {Accept: 'application/json'}}).then(async response => { if(!response.ok) throw new Error('Categories unavailable'); return response.json(); })])
    .then(([data, treeData]) => {
      if(!Array.isArray(data) || !Array.isArray(treeData)) throw new Error('Invalid catalog');
      products = data;
      categories = treeData;
      const requested = new URLSearchParams(location.search).get('category');
      selectedCategory = requested ? findCategory(requested) : null;
      category.innerHTML = '<option value="">All categories</option>' + roots().map(root => {
        const kids = childrenOf(root.id);
        const rootTotal = Number(root.count || 0) + kids.reduce((sum, child) => sum + Number(child.count || 0), 0);
        return `<option value="${escapeHtml(root.slug)}">${escapeHtml(root.name)} (${rootTotal})</option>${kids.map(child => `<option value="${escapeHtml(child.slug)}">— ${escapeHtml(child.name)} (${Number(child.count || 0)})</option>`).join('')}`;
      }).join('');
      if(requested && !selectedCategory) category.insertAdjacentHTML('beforeend', `<option value="" selected>Unknown category (${escapeHtml(requested)})</option>`);
      else if(selectedCategory) {
        category.value = selectedCategory.slug;
        if(requested !== selectedCategory.slug) {
          const canonical = new URL(location.href);
          canonical.searchParams.set('category', selectedCategory.slug);
          history.replaceState(null, '', canonical.pathname + canonical.search + canonical.hash);
        }
      }
      if(requested && !selectedCategory) {
        count.textContent = '0 items';
        grid.innerHTML = '<p class="product-directory-empty">This category is unavailable. Choose a category or view all products.</p>';
        grid.setAttribute('aria-busy', 'false');
        pageLabel.textContent = 'Page 1 of 1'; prev.disabled = true; next.disabled = true;
        renderTree(); renderBreadcrumb();
        heading.textContent = 'Category unavailable';
        breadcrumb.insertAdjacentHTML('beforeend', `<span aria-hidden="true">/</span><span aria-current="page">Unknown: ${escapeHtml(requested)}</span>`);
        return;
      }
      render();
    })
    .catch(() => {
      grid.setAttribute('aria-busy', 'false');
      count.textContent = 'Products unavailable';
      grid.innerHTML = '<p class="product-directory-error" role="alert">The catalog is temporarily unavailable. Please <a href="/contact">contact us</a> or try again later.</p>';
      prev.hidden = true;
      next.hidden = true;
    });
})();
