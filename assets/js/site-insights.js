(function () {
  'use strict';

  // GA4 Measurement IDs are public identifiers, not secrets. Keep the real ID
  // in this single location once the Google Analytics web stream is confirmed.
  const MEASUREMENT_ID = 'G-4FC1Y4G5ZN';
  const CONSENT_KEY = 'ipack_analytics_consent_v1';
  const isConfigured = /^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID);
  document.documentElement.dataset.ipackAnalytics = isConfigured ? 'configured' : 'ready';

  // IANA timezones covering the EU/EEA plus the UK and Switzerland. GDPR/UK-GDPR
  // and the ePrivacy Directive require prior opt-in there, so those visitors keep
  // seeing the banner. Everywhere else analytics is enabled by default.
  const CONSENT_REQUIRED_ZONES = [
    'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Athens', 'Europe/Belfast',
    'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels',
    'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Copenhagen',
    'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki',
    'Europe/Isle_of_Man', 'Europe/Jersey', 'Europe/Lisbon',
    'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid',
    'Europe/Malta', 'Europe/Mariehamn', 'Europe/Monaco', 'Europe/Oslo',
    'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Reykjavik',
    'Europe/Riga', 'Europe/Rome', 'Europe/San_Marino', 'Europe/Sarajevo',
    'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn',
    'Europe/Tirane', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna',
    'Europe/Vilnius', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zurich',
    'Atlantic/Azores', 'Atlantic/Canary', 'Atlantic/Faroe', 'Atlantic/Madeira',
    'Atlantic/Reykjavik', 'Arctic/Longyearbyen'
  ];

  // Returns true when we must ask before loading analytics. Any detection
  // failure returns true so the privacy-safe path is the fallback.
  function requiresPriorConsent() {
    try {
      if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) return true;
      const resolved = Intl.DateTimeFormat().resolvedOptions();
      const zone = resolved && resolved.timeZone;
      if (!zone) return true;
      if (CONSENT_REQUIRED_ZONES.indexOf(zone) !== -1) return true;
      // Unlisted Europe/* zones are treated as consent-required as well.
      return zone.indexOf('Europe/') === 0;
    } catch (_) {
      return true;
    }
  }

  const needsPriorConsent = requiresPriorConsent();

  function storedChoice() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
  }

  // A previously stored choice always wins over the regional default, so a
  // visitor who opted out never emits a 'granted' signal on later page loads.
  const savedChoice = storedChoice();
  const defaultAnalyticsState = savedChoice === 'granted'
    ? 'granted'
    : savedChoice === 'denied'
      ? 'denied'
      : (needsPriorConsent ? 'denied' : 'granted');
  document.documentElement.dataset.ipackConsentMode = needsPriorConsent ? 'opt-in' : 'default-on';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    analytics_storage: defaultAnalyticsState,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function pageType() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (path === '/') return 'home';
    if (path.startsWith('/products/')) return 'product';
    if (path.startsWith('/oe/')) return 'oe';
    if (path.startsWith('/vehicles/')) return 'vehicle';
    if (path.startsWith('/categories/')) return 'category';
    if (path.startsWith('/blog/')) return 'article';
    return path.slice(1).split('/')[0] || 'page';
  }

  function safePagePath() {
    return location.pathname.replace(/\.html$/, '') || '/';
  }

  function loadGa4() {
    if (!isConfigured || document.querySelector('script[data-ipack-ga4]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.dataset.ipackGa4 = 'true';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_path: safePagePath()
    });
  }

  function updateConsent(value) {
    const granted = value === 'granted';
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
    if (granted) {
      loadGa4();
      return;
    }
    // Opting out must also stop the already-initialised tracker and clear the
    // _ga* cookies GA4 wrote before the visitor changed their mind.
    try {
      window['ga-disable-' + MEASUREMENT_ID] = true;
      const host = location.hostname;
      const domains = [host, '.' + host];
      const bare = host.replace(/^www\./, '');
      if (bare !== host) domains.push(bare, '.' + bare);
      document.cookie.split(';').forEach(function (entry) {
        const name = entry.split('=')[0].trim();
        if (!/^_ga/.test(name)) return;
        domains.forEach(function (domain) {
          document.cookie = name + '=; path=/; domain=' + domain + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        });
        document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      });
    } catch (_) {}
  }

  // Analytics is active when the visitor opted in, or when they are outside the
  // consent-required region and have not explicitly opted out.
  function analyticsAllowed() {
    if (!isConfigured) return false;
    let stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    if (stored === 'granted') return true;
    if (stored === 'denied') return false;
    return !needsPriorConsent;
  }

  function track(name, params) {
    if (!analyticsAllowed()) return;
    window.gtag('event', name, Object.assign({
      page_type: pageType(),
      page_path: safePagePath()
    }, params || {}));
  }

  function consentBanner() {
    if (!isConfigured) return;
    let choice = null;
    try { choice = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    if (choice === 'granted') {
      updateConsent('granted');
      return;
    }
    if (choice === 'denied') return;

    // Outside the consent-required region: start collecting immediately and let
    // the visitor opt out through the privacy policy instead of a blocking banner.
    if (!needsPriorConsent) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      loadGa4();
      return;
    }

    const style = document.createElement('style');
    style.textContent = '.ipack-consent{position:fixed;left:18px;right:18px;bottom:18px;z-index:1000;max-width:760px;margin:auto;padding:18px;background:#fff;color:#111827;border:1px solid #dbe3ee;border-radius:16px;box-shadow:0 18px 50px rgba(15,23,42,.24);font:14px/1.5 Arial,sans-serif}.ipack-consent p{margin:0 0 12px}.ipack-consent-actions{display:flex;gap:10px;flex-wrap:wrap}.ipack-consent button{border:1px solid #d3dbe7;border-radius:9px;padding:9px 15px;font-weight:700;cursor:pointer}.ipack-consent .accept{background:#d9271c;color:#fff;border-color:#d9271c}.ipack-consent a{color:#b91c1c}@media(max-width:600px){.ipack-consent{left:10px;right:10px;bottom:10px}}';
    document.head.appendChild(style);

    const banner = document.createElement('section');
    banner.className = 'ipack-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics privacy choice');
    banner.innerHTML = '<p><strong>Privacy choice</strong><br>With your permission, we use Google Analytics to understand which product and buyer-guide pages are useful. We do not send names, email addresses, phone numbers, inquiry text or uploaded files to analytics. See our <a href="/privacy-policy">Privacy Policy</a>.</p><div class="ipack-consent-actions"><button class="accept" type="button">Accept analytics</button><button class="reject" type="button">Reject</button></div>';
    banner.querySelector('.accept').addEventListener('click', function () {
      updateConsent('granted');
      banner.remove();
    });
    banner.querySelector('.reject').addEventListener('click', function () {
      updateConsent('denied');
      banner.remove();
    });
    document.body.appendChild(banner);
  }

  document.addEventListener('click', function (event) {
    const target = event.target.closest('a,button');
    if (!target) return;
    const href = target.getAttribute('href') || '';
    const section = target.closest('section[id]');
    const locationName = section ? section.id : (target.closest('header') ? 'header' : target.closest('footer') ? 'footer' : 'body');

    if (/wa\.me|api\.whatsapp\.com/i.test(href)) {
      track('whatsapp_click', { link_location: locationName });
    } else if (/^mailto:/i.test(href)) {
      track('email_click', { link_location: locationName });
    }

    if (target.matches('[data-add-inquiry], #homeAddRFQV49')) {
      track('add_to_quote', {
        product_id: target.dataset.id || undefined,
        product_category: target.dataset.category || undefined
      });
    }
  });

  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.checkValidity()) return;
    if (/formspree\.io/i.test(form.action)) {
      track('generate_lead', { form_id: form.id || 'rfq_form', lead_type: 'rfq' });
      return;
    }
    if (['vehicle-form', 'vehicle-center-form', 'catalog-filter', 'oe-form', 'oe-center-form', 'mobileFitmentFormV49'].includes(form.id)) {
      track('catalog_search', { search_type: form.id });
    }
  });

  window.ipackAnalytics = Object.freeze({
    configured: isConfigured,
    track: track,
    updateConsent: updateConsent,
    requiresPriorConsent: needsPriorConsent,
    isActive: analyticsAllowed,
    // Opt-out entry point for visitors in default-on regions, wired to the
    // control rendered on the privacy policy page.
    optOut: function () { updateConsent('denied'); },
    optIn: function () { updateConsent('granted'); }
  });

  // Wires the opt-out / opt-in control rendered on the privacy policy page.
  function preferenceControl() {
    const root = document.querySelector('[data-analytics-choice]');
    if (!root) return;
    const state = root.querySelector('[data-analytics-state]');
    const offBtn = root.querySelector('[data-analytics-optout]');
    const onBtn = root.querySelector('[data-analytics-optin]');

    function render() {
      const active = analyticsAllowed();
      if (state) {
        state.textContent = active
          ? 'Analytics is currently ON for this browser.'
          : 'Analytics is currently OFF for this browser.';
      }
      if (offBtn) offBtn.hidden = !active;
      if (onBtn) onBtn.hidden = active;
    }

    if (offBtn) offBtn.addEventListener('click', function () { updateConsent('denied'); render(); });
    if (onBtn) onBtn.addEventListener('click', function () { updateConsent('granted'); render(); });
    render();
  }

  function init() {
    consentBanner();
    preferenceControl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
