
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if(menuToggle && mainNav) {
  menuToggle.setAttribute('aria-label','Toggle navigation');
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.addEventListener('click',()=>{
    const open = mainNav.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', (e)=>{
    if(window.innerWidth > 760) return;
    if(mainNav.contains(e.target) || menuToggle.contains(e.target)) return;
    mainNav.classList.remove('show');
    menuToggle.setAttribute('aria-expanded','false');
  });
}


const QUOTE_KEY = 'ipack_inquiry_list_v4';

function getQuoteList() {
  try { return JSON.parse(localStorage.getItem(QUOTE_KEY) || '[]'); } catch(e) { return []; }
}

function setQuoteList(list) {
  localStorage.setItem(QUOTE_KEY, JSON.stringify(list));
  updateQuoteCount();
  renderQuoteList();
}

function updateQuoteCount() {
  const el = document.getElementById('quote-count');
  if(el) el.textContent = getQuoteList().length;
}

function productLineForRFQ(x, i) {
  return [
    `${i + 1}. ${x.title || 'Auto Parts Product'}`,
    x.category ? `Category: ${x.category}` : '',
    x.fitment ? `Fitment: ${x.fitment}` : '',
    x.oe ? `OE / Part No.: ${x.oe}` : '',
    x.qty ? `Quantity: ${x.qty}` : 'Quantity: ',
    x.url ? `Page: ${x.url}` : ''
  ].filter(Boolean).join('\n');
}

function buildRFQText(list) {
  if(!list.length) return '';
  return list.map(productLineForRFQ).join('\n\n');
}

function addInquiry(item) {
  const list = getQuoteList();
  const key = item.id || item.url || item.title;
  const existing = list.find(x => (x.id || x.url || x.title) === key);
  if(existing) {
    Object.assign(existing, item);
  } else {
    list.push(Object.assign({ qty: '' }, item));
  }
  setQuoteList(list);
  showInquiryToastV25(item);
}

function showInquiryToastV25(item) {
  let toast = document.querySelector('.inquiry-toast-v25');
  if(!toast) {
    toast = document.createElement('div');
    toast.className = 'inquiry-toast-v25';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<strong>Added to RFQ</strong><span>${item.title || 'Product'} has been added.</span><a href="${location.pathname.includes('/products/') ? '../quote-list' : 'quote-list'}">View Inquiry List</a>`;
  toast.classList.add('show');
  clearTimeout(window.__ipackToastTimer);
  window.__ipackToastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

document.addEventListener('click', (e)=> {
  const btn = e.target.closest('[data-add-inquiry]');
  if(!btn) return;
  addInquiry({
    id: btn.dataset.id || btn.dataset.url || btn.dataset.title,
    title: btn.dataset.title || '',
    category: btn.dataset.category || '',
    oe: btn.dataset.oe || '',
    fitment: btn.dataset.fitment || '',
    image: btn.dataset.image || '',
    url: btn.dataset.url || location.pathname
  });
});

updateQuoteCount();

function mailToFromForm(form, subjectPrefix='Website Inquiry') {
  const fd = new FormData(form);
  fd.append('_subject', subjectPrefix + ' - ' + (fd.get('company') || fd.get('name') || 'Buyer'));
  fetch('https://formspree.io/f/xnjybvyy', {
    method: 'POST',
    body: fd,
    headers: { 'Accept': 'application/json' }
  }).then(res => {
    if(res.ok) {
      alert('Your inquiry has been sent! We will reply within 1 hour.');
    } else {
      alert('Send failed. Please contact us via WhatsApp.');
    }
  }).catch(() => {
    alert('Network error. Please contact us via WhatsApp.');
  });
}

const vehicleForm = document.getElementById('vehicle-form');
if(vehicleForm) {
  vehicleForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(vehicleForm);
    const q = new URLSearchParams();
    for(const [k,v] of fd.entries()) if(String(v).trim()) q.set(k, v);
    location.href = 'products?' + q.toString() + '#fitment';
  });
}


const homeVehicleForm = document.getElementById('vehicle-form');
if(homeVehicleForm) {
  const makeField = homeVehicleForm.elements.make;
  const modelField = homeVehicleForm.elements.model;
  const modelMap = {"Toyota": ["Prius", "Prime", "Lexus", "Corolla", "Axio", "Fielder", "Camry", "RAV4", "Hiace", "Highlander", "Tacoma", "Vitz", "Yaris", "Noah", "Voxy", "Allion", "Premio", "Probox", "Succeed", "IST", "Scion XA", "Urban Cruiser", "Ractis", "Hilux", "Fortuner", "Land Cruiser", "Prado", "Rush", "Avanza", "Reiz", "Mark X", "Corolla Cross", "C-HR", "Yaris Cross"], "Honda": ["Fit", "Jazz", "Vezel", "HR-V", "CR-V", "Civic", "XR-V", "City", "Grace", "Accord", "Odyssey", "Brio", "Pilot"], "Nissan": ["Sunny", "Tiida", "X-Trail", "Navara", "Patrol", "Sentra", "Almera", "Kicks", "Rogue", "Altima"], "Suzuki": ["Swift", "Dzire", "S-Presso", "Ciaz", "Vitara", "Jimny", "Alto", "Ertiga"], "Hyundai/Kia": ["Elantra", "Tucson", "Sonata", "Sportage", "Rio", "Sorento", "Starex / H1", "Santa Fe", "K5"], "Mazda": ["Mazda 2", "Mazda 3", "Mazda 6", "CX-5", "BT-50"], "Mitsubishi": ["Lancer", "Pajero", "Outlander", "Triton", "L200"], "Ford": ["Ranger", "Everest", "Focus", "Transit", "Explorer", "F-150", "4x4 Pick up"], "Isuzu": ["D-MAX", "Dmax", "MU-X", "Hilux Vigo Reference", "4x4 Pick up"], "Pick-Up": ["Hilux Vigo", "Tacoma", "Isuzu D-MAX", "Isuzu Dmax", "Ford Ranger", "4x4 Pick up"], "Other": ["Photo Matching", "OE Matching", "4x4 Pick up"]};
  const allModels = Array.from(modelField.options).slice(1).map(o => o.value);
  const rebuildModels = () => {
    const current = modelField.value;
    const make = makeField.value;
    const list = modelMap[make] || allModels;
    modelField.innerHTML = '<option value="">Model</option>' + list.map(m => `<option value="${m}">${m}</option>`).join('');
    if(list.includes(current)) modelField.value = current;
  };
  if(makeField && modelField) {
    makeField.addEventListener('change', rebuildModels);
    rebuildModels();
  }
}

const oeForm = document.getElementById('oe-form');
if(oeForm) {
  oeForm.addEventListener('submit', e => {
    e.preventDefault();
    const v = new FormData(oeForm).get('search');
    location.href = 'products?search=' + encodeURIComponent(v || '') + '#fitment';
  });
}




function renderQuoteList() {
  const box = document.getElementById('quote-list-box');
  const hidden = document.getElementById('selected-products');
  const list = getQuoteList();

  if(box) {
    if(list.length === 0) {
      box.innerHTML = '<div class="note">Your inquiry list is empty. Browse products and click “Add to RFQ”.</div>';
    } else {
      box.innerHTML = list.map((x,i)=>{
        const img = x.image ? `<img src="${x.image}" alt="${x.title || 'Selected product'}">` : '';
        return `<div class="inquiry-row inquiry-row-v25">
          <div class="inquiry-product-media-v25">${img}</div>
          <div class="inquiry-product-main-v25">
            <strong>${x.title || 'Auto Parts Product'}</strong>
            <small>${[x.category, x.fitment, x.oe ? 'OE: '+x.oe : ''].filter(Boolean).join(' | ')}</small>
            <label>Quantity <input data-qty-index="${i}" value="${x.qty || ''}" placeholder="e.g. 20 pcs"></label>
          </div>
          <button class="btn btn-small btn-light" data-remove="${i}">Remove</button>
        </div>`;
      }).join('');
    }
  }

  if(hidden) hidden.value = buildRFQText(list);

  const message = document.querySelector('textarea[name="message"]');
  if(message && list.length && !message.dataset.manualEdited) {
    const prefix = 'Selected products are listed above. Extra requirements:\n';
    if(!message.value || message.value.startsWith('Selected products are listed above.')) {
      message.value = prefix + 'Vehicle model / OE number / quantity / destination country:\n';
    }
  }
}

document.addEventListener('input', e => {
  const qty = e.target.closest('[data-qty-index]');
  if(!qty) return;
  const list = getQuoteList();
  const idx = Number(qty.dataset.qtyIndex);
  if(list[idx]) {
    list[idx].qty = qty.value;
    localStorage.setItem(QUOTE_KEY, JSON.stringify(list));
    const hidden = document.getElementById('selected-products');
    if(hidden) hidden.value = buildRFQText(list);
  }
});

document.addEventListener('input', e => {
  if(e.target && e.target.matches('textarea[name="message"]')) {
    e.target.dataset.manualEdited = 'true';
  }
});

document.addEventListener('click', e => {
  const rm = e.target.closest('[data-remove]');
  if(!rm) return;
  const list = getQuoteList();
  list.splice(Number(rm.dataset.remove), 1);
  setQuoteList(list);
});

renderQuoteList();

/* V15 Products / OE / Vehicle Search Enhancement without extra vehicle taxonomy pages */

function normalizeText(v) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function cleanDisplayTitle(p) {
  if(p.displayTitle) return p.displayTitle;
  const oe = (p.oeNumbers || []).join(', ');
  let base = `${p.make || ''} ${p.model || ''} ${p.category || ''} ${oe}`.replace(/\s+/g,' ').trim();
  if(!base || base.length < 12) base = p.title || 'Auto Parts Item';
  if(p.years && !base.includes(p.years)) base += ` (${p.years})`;
  return base.length > 96 ? base.slice(0, 93) + '...' : base;
}
function productHay(p) {
  return normalizeText(`${p.title || ''} ${p.displayTitle || ''} ${p.category || ''} ${p.make || ''} ${p.model || ''} ${p.years || ''} ${(p.oeNumbers || []).join(' ')}`);
}
function itemMatches(p, criteria={}) {
  const hay = productHay(p);
  if(criteria.category && normalizeText(p.category) !== normalizeText(criteria.category)) return false;
  if(criteria.make) {
    const mk = normalizeText(criteria.make);
    const pm = normalizeText(p.make);
    const special = mk === 'hyundai/kia' ? ['hyundai','kia'] : mk === 'mercedes-benz' ? ['benz','mercedes'] : mk === 'rolls-royce' ? ['rolls royce','rolls-royce'] : [mk];
    if(pm !== mk && !special.some(x => hay.includes(x)) && pm !== 'multiple makes') return false;
  }
  if(criteria.model && !hay.includes(normalizeText(criteria.model))) return false;
  if(criteria.year && !normalizeText(p.years).includes(normalizeText(criteria.year))) return false;
  if(criteria.search) {
    const terms = normalizeText(criteria.search).split(' ').filter(Boolean);
    if(!terms.every(t => hay.includes(t))) return false;
  }
  return true;
}
function productCard(p) {
  const title = cleanDisplayTitle(p);
  const oe = (p.oeNumbers && p.oeNumbers.length) ? 'OE: ' + p.oeNumbers.join(', ') : 'OE matching available';
  const fitment = `${p.make || ''} ${p.model || ''} ${p.years || ''}`.replace(/\s+/g,' ').trim() || 'Vehicle matching available';
  const safeTitle = title.replaceAll('"','&quot;');
  const secondary = p.hoverImage ? `<img class="secondary" src="${p.hoverImage}" alt="${title} installed view" loading="lazy" decoding="async">` : '';
  const thumbNote = p.hoverImage ? `<span class="thumb-note">Hover to view real vehicle scene</span>` : `<span class="thumb-note">Clean product image</span>`;
  return `<article class="card product-card product-card-v15 ${p.hoverImage ? 'has-hover-scene' : ''}">
    <a class="product-thumb product-thumb-link-v21" href="products/${p.slug}" aria-label="View ${title}">
      <img class="primary" src="${p.image}" alt="${title}" loading="lazy" decoding="async">
      ${secondary}
      ${thumbNote}
    </a>
    <div class="card-pad">
      <div class="product-card-topline"><span class="badge">${p.category || 'Auto Parts'}</span><span class="mini-oe">${(p.oeNumbers||[])[0] || 'B2B RFQ'}</span></div>
      <h3>${title}</h3>
      <div class="meta">
        <span><strong>Fitment:</strong> ${fitment}</span>
        <span><strong>${oe}</strong></span>
        <span><strong>MOQ:</strong> ${p.moq || 'Contact us'} ${p.price ? '| ' + p.price : '| Wholesale quote'}</span>
      </div>
      <div class="card-actions">
        <a class="btn btn-small" href="products/${p.slug}">View Detail</a>
        <button class="btn btn-small btn-light" data-add-inquiry data-id="${p.id}" data-title="${safeTitle}" data-category="${p.category || ''}" data-oe="${(p.oeNumbers || []).join(', ')}" data-url="products/${p.slug}">Add RFQ</button>
      </div>
    </div>
  </article>`;
}
async function loadProductsData() {
  return await fetch('product-data.json').then(r=>r.json()).then(data => data.sort((a,b)=> (b.featured===true) - (a.featured===true)));
}
async function renderProductListingV15() {
  const grid = document.getElementById('product-listing-grid');
  if(!grid) return;
  const data = await loadProductsData();
  const params = new URLSearchParams(location.search);
  const form = document.getElementById('catalog-filter');
  const resetBtn = document.getElementById('reset-catalog-filter');
  const loadMoreBtn = document.getElementById('catalog-load-more');
  let visibleCount = 24;
  if(form) ['year','category','make','model','search'].forEach(k => { if(params.get(k) && form.elements[k]) form.elements[k].value = params.get(k); });
  const render = () => {
    const criteria = form ? Object.fromEntries(new FormData(form).entries()) : {};
    const hasFilter = Object.values(criteria).some(v => String(v||'').trim());
    const items = data.filter(p => itemMatches(p, criteria));
    const summary = document.getElementById('result-summary');
    if(summary) summary.textContent = hasFilter ? `Showing ${items.length} matched product(s)` : `Showing all ${items.length} products by default`;
    const shown = items.slice(0, visibleCount);
    grid.innerHTML = shown.map(productCard).join('') || `<div class="not-found-cta-v15"><div><h3>No matched products found</h3><p>Send your OE number, vehicle model or product photo. We can help confirm availability manually.</p></div><div class="card-actions"><a class="btn" href="contact">Send Requirement</a><a class="btn btn-light" href="oe-number-search">Search OE</a></div></div>`;
    if(loadMoreBtn) loadMoreBtn.style.display = items.length > visibleCount ? 'inline-flex' : 'none';
  };
  if(form) form.addEventListener('submit', e => { e.preventDefault(); visibleCount = 24; render(); });
  if(resetBtn) resetBtn.addEventListener('click', () => { form.reset(); visibleCount = 24; history.replaceState(null, '', location.pathname); render(); });
  if(loadMoreBtn) loadMoreBtn.addEventListener('click', () => { visibleCount += 24; render(); });
  render();
}
renderProductListingV15();

async function renderOeSearchCenterV15() {
  const box = document.getElementById('oe-search-results');
  const status = document.getElementById('oe-search-status');
  const form = document.getElementById('oe-center-form');
  if(!box || !form) return;
  const data = await loadProductsData();
  const input = form.elements.search;
  const params = new URLSearchParams(location.search);
  if(params.get('search')) input.value = params.get('search');
  const render = () => {
    const q = input.value.trim();
    let items = q ? data.filter(p => itemMatches(p, {search: q})) : data.filter(p => (p.oeNumbers || []).length).slice(0, 12);
    if(status) status.innerHTML = q ? `<strong>Search result for:</strong> ${q} · ${items.length} matched product(s)` : `<strong>Popular OE-ready products</strong> · Enter an OE number or keyword for exact matching.`;
    box.innerHTML = items.map(productCard).join('') || `<div class="not-found-cta-v15"><div><h3>No OE match found</h3><p>Send the OE number, vehicle model and product photo. We will check manually and reply with availability.</p></div><div class="card-actions"><a class="btn" href="contact">Send OE Number</a><a class="btn btn-light" href="products">Browse Products</a></div></div>`;
  };
  form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); history.replaceState(null, '', q ? `oe-number-search?search=${encodeURIComponent(q)}` : 'oe-number-search'); render(); });
  render();
}
renderOeSearchCenterV15();

async function renderVehicleSearchCenterV15() {
  const box = document.getElementById('vehicle-search-results');
  const status = document.getElementById('vehicle-search-status');
  const form = document.getElementById('vehicle-center-form');
  if(!box || !form) return;
  const data = await loadProductsData();
  const params = new URLSearchParams(location.search);
  ['year','make','model','category'].forEach(k => { if(params.get(k) && form.elements[k]) form.elements[k].value = params.get(k); });
  const render = () => {
    const criteria = Object.fromEntries(new FormData(form).entries());
    const hasFilter = Object.values(criteria).some(v => String(v||'').trim());
    const items = hasFilter ? data.filter(p => itemMatches(p, criteria)) : data.slice(0, 12);
    if(status) status.innerHTML = hasFilter ? `<strong>Vehicle search result:</strong> ${items.length} matched product(s)` : `<strong>Featured catalog products</strong> · Select year, make, model or category to narrow results.`;
    box.innerHTML = items.map(productCard).join('') || `<div class="not-found-cta-v15"><div><h3>No vehicle match found</h3><p>Send vehicle model, OE number and product photo so we can check manually.</p></div><div class="card-actions"><a class="btn" href="contact">Send Vehicle Info</a><a class="btn btn-light" href="oe-number-search">Search OE</a></div></div>`;
  };
  form.addEventListener('submit', e => { e.preventDefault(); render(); });
  render();
}
renderVehicleSearchCenterV15();



/* V23 RFQ image upload + paste support */
function initRfqImageZonesV23() {
  document.querySelectorAll('.image-rfq-zone-v23').forEach((zone, zoneIndex) => {
    const fileInput = zone.querySelector('input[type="file"]');
    const pasteBox = zone.querySelector('.paste-dropzone-v23');
    const preview = zone.querySelector('.image-preview-grid-v23');
    const hidden = zone.querySelector('input[name="pasted_image_summary"]');
    const pastedFiles = [];

    function updateHidden() {
      const selected = fileInput && fileInput.files ? Array.from(fileInput.files).map(f => f.name) : [];
      const pasted = pastedFiles.map((f, i) => f.name || `pasted-image-${i+1}.png`);
      if(hidden) hidden.value = [
        selected.length ? `Uploaded: ${selected.join(', ')}` : '',
        pasted.length ? `Pasted: ${pasted.join(', ')}` : ''
      ].filter(Boolean).join(' | ');
    }

    function addPreview(file, sourceLabel) {
      if(!file || !file.type || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const item = document.createElement('div');
        item.className = 'image-preview-item-v23';
        item.innerHTML = `<img src="${e.target.result}" alt="${sourceLabel} preview"><span>${sourceLabel}</span>`;
        preview.appendChild(item);
      };
      reader.readAsDataURL(file);
    }

    if(fileInput) {
      fileInput.addEventListener('change', () => {
        preview.innerHTML = '';
        Array.from(fileInput.files || []).forEach(file => addPreview(file, 'Upload'));
        pastedFiles.forEach(file => addPreview(file, 'Pasted'));
        updateHidden();
      });
    }

    if(pasteBox) {
      pasteBox.addEventListener('focus', () => {
        if(pasteBox.textContent.includes('Click here')) pasteBox.textContent = '';
      });
      pasteBox.addEventListener('paste', e => {
        const items = e.clipboardData && e.clipboardData.items ? Array.from(e.clipboardData.items) : [];
        const images = items
          .filter(item => item.type && item.type.startsWith('image/'))
          .map(item => item.getAsFile())
          .filter(Boolean);
        if(images.length) {
          e.preventDefault();
          images.forEach((file, i) => {
            const renamed = new File([file], `pasted-product-photo-${Date.now()}-${i+1}.png`, { type: file.type || 'image/png' });
            pastedFiles.push(renamed);
            addPreview(renamed, 'Pasted');
          });
          pasteBox.textContent = `${pastedFiles.length} pasted image(s) added. You can paste more or select files.`;
          updateHidden();
        }
      });
    }

    const form = zone.closest('form');
    if(form) {
      form.addEventListener('submit', () => {
        updateHidden();
      });
    }
  });
}
initRfqImageZonesV23();



/* V25: product detail thumbnail hover controls main gallery */
function initDetailGalleryHoverV25() {
  document.querySelectorAll('.detail-gallery').forEach(gallery => {
    const slider = gallery.querySelector('.detail-slider-v21');
    if(!slider) return;
    const slides = Array.from(slider.querySelectorAll('.slide-v21'));
    const thumbs = Array.from(gallery.querySelectorAll('[data-gallery-target]'));

    function showTarget(target) {
      if(!target) return;
      slider.classList.add('manual-v25');
      slides.forEach((img, idx) => {
        const same = img.getAttribute('src') === target || img.getAttribute('src') === target.replace(/^\.\.\//,'');
        img.classList.toggle('active-v25', same);
      });
      thumbs.forEach(t => t.classList.toggle('active-thumb-v25', t.dataset.galleryTarget === target));
    }

    thumbs.forEach(thumb => {
      const target = thumb.dataset.galleryTarget;
      thumb.addEventListener('mouseenter', () => showTarget(target));
      thumb.addEventListener('focus', () => showTarget(target));
      thumb.addEventListener('click', () => showTarget(target));
    });

    gallery.addEventListener('mouseleave', () => {
      slider.classList.remove('manual-v25');
      slides.forEach(img => img.classList.remove('active-v25'));
      thumbs.forEach(t => t.classList.remove('active-thumb-v25'));
    });
  });
}
initDetailGalleryHoverV25();


// V49 mobile homepage fitment RFQ
(function(){
  const root = document.getElementById('mobile-fitment-rfq-v49');
  if(!root) return;
  const $ = (s) => root.querySelector(s);
  const years = Array.from({length: 2026 - 1984 + 1}, (_, i) => 1984 + i);
  const models = {
    'Toyota':['Prius','Prime','Corolla','Axio','Fielder','Camry','RAV4','Hiace','Highlander','Tacoma','Vitz/Yaris','Noah/Voxy','Allion/Premio','Probox/Succeed','IST/Scion XA','Urban Cruiser','Ractis','Hilux Vigo'],
    'Honda':['Fit/Jazz','Vezel/HR-V','CR-V','Civic','XR-V','City/Grace'],
    'Suzuki':['Swift','Dzire','S-Presso','Ciaz'],
    'Nissan':['Sentra','Altima','Rogue','X-Trail','Navara'],
    'Mitsubishi':['Lancer','Pajero','Outlander','Triton','L200'],
    'Isuzu':['D-MAX','MU-X'],
    'Ford':['Ranger','F-150','Everest','Explorer']
  };
  const vehicleImages = {
    'Toyota':'assets/images/mobile-fitment-vehicle-v51.jpg',
    'Honda':'assets/images/mobile-fitment-vehicle-v51.jpg',
    'Suzuki':'assets/images/mobile-fitment-vehicle-v51.jpg',
    'Nissan':'assets/images/mobile-fitment-vehicle-v51.jpg',
    'Mitsubishi':'assets/images/mobile-fitment-vehicle-v51.jpg',
    'Isuzu':'assets/images/mobile-fitment-vehicle-v51.jpg',
    'Ford':'assets/images/mobile-fitment-vehicle-v51.jpg'
  };
  const lampImages = {
    'Headlights':'assets/images/product-fallbacks/headlight-led.jpg',
    'Tail Lights':'assets/images/product-fallbacks/tail-light-led.jpg',
    'Fog Lights':'assets/images/product-fallbacks/fog-lamp.jpg',
    'DRL':'assets/images/product-fallbacks/drl-module.jpg'
  };
  const lampLabels = {
    'Headlights':'Headlight Assembly',
    'Tail Lights':'Tail Light Assembly',
    'Fog Lights':'Fog Lamp Assembly',
    'DRL':'DRL Module'
  };
  const yearSel = $('#homeFitYearV49');
  const makeSel = $('#homeFitMakeV49');
  const modelSel = $('#homeFitModelV49');
  const lampSel = $('#homeFitLampV49');
  const vehicleName = $('#homeFitVehicleNameV49');
  const vehicleImg = $('#homeFitVehicleImageV49');
  const productImg = $('#homeFitProductImgV49');
  const productTitle = $('#homeFitProductTitleV49');
  const productMeta = $('#homeFitProductMetaV49');
  const viewProducts = $('#homeViewProductsV49');
  vehicleImg.dataset.homeFitVehicleImageV50Fallback = '1';
  vehicleImg.onerror = () => { vehicleImg.onerror = null; vehicleImg.src = 'assets/images/mobile-fitment-vehicle-v51.jpg'; };
  productImg.onerror = () => { productImg.onerror = null; productImg.src = 'assets/images/mobile-fitment-headlight-v51.jpg'; };
  const addBtn = $('#homeAddRFQV49');
  const itemBadge = $('#homeFitItemsV49');
  let side = 'Left';
  let count = 0;
  yearSel.innerHTML = years.map(y => `<option value="${y}" ${y===2021?'selected':''}>${y}</option>`).join('');
  makeSel.innerHTML = Object.keys(models).map(m => `<option value="${m}" ${m==='Toyota'?'selected':''}>${m}</option>`).join('');
  function fillModels(){
    const list = models[makeSel.value] || models.Toyota;
    modelSel.innerHTML = list.map((m,i)=>`<option value="${m}" ${i===0?'selected':''}>${m}</option>`).join('');
  }
  function update(){
    const make = makeSel.value;
    const model = modelSel.value;
    const year = yearSel.value;
    const lamp = lampSel.value;
    vehicleName.textContent = `${year} ${make} ${model}`;
    vehicleImg.src = vehicleImages[make] || vehicleImages.Toyota;
    productImg.src = lampImages[lamp] || lampImages.Headlights;
    productTitle.textContent = `${make} ${model} ${lampLabels[lamp] || 'Auto Light'} ${side === 'Set' ? 'Left + Right Set' : side}`;
    productMeta.textContent = `${side} · OE/photo confirmation · MOQ ${side==='Set' ? '5 SETS' : '10 PCS'}`;
    const params = new URLSearchParams({year, make, model, category: lamp});
    viewProducts.href = 'products?' + params.toString() + '#fitment';
  }
  makeSel.addEventListener('change',()=>{fillModels(); update();});
  [yearSel,modelSel,lampSel].forEach(el=>el.addEventListener('change',update));
  root.querySelectorAll('.home-hotspot-v49').forEach(btn=>btn.addEventListener('click',()=>{ lampSel.value = btn.dataset.lamp; update(); }));
  root.querySelectorAll('.mobile-side-switch-v49 button').forEach(btn=>btn.addEventListener('click',()=>{
    root.querySelectorAll('.mobile-side-switch-v49 button').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    side = btn.dataset.side;
    update();
  }));
  addBtn.addEventListener('click',()=>{
    count += 1;
    itemBadge.textContent = `${count} item${count>1?'s':''}`;
    try {
      const key = 'ipack_inquiry_list_v4';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push({
        title: productTitle.textContent,
        fitment: vehicleName.textContent,
        position: side,
        oe: 'OE/photo confirmation',
        quantity: side === 'Set' ? 1 : 10,
        image: productImg.src
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch(e) {}
    addBtn.textContent = 'Added to RFQ';
    setTimeout(()=>addBtn.textContent='Add to RFQ List', 1600);
  });
  fillModels();
  update();
})();
