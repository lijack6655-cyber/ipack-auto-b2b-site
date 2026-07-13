(function(){

const vehicles = [{"id": "honda-civic", "year": 2022, "make": "Honda", "model": "Civic", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/honda-civic.jpg", "lampProfile": "sedan"}, {"id": "ford-f150", "year": 2022, "make": "Ford", "model": "F-150", "body": "Pickup", "img": "assets/images/vehicle-fallbacks/ford-f150.jpg", "lampProfile": "pickup"}, {"id": "nissan-altima", "year": 2021, "make": "Nissan", "model": "Altima", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/nissan-altima.jpg", "lampProfile": "sedan"}, {"id": "hyundai-elantra", "year": 2022, "make": "Hyundai", "model": "Elantra", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/hyundai-elantra.jpg", "lampProfile": "sedan"}, {"id": "toyota-hilux", "year": 2022, "make": "Toyota", "model": "Hilux", "body": "Pickup", "img": "assets/images/vehicle-fallbacks/toyota-hilux.jpg", "lampProfile": "pickup"}, {"id": "toyota-camry", "year": 2022, "make": "Toyota", "model": "Camry", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/toyota-camry.jpg", "lampProfile": "sedan"}, {"id": "toyota-rav4", "year": 2022, "make": "Toyota", "model": "RAV4", "body": "SUV", "img": "assets/images/vehicle-fallbacks/toyota-rav4.jpg", "lampProfile": "suv"}, {"id": "honda-crv", "year": 2022, "make": "Honda", "model": "CR-V", "body": "SUV", "img": "assets/images/vehicle-fallbacks/honda-crv.jpg", "lampProfile": "suv"}, {"id": "nissan-rogue", "year": 2022, "make": "Nissan", "model": "Rogue", "body": "SUV", "img": "assets/images/vehicle-fallbacks/nissan-rogue.jpg", "lampProfile": "suv"}, {"id": "hyundai-tucson", "year": 2022, "make": "Hyundai", "model": "Tucson", "body": "SUV", "img": "assets/images/vehicle-fallbacks/hyundai-tucson.jpg", "lampProfile": "suv"}, {"id": "toyota-tacoma", "year": 2022, "make": "Toyota", "model": "Tacoma", "body": "Pickup", "img": "assets/images/vehicle-fallbacks/toyota-tacoma.jpg", "lampProfile": "pickup"}, {"id": "ford-ranger", "year": 2022, "make": "Ford", "model": "Ranger", "body": "Pickup", "img": "assets/images/vehicle-fallbacks/ford-ranger.jpg", "lampProfile": "pickup"}, {"id": "kia-sportage", "year": 2022, "make": "Kia", "model": "Sportage", "body": "SUV", "img": "assets/images/vehicle-fallbacks/kia-sportage.jpg", "lampProfile": "suv"}, {"id": "toyota-highlander", "year": 2022, "make": "Toyota", "model": "Highlander", "body": "SUV", "img": "assets/images/vehicle-fallbacks/toyota-highlander.jpg", "lampProfile": "suv-alt"}, {"id": "honda-accord", "year": 2022, "make": "Honda", "model": "Accord", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/honda-accord.jpg", "lampProfile": "sedan-alt"}, {"id": "ford-explorer", "year": 2022, "make": "Ford", "model": "Explorer", "body": "SUV", "img": "assets/images/vehicle-fallbacks/ford-explorer.jpg", "lampProfile": "suv-alt"}, {"id": "kia-k5", "year": 2022, "make": "Kia", "model": "K5", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/kia-k5.jpg", "lampProfile": "premium-sedan"}, {"id": "toyota-corolla-cross", "year": 2022, "make": "Toyota", "model": "Corolla Cross", "body": "SUV", "img": "assets/images/vehicle-fallbacks/toyota-corolla-cross.jpg", "lampProfile": "suv-alt"}, {"id": "toyota-land-cruiser", "year": 2022, "make": "Toyota", "model": "Land Cruiser", "body": "SUV", "img": "assets/images/vehicle-fallbacks/toyota-land-cruiser.jpg", "lampProfile": "suv-alt"}, {"id": "nissan-sentra", "year": 2022, "make": "Nissan", "model": "Sentra", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/nissan-sentra.jpg", "lampProfile": "sedan"}, {"id": "honda-pilot", "year": 2022, "make": "Honda", "model": "Pilot", "body": "SUV", "img": "assets/images/vehicle-fallbacks/honda-pilot.jpg", "lampProfile": "suv"}, {"id": "hyundai-santa-fe", "year": 2022, "make": "Hyundai", "model": "Santa Fe", "body": "SUV", "img": "assets/images/vehicle-fallbacks/hyundai-santa-fe.jpg", "lampProfile": "suv-alt"}, {"id": "toyota-prius-prime", "year": 2022, "make": "Toyota", "model": "Prime", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/toyota-corolla.jpg", "lampProfile": "sedan"}, {"id": "toyota-vitz-yaris", "year": 2021, "make": "Toyota", "model": "Vitz/Yaris", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/toyota-corolla.jpg", "lampProfile": "sedan"}, {"id": "toyota-noah-voxy", "year": 2021, "make": "Toyota", "model": "Noah/Voxy", "body": "SUV", "img": "assets/images/vehicle-fallbacks/toyota-highlander.jpg", "lampProfile": "suv-alt"}, {"id": "toyota-hilux-vigo", "year": 2015, "make": "Toyota", "model": "Hilux Vigo", "body": "Pickup", "img": "assets/images/vehicle-fallbacks/toyota-hilux.jpg", "lampProfile": "pickup"}, {"id": "isuzu-dmax", "year": 2022, "make": "Isuzu", "model": "D-MAX", "body": "Pickup", "img": "assets/images/vehicle-fallbacks/ford-ranger.jpg", "lampProfile": "pickup"}, {"id": "suzuki-swift", "year": 2022, "make": "Suzuki", "model": "Swift", "body": "Sedan", "img": "assets/images/vehicle-fallbacks/honda-civic.jpg", "lampProfile": "sedan"}];

const assetProfiles = {
  'sedan': {
    headlightLeft:'assets/images/product-fallbacks/headlight-led.jpg', headlightRight:'assets/images/product-fallbacks/headlight-led-right.jpg', headlightSet:'assets/images/product-fallbacks/headlight-set.jpg',
    tailLeft:'assets/images/product-fallbacks/tail-light-led.jpg', tailRight:'assets/images/product-fallbacks/tail-light-led-right.jpg', tailSet:'assets/images/product-fallbacks/tail-light-sedan-set.jpg',
    fogLeft:'assets/images/product-fallbacks/fog-lamp.jpg', fogRight:'assets/images/product-fallbacks/fog-lamp-right.jpg', fogSet:'assets/images/product-fallbacks/fog-lamp-set.jpg',
    drlLeft:'assets/images/product-fallbacks/drl-module.jpg', drlRight:'assets/images/product-fallbacks/drl-module-right.jpg', drlSet:'assets/images/product-fallbacks/drl-module-set.jpg'
  },
  'suv': {
    headlightLeft:'assets/images/product-fallbacks/headlight-led.jpg', headlightRight:'assets/images/product-fallbacks/headlight-led-right.jpg', headlightSet:'assets/images/product-fallbacks/headlight-set.jpg',
    tailLeft:'assets/images/product-fallbacks/tail-light-suv.jpg', tailRight:'assets/images/product-fallbacks/tail-light-suv-right.jpg', tailSet:'assets/images/product-fallbacks/tail-light-suv-set.jpg',
    fogLeft:'assets/images/product-fallbacks/fog-lamp.jpg', fogRight:'assets/images/product-fallbacks/fog-lamp-right.jpg', fogSet:'assets/images/product-fallbacks/fog-lamp-set.jpg',
    drlLeft:'assets/images/product-fallbacks/drl-module.jpg', drlRight:'assets/images/product-fallbacks/drl-module-right.jpg', drlSet:'assets/images/product-fallbacks/drl-module-set.jpg'
  },
  'pickup': {
    headlightLeft:'assets/images/product-fallbacks/headlight-suv-alt.jpg', headlightRight:'assets/images/product-fallbacks/headlight-suv-alt-right.jpg', headlightSet:'assets/images/product-fallbacks/headlight-suv-alt-set.jpg',
    tailLeft:'assets/images/product-fallbacks/tail-light-suv-alt.jpg', tailRight:'assets/images/product-fallbacks/tail-light-suv-alt-right.jpg', tailSet:'assets/images/product-fallbacks/tail-light-suv-alt-set.jpg',
    fogLeft:'assets/images/product-fallbacks/fog-lamp-alt.jpg', fogRight:'assets/images/product-fallbacks/fog-lamp-alt-right.jpg', fogSet:'assets/images/product-fallbacks/fog-lamp-alt-set.jpg',
    drlLeft:'assets/images/product-fallbacks/drl-module-alt.jpg', drlRight:'assets/images/product-fallbacks/drl-module-alt-right.jpg', drlSet:'assets/images/product-fallbacks/drl-module-alt-set.jpg'
  },
  'premium-sedan': {
    headlightLeft:'assets/images/product-fallbacks/headlight-sedan-alt.jpg', headlightRight:'assets/images/product-fallbacks/headlight-sedan-alt-right.jpg', headlightSet:'assets/images/product-fallbacks/headlight-sedan-alt-set.jpg',
    tailLeft:'assets/images/product-fallbacks/tail-light-sedan-alt.jpg', tailRight:'assets/images/product-fallbacks/tail-light-sedan-alt-right.jpg', tailSet:'assets/images/product-fallbacks/tail-light-sedan-alt-set.jpg',
    fogLeft:'assets/images/product-fallbacks/fog-lamp-alt.jpg', fogRight:'assets/images/product-fallbacks/fog-lamp-alt-right.jpg', fogSet:'assets/images/product-fallbacks/fog-lamp-alt-set.jpg',
    drlLeft:'assets/images/product-fallbacks/drl-module-alt.jpg', drlRight:'assets/images/product-fallbacks/drl-module-alt-right.jpg', drlSet:'assets/images/product-fallbacks/drl-module-alt-set.jpg'
  },
  'suv-alt': {
    headlightLeft:'assets/images/product-fallbacks/headlight-suv-alt.jpg', headlightRight:'assets/images/product-fallbacks/headlight-suv-alt-right.jpg', headlightSet:'assets/images/product-fallbacks/headlight-suv-alt-set.jpg',
    tailLeft:'assets/images/product-fallbacks/tail-light-suv-alt.jpg', tailRight:'assets/images/product-fallbacks/tail-light-suv-alt-right.jpg', tailSet:'assets/images/product-fallbacks/tail-light-suv-alt-set.jpg',
    fogLeft:'assets/images/product-fallbacks/fog-lamp-alt.jpg', fogRight:'assets/images/product-fallbacks/fog-lamp-alt-right.jpg', fogSet:'assets/images/product-fallbacks/fog-lamp-alt-set.jpg',
    drlLeft:'assets/images/product-fallbacks/drl-module-alt.jpg', drlRight:'assets/images/product-fallbacks/drl-module-alt-right.jpg', drlSet:'assets/images/product-fallbacks/drl-module-alt-set.jpg'
  },
  'sedan-alt': {
    headlightLeft:'assets/images/product-fallbacks/headlight-sedan-alt.jpg', headlightRight:'assets/images/product-fallbacks/headlight-sedan-alt-right.jpg', headlightSet:'assets/images/product-fallbacks/headlight-sedan-alt-set.jpg',
    tailLeft:'assets/images/product-fallbacks/tail-light-sedan-alt.jpg', tailRight:'assets/images/product-fallbacks/tail-light-sedan-alt-right.jpg', tailSet:'assets/images/product-fallbacks/tail-light-sedan-alt-set.jpg',
    fogLeft:'assets/images/product-fallbacks/fog-lamp-alt.jpg', fogRight:'assets/images/product-fallbacks/fog-lamp-alt-right.jpg', fogSet:'assets/images/product-fallbacks/fog-lamp-alt-set.jpg',
    drlLeft:'assets/images/product-fallbacks/drl-module-alt.jpg', drlRight:'assets/images/product-fallbacks/drl-module-alt-right.jpg', drlSet:'assets/images/product-fallbacks/drl-module-alt-set.jpg'
  }
};

const partConfig = {
  'headlight': { label:'LED Headlight Assembly', singlePositions:['Front Left','Front Right'], pairLabel:'Front Left + Right Set' },
  'tail-light': { label:'LED Tail Light Assembly', singlePositions:['Rear Left','Rear Right'], pairLabel:'Rear Left + Right Set' },
  'fog-lamp': { label:'Fog Lamp Assembly', singlePositions:['Front Left','Front Right'], pairLabel:'Front Left + Right Set' },
  'drl': { label:'DRL Module', singlePositions:['Front Left','Front Right'], pairLabel:'Front Left + Right Set' }
};
const oePool = ['81150-12B10','81170-12B10','81560-12B60','81550-12B60','33100-TBA-A01','26060-9HS0A','92101-AA000','5C6-941-006','8W0-941-034','A205-906-05-03'];

let state = { vehicle: vehicles[0], part:'headlight', package:'single', selectedPosition:'Front Left', selectedQty:null, inquiry: [], gallery:{make:'all', body:'all', model:''} };

const allFitmentYears = Array.from({length: 2026 - 1984 + 1}, (_, i) => 1984 + i);
const fitmentModelMap = {"Toyota": ["Prius", "Prime", "Lexus", "Corolla", "Axio", "Fielder", "Camry", "RAV4", "Hiace", "Highlander", "Tacoma", "Vitz", "Yaris", "Noah", "Voxy", "Allion", "Premio", "Probox", "Succeed", "IST", "Scion XA", "Urban Cruiser", "Ractis", "Hilux", "Hilux Vigo", "Fortuner", "Land Cruiser", "Prado", "Rush", "Avanza", "Reiz", "Mark X", "Corolla Cross", "C-HR", "Yaris Cross"], "Honda": ["Fit", "Jazz", "Vezel", "HR-V", "CR-V", "Civic", "XR-V", "City", "Grace", "Accord", "Odyssey", "Brio", "Pilot"], "Nissan": ["Sunny", "Tiida", "X-Trail", "Navara", "Patrol", "Sentra", "Almera", "Kicks", "Rogue", "Altima"], "Suzuki": ["Swift", "Dzire", "S-Presso", "Ciaz", "Vitara", "Jimny", "Alto", "Ertiga"], "Hyundai/Kia": ["Elantra", "Tucson", "Sonata", "Santa Fe", "Sportage", "Rio", "Sorento", "K5", "Starex / H1"], "Mitsubishi": ["Lancer", "Pajero", "Outlander", "Triton", "L200"], "Ford": ["Ranger", "Everest", "Focus", "Transit", "Explorer", "F-150", "Ford Ranger", "4x4 Pick up"], "Isuzu": ["D-MAX", "Dmax", "MU-X", "Isuzu D-MAX", "Isuzu Dmax", "4x4 Pick up"]};
const allFitmentMakes = ["Toyota", "Honda", "Suzuki", "Nissan", "Mitsubishi", "Isuzu", "Ford", "Hyundai/Kia"];
const allFitmentModels = Array.from(new Set(Object.values(fitmentModelMap).flat().concat(vehicles.map(v => v.model)))).sort();

const root = document.querySelector('.fitment-v26');
if(!root) return;
const $ = (s) => root.querySelector(s); const $$ = (s) => [...root.querySelectorAll(s)];
const oeFor = (seed) => oePool[Math.abs(seed.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % oePool.length];
const shortPos = (side) => side.includes('Left + Right') ? 'Set' : side.includes('Left') ? 'Left' : side.includes('Right') ? 'Right' : side;
function profileFor(vehicle){ return assetProfiles[vehicle.lampProfile] || assetProfiles['sedan']; }
function partImage(profile, part, kind){
  const map = {
    'headlight': ['headlightLeft','headlightRight','headlightSet'],
    'tail-light': ['tailLeft','tailRight','tailSet'],
    'fog-lamp': ['fogLeft','fogRight','fogSet'],
    'drl': ['drlLeft','drlRight','drlSet']
  };
  const keys = map[part];
  return profile[keys[kind]];
}
function productFor(vehicle=state.vehicle, part=state.part, side=state.selectedPosition, pkg='single'){
  const config = partConfig[part] || partConfig['headlight'];
  const profile = profileFor(vehicle);
  const packType = pkg === 'pair' ? 'pair' : 'single';
  const position = packType === 'pair' ? config.pairLabel : side;
  const oe = packType === 'pair' ? 'LH + RH OE confirmation' : (position.includes('Left') ? 'LH OE / photo confirmation' : position.includes('Right') ? 'RH OE / photo confirmation' : 'OE / photo confirmation');
  const thumbLeft = partImage(profile, part, 0);
  const thumbRight = partImage(profile, part, 1);
  const img = packType === 'pair' ? partImage(profile, part, 2) : partImage(profile, part, position.includes('Right') ? 1 : 0);
  const titleSuffix = packType === 'pair' ? 'Left + Right Set' : shortPos(position);
  return {
    id:`${vehicle.id}-${part}-${packType}-${position.toLowerCase().replace(/\s+/g,'-').replace(/\+/g,'plus')}`,
    title:`${vehicle.make} ${vehicle.model} ${config.label} ${titleSuffix}`,
    fitment:`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.body}`,
    oe, position, lampType: config.label, moq: packType === 'pair' ? '5 SETS' : '10 PCS', img, thumbLeft, thumbRight, part, qty: packType === 'pair' ? 1 : 10, packageType: packType
  };
}
function buildProducts(part = state.part, vehicle = state.vehicle){
  const packageFilter = $('#packageSelect').value;
  const makeSingleCards = (pkey) => partConfig[pkey].singlePositions.map(pos => productFor(vehicle, pkey, pos, 'single'));
  const makePairCard = (pkey) => [productFor(vehicle, pkey, partConfig[pkey].singlePositions[0], 'pair')];
  if(part === 'all'){
    const allParts = ['headlight','tail-light','fog-lamp','drl']; let list = [];
    allParts.forEach(pkey => { if(packageFilter !== 'pair') list.push(...makeSingleCards(pkey)); if(packageFilter !== 'single') list.push(...makePairCard(pkey)); });
    return list;
  }
  let cards = []; if(packageFilter !== 'pair') cards.push(...makeSingleCards(part)); if(packageFilter !== 'single') cards.push(...makePairCard(part)); return cards;
}
function fillSelect(select, values, current){ select.innerHTML = values.map(v=>{ const label=typeof v==='object'?v.label:v; const value=typeof v==='object'?v.value:v; return `<option value="${value}" ${String(value)===String(current)?'selected':''}>${label}</option>`; }).join(''); }
function initFilters(){
  fillSelect($('#yearSelect'), allFitmentYears, state.vehicle.year);
  fillSelect($('#makeSelect'), allFitmentMakes, state.vehicle.make);
  updateModelOptions();
  $('#bodySelect').value = state.vehicle.body;
  $('#lampSelect').value = 'all';
  $('#packageSelect').value = 'all';
  fillSelect($('#galleryMake'), [{value:'all',label:'All Makes'}, ...allFitmentMakes.map(x=>({value:x,label:x}))], 'all');
  fillSelect($('#galleryBody'), [{value:'all',label:'All Body Types'}, {value:'Sedan',label:'Sedan'}, {value:'SUV',label:'SUV'}, {value:'Pickup',label:'Pickup'}], 'all');
}
function updateModelOptions(){
  const make = $('#makeSelect')?.value || state.vehicle.make;
  const models = fitmentModelMap[make] || allFitmentModels;
  fillSelect($('#modelSelect'), [''].concat(models), state.vehicle.model);
  const first = $('#modelSelect option');
  if(first) first.textContent = 'Model';
}

function normalizeFitmentValue(v){ return String(v || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function makeMatchesVehicle(vehicleMake, selectedMake){
  const vm = normalizeFitmentValue(vehicleMake);
  const sm = normalizeFitmentValue(selectedMake);
  if(!sm || sm === 'all') return true;
  if(sm === vm) return true;
  if(sm === 'hyundai kia') return vm === 'hyundai' || vm === 'kia';
  if(sm === 'pick up') return ['toyota','ford','isuzu','chevrolet'].includes(vm);
  return false;
}

function filteredVehicles(){ return vehicles.filter(v => { const m1 = state.gallery.make === 'all' || makeMatchesVehicle(v.make, state.gallery.make); const m2 = state.gallery.body === 'all' || v.body === state.gallery.body; const kw = state.gallery.model.trim().toLowerCase(); const m3 = !kw || `${v.make} ${v.model} ${v.body}`.toLowerCase().includes(kw); return m1 && m2 && m3; }); }
function renderVehicleStrip(){ const list = filteredVehicles(); $('#vehicleStrip').innerHTML = list.map(v=>`<button class="vehicle-card ${v.id===state.vehicle.id?'active':''}" data-vehicle="${v.id}"><img src="${v.img}" alt="${v.make} ${v.model}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/mobile-fitment-vehicle-v51.jpg';" /><b>${v.make} ${v.model}</b><small>${v.year} · ${v.body}</small></button>`).join('') || `<div class="empty-gallery">No vehicles match the current filter. Need custom fitment options? Please contact our sales team on WhatsApp for fast expert compatibility matching!</div>`; $$('.vehicle-card').forEach(card=>card.addEventListener('click',()=>selectVehicle(card.dataset.vehicle, false))); }
function selectVehicle(id, toastOn = true){ const vehicle = vehicles.find(v=>v.id===id) || state.vehicle; state.vehicle = vehicle; state.selectedQty = null; const vehicleImageEl = $('#vehicleImage'); if(vehicleImageEl){ vehicleImageEl.onerror = () => { vehicleImageEl.onerror = null; vehicleImageEl.src = 'assets/images/mobile-fitment-vehicle-v51.jpg'; }; vehicleImageEl.src = vehicle.img; } if($('#vehicleImage')) $('#vehicleImage').alt = `${vehicle.year} ${vehicle.make} ${vehicle.model}`; $('#selectedVehicleName').textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.body}`; $('#yearSelect').value = vehicle.year; $('#makeSelect').value = vehicle.make; updateModelOptions(); $('#modelSelect').value = vehicle.model; $('#bodySelect').value = vehicle.body; renderVehicleStrip(); renderSelectedPart(); renderProducts(); if(toastOn) toast(`${vehicle.make} ${vehicle.model} selected`); }
function selectedProduct(){
  const pkg = state.package === 'pair' ? 'pair' : 'single';
  const p = productFor(state.vehicle, state.part, state.selectedPosition, pkg);
  if(state.selectedQty !== null && state.selectedQty !== '' && !Number.isNaN(Number(state.selectedQty))) {
    p.qty = Number(state.selectedQty);
  }
  return p;
}

function pairImageMarkup(p, mode='card'){
  const cls = mode === 'selected' ? 'pair-set-selected-v41' : mode === 'compact' ? 'pair-set-compact-v41' : 'pair-set-card-v41';
  const left = p.thumbLeft || p.img;
  const right = p.thumbRight || p.img;
  return `<div class="${cls}">
    <figure><span>LEFT</span><img src="${left}" alt="${p.title} left lamp" loading="lazy" onerror="this.onerror=null;this.src='assets/images/mobile-fitment-headlight-v51.jpg';" /></figure>
    <figure><span>RIGHT</span><img src="${right}" alt="${p.title} right lamp" loading="lazy" onerror="this.onerror=null;this.src='assets/images/mobile-fitment-headlight-v51.jpg';" /></figure>
  </div>`;
}

function productThumbMarkup(p, mode='card'){
  if(p.packageType === 'pair'){
    return pairImageMarkup(p, mode);
  }
  return `<img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/mobile-fitment-headlight-v51.jpg';" />`;
}

function renderSelectedPart(){
  const p = selectedProduct();
  const config = partConfig[state.part] || partConfig['headlight'];
  const leftPos = config.singlePositions[0];
  const rightPos = config.singlePositions[1];
  const currentChoice = state.package === 'pair' ? 'set' : (state.selectedPosition === rightPos ? 'right' : 'left');
  const qtyValue = p.qty || (p.packageType === 'pair' ? 1 : 10);

  $('#selectedPartCard').innerHTML = `
    <div class="selected-row selected-row-v29">
      <div class="selected-visual-v29 ${p.packageType==='pair'?'selected-visual-pair-v32':''}">${productThumbMarkup(p, 'selected')}</div>
      <div>
        <h3>${p.title}</h3>
        <div class="meta">
          <span><b>Fitment:</b> ${p.fitment}</span>
          <span><b>OE Number:</b> ${p.oe}</span>
          <span><b>Position:</b> ${p.position}</span>
          <span><b>Lamp Type:</b> ${p.lampType}</span>
        </div>
      </div>
    </div>
    <div class="selection-controls-v29">
      <div>
        <small>MOQ / Qty</small>
        <input id="selectedQtyInput" class="selected-qty-v28" type="number" min="1" value="${qtyValue}">
      </div>
      <div class="position-switch-wrap-v33">
        <div class="position-switch-v28" role="group" aria-label="Choose lamp position">
          <button class="choice-btn ${currentChoice==='left'?'active':''}" data-choice="left">Left</button>
          <button class="choice-btn ${currentChoice==='right'?'active':''}" data-choice="right">Right</button>
          <button class="choice-btn ${currentChoice==='set'?'active':''}" data-choice="set">Set</button>
        </div>
        <p class="lr-note-v33">Left / Right follows vehicle direction. Rear lamps are viewed from the rear of the vehicle.</p>
      </div>
    </div>
  `;

  const qtyInput = $('#selectedQtyInput');
  if(qtyInput) {
    qtyInput.addEventListener('input', () => {
      state.selectedQty = qtyInput.value;
    });
  }

  $$('.choice-btn').forEach(btn => btn.addEventListener('click', () => {
    const choice = btn.dataset.choice;
    if(choice === 'set') {
      state.package = 'pair';
      state.selectedPosition = leftPos;
      state.selectedQty = state.selectedQty || 1;
      $('#packageSelect').value = 'pair';
    } else {
      state.package = 'single';
      state.selectedPosition = choice === 'right' ? rightPos : leftPos;
      state.selectedQty = state.selectedQty || 10;
      $('#packageSelect').value = 'single';
    }
    renderSelectedPart();
    renderProducts();
  }));
}

function renderProducts(){
  const currentLamp = $('#lampSelect').value;
  const list = buildProducts(currentLamp === 'all' ? 'all' : state.part, state.vehicle);
  const partLabel = currentLamp === 'all' ? 'All Lamps' : partConfig[state.part]?.label || 'Auto Lights';
  const packageLabel = $('#packageSelect').value === 'pair' ? 'Pair Kits' : $('#packageSelect').value === 'single' ? 'Single Side' : 'Single + Pair Kits';
  $('#matchSummary').textContent = `${partLabel} · ${state.vehicle.make} ${state.vehicle.model} · ${packageLabel} · ${list.length}+ matched results`;
  if (list.length === 0) {
    $('#productGrid').innerHTML = `<div class="empty-products" style="grid-column: 1/-1; text-align: center; padding: 40px; border: 1px dashed var(--line); border-radius: 12px; background: #fbfdff; color: #64748b;"><p style="font-weight: bold; margin-bottom: 8px;">No matching products found for this vehicle configuration.</p><p>Contact our experts on WhatsApp to verify compatibility or request custom sourcing:</p><a href="https://wa.me/8618620780862" target="_blank" class="btn" style="background: #25d366; color: white; display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none;"><i class="fab fa-whatsapp"></i> Contact on WhatsApp</a></div>`;
  } else {
    $('#productGrid').innerHTML = list.map(p=>{
    const pair = p.packageType === 'pair';
    return `<article class="product-card product-card-v29 ${pair?'product-card-kit product-card-kit-v29 product-card-kit-v32 product-card-kit-v41':''}">
      <div class="product-thumb-wrap product-thumb-wrap-v29 ${pair?'pair-thumb-wrap-v29':''}">
        ${productThumbMarkup(p, 'card')}
      </div>
      <div class="product-card-info-v29">
        <h3>${p.title}</h3>
        <p><span><b>OE:</b> ${p.oe}</span><span><b>Position:</b> ${p.position}</span><span><b>MOQ:</b> ${p.moq}</span></p>
      </div>
      <button data-product='${JSON.stringify(p).replace(/'/g,"&apos;")}'>Add to RFQ</button>
    </article>`;
  }).join('');
  }
  $$('#productGrid button').forEach(btn=>btn.addEventListener('click',()=>{
    const p = JSON.parse(btn.dataset.product.replace(/&apos;/g, "'"));
    addInquiry(p);
    state.part = p.part;
    state.package = p.packageType;
    state.selectedPosition = p.packageType === 'pair' ? partConfig[p.part].singlePositions[0] : p.position;
    state.selectedQty = p.qty || (p.packageType === 'pair' ? 1 : 10);
    $('#lampSelect').value = p.part;
    $('#packageSelect').value = p.packageType === 'pair' ? 'pair' : 'single';
    renderSelectedPart();
  }));
}

function syncSiteQuoteList(p){
  try {
    const key = 'ipack_inquiry_list_v4';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const item = {
      id: 'fitment-' + (p.id || p.title),
      title: p.title || 'Auto Lights Product',
      category: p.lampType || p.part || 'Auto Lights',
      oe: p.oe || '',
      fitment: [p.fitment, p.position, p.packageType === 'pair' ? 'Pair Kit' : 'Single Side'].filter(Boolean).join(' · '),
      image: p.img || '',
      url: 'products#fitment-center',
      qty: p.qty ? String(p.qty) : ''
    };
    const idx = list.findIndex(x => (x.id || x.url || x.title) === item.id);
    if(idx >= 0) list[idx] = Object.assign(list[idx], item);
    else list.push(item);
    localStorage.setItem(key, JSON.stringify(list));
    const counter = document.getElementById('quote-count');
    if(counter) counter.textContent = list.length;
  } catch(e) {}
}

function addInquiry(p=selectedProduct()){
  const idx = state.inquiry.findIndex(x=>x.id===p.id);
  if(idx === -1) state.inquiry.push({...p, qty:p.qty || (p.packageType==='pair'?1:10)});
  else state.inquiry[idx].qty += p.packageType === 'pair' ? 1 : 10;
  syncSiteQuoteList(p);
  renderInquiry();
  toast(idx === -1 ? 'Added to inquiry list and synced to site RFQ' : 'Quantity updated in inquiry list');
}


function updateRFQHiddenSummary(){
  const field = $('#inquirySummaryField');
  if(!field) return;
  field.value = state.inquiry.length
    ? state.inquiry.map(item => `${item.title}${item.packageType==='pair' ? ' / Pair Kit' : ''} / ${item.position} / OE ${item.oe} / Qty ${item.qty} ${item.packageType==='pair' ? 'set(s)' : 'pcs'}`).join('\n')
    : 'No parts added yet.';
}

function renderInquiry(){
  $('#inquiryCount').textContent = `${state.inquiry.length} item${state.inquiry.length===1?'':'s'}`;
  $('#rfqSummaryBadge').textContent = `${state.inquiry.length} selected item${state.inquiry.length===1?'':'s'}`;

  if(!state.inquiry.length){
    $('#inquiryList').className='inquiry-list empty';
    $('#inquiryList').textContent='No parts added yet. Click a light hotspot or product card to add items.';
    $('#inquirySummaryText').textContent='No parts added yet.';
    updateRFQHiddenSummary();
    return;
  }

  $('#inquiryList').className='inquiry-list';
  $('#inquiryList').innerHTML = state.inquiry.map((item, idx)=>`
    <div class="inquiry-item inquiry-item-v29">
      <div class="inquiry-thumb-v29 ${item.packageType==='pair'?'inquiry-thumb-pair-v32':''}">${item.packageType === 'pair' ? productThumbMarkup(item, 'compact') : `<img src="${item.img}" alt="${item.title}">`}</div>
      <div>
        <b>${item.title}${item.packageType==='pair' ? ' · Pair Kit' : ''}</b>
        <span>${item.fitment} · ${item.position} · OE ${item.oe}</span>
        <label class="inquiry-qty-v28">Qty <input data-inquiry-qty="${idx}" type="number" min="1" value="${item.qty || (item.packageType==='pair' ? 1 : 10)}"> <em>${item.packageType==='pair' ? 'set(s)' : 'pcs'}</em></label>
      </div>
      <button class="btn btn-ghost" data-remove="${item.id}">Remove</button>
    </div>`).join('');

  $('#inquirySummaryText').innerHTML = state.inquiry.map(item => `${item.title}${item.packageType==='pair' ? ' / Pair Kit' : ''} / ${item.position} / OE ${item.oe} / Qty ${item.qty} ${item.packageType==='pair' ? 'set(s)' : 'pcs'}`).join('<br>');
  updateRFQHiddenSummary();

  $$('[data-inquiry-qty]').forEach(input => input.addEventListener('input', () => {
    const idx = Number(input.dataset.inquiryQty);
    if(state.inquiry[idx]) {
      state.inquiry[idx].qty = Number(input.value) || input.value || '';
      syncSiteQuoteList(state.inquiry[idx]);
      $('#inquirySummaryText').innerHTML = state.inquiry.map(item => `${item.title}${item.packageType==='pair' ? ' / Pair Kit' : ''} / ${item.position} / OE ${item.oe} / Qty ${item.qty} ${item.packageType==='pair' ? 'set(s)' : 'pcs'}`).join('<br>');
  updateRFQHiddenSummary();
    }
  }));

  $$('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{
    state.inquiry=state.inquiry.filter(x=>x.id!==btn.dataset.remove);
    renderInquiry();
  }));
}

function search(){
  const q = String($('#searchInput').value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
  if(!q){
    $('#lampSelect').value = 'all';
    $('#packageSelect').value = 'all';
    renderVehicleStrip();
    renderSelectedPart();
    renderProducts();
    return;
  }
  const lampMap = [
    ['headlight','headlight'], ['head light','headlight'], ['tail light','tail-light'], ['taillight','tail-light'],
    ['fog','fog-lamp'], ['drl','drl']
  ];
  lampMap.forEach(([key,val]) => { if(q.includes(key)) { state.part = val; $('#lampSelect').value = val; } });
  const found = vehicles.find(v => {
    const hay = `${v.year} ${v.make} ${v.model} ${v.body}`.toLowerCase().replace(/[^a-z0-9]+/g,' ');
    return hay.includes(q) || q.includes(String(v.model).toLowerCase().replace(/[^a-z0-9]+/g,' ')) || q.includes(String(v.make).toLowerCase().replace(/[^a-z0-9]+/g,' '));
  });
  if(found) selectVehicle(found.id, false);
  renderSelectedPart();
  renderProducts();
  if(!found && !lampMap.some(([key]) => q.includes(key))) toast('No exact vehicle match in demo data. Try Corolla, Hilux, RAV4, Sentra or Ford F-150.');
}
function applyFilters(){
  const y = Number($('#yearSelect').value);
  const make = $('#makeSelect').value;
  const model = $('#modelSelect').value;
  const body = $('#bodySelect').value;
  const found =
    vehicles.find(v => (!y || v.year===y) && makeMatchesVehicle(v.make, make) && (!model || normalizeFitmentValue(v.model)===normalizeFitmentValue(model))) ||
    vehicles.find(v => makeMatchesVehicle(v.make, make) && (!model || normalizeFitmentValue(v.model)===normalizeFitmentValue(model))) ||
    vehicles.find(v => makeMatchesVehicle(v.make, make) && (!body || v.body===body)) ||
    vehicles.find(v => !body || v.body===body);
  if(found) selectVehicle(found.id);
  state.part = $('#lampSelect').value === 'all' ? state.part : $('#lampSelect').value;
  state.selectedPosition = partConfig[state.part]?.singlePositions?.[0] || 'Front Left';
  state.selectedQty = null;
  if($('#packageSelect').value === 'pair') state.package = 'pair';
  renderSelectedPart();
  renderProducts();
}

function applyURLSearchParams(){
  const params = new URLSearchParams(window.location.search);
  if(!params.toString()){
    $('#lampSelect').value = 'all';
    $('#packageSelect').value = 'all';
    renderSelectedPart();
    renderProducts();
    return;
  }
  const searchParam = params.get('search') || params.get('keyword') || '';
  const make = params.get('make') || '';
  const model = params.get('model') || '';
  const year = params.get('year') || '';
  const category = params.get('category') || '';

  if(year && $('#yearSelect')) $('#yearSelect').value = year;
  if(make && $('#makeSelect')) { $('#makeSelect').value = make; updateModelOptions(); }
  if(model && $('#modelSelect')) $('#modelSelect').value = model;

  if(category && $('#lampSelect')) {
    const c = category.toLowerCase();
    if(c.includes('head')) $('#lampSelect').value = 'headlight';
    else if(c.includes('tail')) $('#lampSelect').value = 'tail-light';
    else if(c.includes('fog')) $('#lampSelect').value = 'fog-lamp';
    else if(c.includes('drl')) $('#lampSelect').value = 'drl';
    if($('#lampSelect').value !== 'all') state.part = $('#lampSelect').value;
  }

  if(make || model || year || category) applyFilters();
  if(searchParam) {
    $('#searchInput').value = searchParam;
    search();
  }
}

function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove('show'),2200); }
function validateBottomRFQForm(e){
  updateRFQHiddenSummary();
  if(!state.inquiry.length){
    e.preventDefault();
    toast('Please add at least one product to the Inquiry List before submitting.');
    return false;
  }
  const name = $('#rfqName')?.value.trim();
  const email = $('#rfqEmail')?.value.trim();
  if(!name || !email){
    e.preventDefault();
    toast('Please complete your name/company and email.');
    return false;
  }
  return true;
}
$('#bottomRFQForm')?.addEventListener('submit', validateBottomRFQForm);
$('#makeSelect')?.addEventListener('change', updateModelOptions); $('#applyBtn').addEventListener('click', applyFilters); $('#resetBtn').addEventListener('click', ()=>{ $('#lampSelect').value = 'all'; $('#packageSelect').value = 'all'; state.part = 'headlight'; state.package = 'single'; state.selectedPosition = 'Front Left'; selectVehicle('toyota-hilux'); }); $('#searchBtn').addEventListener('click', search); $('#searchInput').addEventListener('keydown', e=>{if(e.key==='Enter') search();}); $$('.quick-row button').forEach(b=>b.addEventListener('click',()=>{$('#searchInput').value=b.dataset.query; search();})); $$('.hotspot').forEach(h=>h.addEventListener('click',()=>{ state.part=h.dataset.part; state.package = $('#packageSelect').value === 'pair' ? 'pair' : 'single'; state.selectedPosition = partConfig[state.part].singlePositions[0]; $('#lampSelect').value=state.part; renderSelectedPart(); renderProducts(); })); $('#addSelectedBtn').addEventListener('click',()=>addInquiry(selectedProduct())); $('#fitmentBtn').addEventListener('click',()=>{ const p = selectedProduct(); $('#rfqMessage').value = ($('#rfqMessage').value ? $('#rfqMessage').value + '\n' : '') + `Please confirm fitment for ${p.title} on ${state.vehicle.year} ${state.vehicle.make} ${state.vehicle.model} ${state.vehicle.body}.`; toast('Fitment confirmation note added to RFQ message.'); location.hash = '#rfq-submit'; }); $('#toggleHotspots').addEventListener('click',()=>$('#vehicleStage').classList.toggle('hotspots-hidden')); $('#viewAllBtn').addEventListener('click',()=>{$('#lampSelect').value='all'; $('#packageSelect').value='all'; renderProducts(); toast('Showing all demo lamp categories and kits');}); $('#clearInquiry').addEventListener('click',()=>{state.inquiry=[];renderInquiry();}); $('#galleryMake').addEventListener('change', e=>{state.gallery.make=e.target.value; renderVehicleStrip();}); $('#galleryBody').addEventListener('change', e=>{state.gallery.body=e.target.value; renderVehicleStrip();}); $('#galleryModel').addEventListener('input', e=>{state.gallery.model=e.target.value; renderVehicleStrip();}); $('#galleryReset').addEventListener('click',()=>{ state.gallery={make:'all',body:'all',model:''}; $('#galleryMake').value='all'; $('#galleryBody').value='all'; $('#galleryModel').value=''; renderVehicleStrip(); }); $('#rfqUpload')?.addEventListener('change', e=>{ $('#uploadStatus').textContent = e.target.files?.length ? `${e.target.files[0].name} selected` : 'No photo selected'; }); $('#packageSelect').addEventListener('change', e=>{ if(e.target.value === 'pair') state.package = 'pair'; else if(e.target.value === 'single') state.package = 'single'; renderSelectedPart(); renderProducts(); }); $('#lampSelect').addEventListener('change', e=>{ if(e.target.value !== 'all') state.part = e.target.value; renderSelectedPart(); renderProducts(); });
initFilters(); renderVehicleStrip(); renderSelectedPart(); renderProducts(); renderInquiry(); applyURLSearchParams(); applyURLSearchParams();



})();
