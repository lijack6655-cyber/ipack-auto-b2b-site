/* Published CMS articles only; existing buyer guides remain static. */
(async () => {
  const container = document.getElementById('company-news');
  const status = document.getElementById('company-news-status');
  if (!container || !status) return;
  try {
    const response = await fetch('/api/articles', { cache: 'no-store' });
    if (!response.ok) throw new Error('News unavailable');
    const { articles } = await response.json();
    if (!Array.isArray(articles)) throw new Error('Invalid news response');
    for (const article of articles) {
      if (!article || typeof article.slug !== 'string' || typeof article.title !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) continue;
      const card = document.createElement('a');
      card.className = 'card card-pad';
      card.href = '/news/' + article.slug;
      const imagePath = article.featured_image_path;
      const localImage = typeof imagePath === 'string' && /^\/assets\/[a-zA-Z0-9/_ .-]+$/.test(imagePath) && !imagePath.includes('..');
      let secureImage = false;
      try { secureImage = typeof imagePath === 'string' && new URL(imagePath).protocol === 'https:'; } catch { /* Relative paths handled above. */ }
      if (localImage || secureImage) {
        const img = document.createElement('img');
        img.src = article.featured_image_path;
        img.alt = article.title;
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.style.cssText = 'width:100%;height:240px;object-fit:contain;background:#f8fafc';
        card.append(img);
      }
      const title = document.createElement('h3');
      title.textContent = article.title;
      const excerpt = document.createElement('p');
      excerpt.textContent = article.excerpt || '';
      card.append(title, excerpt);
      container.append(card);
    }
    status.textContent = container.children.length ? '' : 'Company updates will appear here.';
  } catch {
    status.textContent = 'Company news is temporarily unavailable. Please refresh to try again.';
  }
})();
