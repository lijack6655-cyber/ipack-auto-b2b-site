(function () {
  'use strict';

  // GA4 Measurement IDs are public identifiers, not secrets. Keep the real ID
  // in this single location once the Google Analytics web stream is confirmed.
  const MEASUREMENT_ID = '';
  const CONSENT_KEY = 'ipack_analytics_consent_v1';
  const isConfigured = /^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID);
  document.documentElement.dataset.ipackAnalytics = isConfigured ? 'configured' : 'ready';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
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
    if (granted) loadGa4();
  }

  function track(name, params) {
    if (!isConfigured) return;
    let consent = null;
    try { consent = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    if (consent !== 'granted') return;
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
    updateConsent: updateConsent
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', consentBanner, { once: true });
  } else {
    consentBanner();
  }
})();
