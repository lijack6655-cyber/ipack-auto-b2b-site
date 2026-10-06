(() => {
  const catalogPromiseKey = '__ipackCatalogPromise';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const image = value => {
    const path = String(value || '');
    return /^(?:\/?assets\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)|\/api\/product-media\/[0-9a-f-]{36})$/.test(path) && !path.includes('..')
      ? '/' + path.replace(/^\//, '')
      : '/assets/images/headlights.webp';
  };

  window.catalogEscape = window.catalogEscape || escape;
  window.catalogImage = window.catalogImage || image;
  window.loadProductsData = window.loadProductsData || (() => {
    if(window[catalogPromiseKey]) return window[catalogPromiseKey];
    window[catalogPromiseKey] = fetch('/api/catalog', {
      cache: 'no-store',
      headers: {Accept: 'application/json'}
    }).then(async response => {
      if(!response.ok) throw new Error('Catalog unavailable');
      const data = await response.json();
      if(!Array.isArray(data)) throw new Error('Invalid catalog');
      return data;
    });
    return window[catalogPromiseKey];
  });

  const nav = document.querySelector('.main-nav');
  if(!nav || nav.querySelector('.product-menu')) return;
  const productLink = [...nav.querySelectorAll('a')].find(link => {
    try { return new URL(link.href, location.href).pathname.replace(/\/$/, '') === '/product'; } catch(_) { return false; }
  });
  if(!productLink) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'product-menu';
  productLink.replaceWith(wrapper);
  wrapper.appendChild(productLink);
  const menuId = 'product-menu-panel';
  const toggle = document.createElement('button');
  toggle.className = 'product-menu-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Toggle Product menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', menuId);
  toggle.innerHTML = '<span aria-hidden="true">⌄</span>';
  wrapper.appendChild(toggle);
  const panel = document.createElement('div');
  panel.className = 'product-menu-panel';
  panel.id = menuId;
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Product categories');
  panel.innerHTML = '<div class="product-menu-loading">Loading product categories…</div>';
  wrapper.appendChild(panel);

  let closeTimer;
  let catalogStarted = false;
  let hoverOpened = false;
  const close = restoreFocus => {
    clearTimeout(closeTimer);
    if(panel.hidden) return;
    panel.hidden = true;
    wrapper.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    hoverOpened = false;
    if(restoreFocus) toggle.focus();
  };
  const open = () => {
    clearTimeout(closeTimer);
    panel.hidden = false;
    wrapper.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    hydrateCatalog();
  };
  const toggleMenu = () => {
    if(hoverOpened) {
      hoverOpened = false;
      open();
      return;
    }
    panel.hidden ? open() : close(false);
  };
  toggle.addEventListener('click', toggleMenu);
  toggle.addEventListener('keydown', event => {
    if(event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
    if(event.key === 'Escape') close(true);
  });
  wrapper.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
    if(window.innerWidth > 760 && panel.hidden) {
      hoverOpened = true;
      open();
    }
  });
  wrapper.addEventListener('mouseleave', () => {
    if(window.innerWidth > 760) {
      closeTimer = setTimeout(() => close(false), 120);
    }
  });
  wrapper.addEventListener('focusout', event => {
    if(!wrapper.contains(event.relatedTarget)) close(false);
  });
  document.addEventListener('click', event => {
    if(!wrapper.contains(event.target)) close(false);
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && !panel.hidden) close(true);
  });

  const categoryPromiseKey = '__ipackCategoryPromise';
  const loadCategories = () => {
    if(window[categoryPromiseKey]) return window[categoryPromiseKey];
    window[categoryPromiseKey] = fetch('/api/categories', {cache: 'no-store', headers: {Accept: 'application/json'}})
      .then(async response => { if(!response.ok) throw new Error('Categories unavailable'); const data = await response.json(); if(!Array.isArray(data)) throw new Error('Invalid categories'); return data; });
    return window[categoryPromiseKey];
  };
  const productTitle = product => product.displayTitle || product.title || 'Auto Part';

  function renderCatalog(products, categories) {
    const roots = categories.filter(item => !item.parentId);
    const children = root => categories.filter(item => item.parentId === root.id);
    const matches = (product, item, root) => {
      const path = Array.isArray(product.categoryPath) ? product.categoryPath : [];
      if(path.some(part => part.id === item.id || part.slug === item.slug)) return true;
      if(root && path.some(part => part.id === root.id || part.slug === root.slug)) return true;
      const aliases = [item.name, item.slug, ...(item.aliases || [])].map(value => String(value).toLowerCase());
      return aliases.includes(String(product.category || '').trim().toLowerCase());
    };
    const byCategory = item => products.find(product => matches(product, item, item.parentId ? categories.find(entry => entry.id === item.parentId) : null));
    const cards = roots.map(root => {
      const product = byCategory(root) || children(root).map(byCategory).find(Boolean);
      const src = product && product.image ? window.catalogImage(product.image) : '/assets/images/headlights.webp';
      const total = Number(root.count || 0) + children(root).reduce((sum, child) => sum + Number(child.count || 0), 0);
      return `<a class="product-menu-category-card" href="/product?category=${encodeURIComponent(root.slug)}"><img src="${window.catalogEscape(src)}" alt="" loading="lazy" decoding="async"><span>${window.catalogEscape(root.name)} <small>${total}</small></span></a>`;
    }).join('');
    const directory = roots.map(root => {
      const kids = children(root);
      const total = Number(root.count || 0) + kids.reduce((sum, child) => sum + Number(child.count || 0), 0);
      return `<li><a href="/product?category=${encodeURIComponent(root.slug)}">${window.catalogEscape(root.name)} <span>${total}</span></a>${kids.length ? `<ul>${kids.map(child => `<li><a href="/product?category=${encodeURIComponent(child.slug)}">${window.catalogEscape(child.name)} <span>${Number(child.count || 0)}</span></a></li>`).join('')}</ul>` : ''}</li>`;
    }).join('');
    const featuredProducts = products.filter(product => product.featured === true).slice(0, 5);
    const featured = featuredProducts.map(product => {
      const title = productTitle(product);
      return `<a class="product-menu-featured-card" href="/products/${encodeURIComponent(product.slug)}"><img src="${window.catalogEscape(window.catalogImage(product.image))}" alt="${window.catalogEscape(title)}" loading="lazy" decoding="async"><span>${window.catalogEscape(title)}</span></a>`;
    }).join('');
    const featuredSection = featuredProducts.length ? `<div class="product-menu-heading product-menu-featured-heading"><div><h2>Featured products</h2></div></div><div class="product-menu-featured-grid">${featured}</div>` : '';
    panel.innerHTML = `<div class="product-menu-directory"><p class="product-menu-kicker">Browse product line</p><ul>${directory}</ul><div class="product-menu-utility"><a href="/product">All Products</a><a href="/products">Search</a><a href="/contact">Contact</a></div></div><div class="product-menu-showcase"><div class="product-menu-heading"><div><p class="product-menu-kicker">Explore by category</p><h2>Parts for your next order</h2></div><a href="/product">View all products <span aria-hidden="true">→</span></a></div><div class="product-menu-category-grid">${cards}</div>${featuredSection}</div>`;
  }

  function renderFallback(note = 'Product categories are temporarily unavailable. Browse all products or contact us for help.') {
    panel.innerHTML = `<div class="product-menu-directory product-menu-fallback"><p class="product-menu-kicker">Browse product line</p><ul><li><a href="/product">All Products</a></li></ul><div class="product-menu-utility"><a href="/products">Search</a><a href="/contact">Contact</a></div><p class="product-menu-note">${window.catalogEscape(note)}</p></div>`;
  }

  function hydrateCatalog() {
    if(catalogStarted) return;
    catalogStarted = true;
    Promise.all([window.loadProductsData(), loadCategories()]).then(([products, categories]) => renderCatalog(products, categories)).catch(() => {
      window.loadProductsData().then(products => {
        const categories = [...new Set(products.map(product => String(product.category || '').trim()).filter(Boolean))].map((name, index) => ({id: `legacy-${index}`, name, slug: name, count: products.filter(product => product.category === name).length}));
        renderCatalog(products, categories);
      }).catch(() => renderFallback());
    });
  }
  renderFallback('Loading live categories…');
})();
