(() => {
  const grid = document.getElementById('product-directory-grid');
  const count = document.getElementById('product-directory-count');
  const sort = document.getElementById('product-directory-sort');
  const prev = document.getElementById('product-directory-prev');
  const next = document.getElementById('product-directory-next');
  const pageLabel = document.getElementById('product-directory-page');
  if(!grid || !count || !sort || !prev || !next || !pageLabel) return;

  const pageSize = 20;
  let products = [];
  let page = 1;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const imageUrl = value => {
    const path = String(value || '');
    return /^(?:\/?assets\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)|\/api\/product-media\/[0-9a-f-]{36})$/.test(path) && !path.includes('..') ? '/' + path.replace(/^\//, '') : '/assets/images/headlights.webp';
  };

  function sortedProducts() {
    const items = [...products];
    if(sort.value === 'title') return items.sort((a, b) => String(a.displayTitle || a.title).localeCompare(String(b.displayTitle || b.title)));
    if(sort.value === 'category') return items.sort((a, b) => String(a.category || '').localeCompare(String(b.category || '')) || String(a.title || '').localeCompare(String(b.title || '')));
    return items.sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || Number(a.rank || 9999) - Number(b.rank || 9999));
  }

  function card(product, index) {
    const h = escapeHtml;
    const title = product.displayTitle || product.title || 'Auto Part';
    const url = '/products/' + encodeURIComponent(product.slug);
    const fitment = [product.make, product.model, product.years].filter(Boolean).join(' ');
    const oe = (product.oeNumbers || []).join(', ');
    const secondary = product.hoverImage ? `<img class="secondary" src="${h(imageUrl(product.hoverImage))}" alt="${h(title)} additional view" loading="lazy" decoding="async">` : '';
    const loading = index < 5 ? 'eager' : 'lazy';
    return `<article class="directory-card">
      <a class="directory-card-image" href="${h(url)}" aria-label="View ${h(title)}"><img class="primary" src="${h(imageUrl(product.image))}" alt="${h(title)}" loading="${loading}" decoding="async">${secondary}</a>
      <div class="directory-card-body"><h3>${h(title)}</h3><p class="directory-card-meta">${h(product.category || 'Auto Parts')}${fitment ? `<br>${h(fitment)}` : ''}${oe ? `<br>OE: ${h(oe)}` : ''}</p>
      <div class="directory-card-actions"><a href="${h(url)}">View product →</a><button type="button" data-add-inquiry data-id="${h(product.id)}" data-title="${h(title)}" data-category="${h(product.category || '')}" data-fitment="${h(fitment)}" data-oe="${h(oe)}" data-url="${h(url)}">Add RFQ</button></div></div>
    </article>`;
  }

  function render() {
    const items = sortedProducts();
    const pages = Math.max(1, Math.ceil(items.length / pageSize));
    page = Math.min(page, pages);
    grid.innerHTML = items.slice((page - 1) * pageSize, page * pageSize).map(card).join('');
    grid.setAttribute('aria-busy', 'false');
    count.textContent = `${items.length} items`;
    pageLabel.textContent = `Page ${page} of ${pages}`;
    prev.disabled = page === 1;
    next.disabled = page === pages;
  }

  sort.addEventListener('change', () => { page = 1; render(); });
  prev.addEventListener('click', () => { if(page > 1) { page -= 1; render(); scrollTo({top: document.querySelector('.product-directory-section').offsetTop, behavior: 'smooth'}); } });
  next.addEventListener('click', () => { if(page * pageSize < products.length) { page += 1; render(); scrollTo({top: document.querySelector('.product-directory-section').offsetTop, behavior: 'smooth'}); } });

  fetch('/api/catalog', {cache: 'no-store', headers: {Accept: 'application/json'}})
    .then(async response => { if(!response.ok) throw new Error('Catalog unavailable'); return response.json(); })
    .then(data => { if(!Array.isArray(data)) throw new Error('Invalid catalog'); products = data; render(); })
    .catch(() => {
      grid.setAttribute('aria-busy', 'false');
      count.textContent = 'Products unavailable';
      grid.innerHTML = '<p class="product-directory-error" role="alert">The catalog is temporarily unavailable. Please <a href="/contact">contact us</a> or try again later.</p>';
      prev.hidden = true;
      next.hidden = true;
    });
})();
