const fs = require('fs');

const SITE_URL = 'https://vivahvilla.in';
const collections = JSON.parse(fs.readFileSync('collections.json', 'utf8'))
  .filter((item) => item.active !== false);

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isVisibleValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  const numericValue = normalized.replace(/[^\d.]/g, '');
  return numericValue === '' || Number(numericValue) !== 0;
}

function moneyNumber(value) {
  const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? match[0] : '';
}

function cleanText(value) {
  return String(value || '').replace(/â‚¹/g, 'Rs.');
}

function category(item) {
  const tags = item.tags || [];
  if (tags.includes('women')) return "Women's Traditional Wear";
  if (tags.includes('sherwani')) return "Men's Sherwani";
  if (tags.includes('jodhpuri') || tags.includes('open Jodhpuris')) return "Men's Jodhpuri";
  if (tags.includes('indowestern')) return "Men's Indowestern";
  return 'Wedding Attire Rental';
}

function card(item, index) {
  const tags = (item.tags || []).join('|');
  const img = item.img || 'img/logo/logo.png';
  const title = item.title || 'Vivah Villa Collection Outfit';
  const desc = item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.';
  const price = cleanText(item.price || 'Price on request');
  const eager = index < 6 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  const sizeHtml = isVisibleValue(item.size)
    ? `\n              <p class="collection-meta"><span>Sizes:</span> ${esc(item.size)}</p>`
    : '';
  const sellingPriceHtml = isVisibleValue(item.sellingPrice)
    ? `\n              <p class="collection-meta selling-price"><span>Selling Price:</span> ${esc(cleanText(item.sellingPrice))}</p>`
    : '';
  const reelHtml = item.reelUrl
    ? `\n              <p class="collection-reel"><a href="${esc(item.reelUrl)}" target="_blank" rel="noopener">Watch Reel</a></p>`
    : '';

  return `          <article class="collection-card visible all-collection-card" data-tags="${esc(tags)}" itemscope itemtype="https://schema.org/Product">
            <a class="all-collection-image-link" href="${esc(img)}" aria-label="View ${esc(title)} image">
              <img src="${esc(img)}" alt="${esc(item.alt || title)}" width="640" height="800" ${eager} decoding="async" itemprop="image">
            </a>
            <div class="collection-content">
              <h3 class="collection-title" itemprop="name">${esc(title)}</h3>
              <p class="collection-description" itemprop="description">${esc(desc)}</p>
              <p class="collection-price"><span>Rent:</span> ${esc(price)}</p>${sizeHtml}${sellingPriceHtml}${reelHtml}
              <meta itemprop="category" content="${esc(category(item))}">
            </div>
          </article>`;
}

const itemList = collections.map((item, index) => {
  const img = item.img || 'img/logo/logo.png';
  const price = moneyNumber(item.price);
  const product = {
    '@type': 'Product',
    name: item.title || 'Vivah Villa Collection Outfit',
    description: item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.',
    image: `${SITE_URL}/${img}`,
    category: category(item),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/all-collections.html`
    }
  };
  if (price) product.offers.price = price;

  return {
    '@type': 'ListItem',
    position: index + 1,
    item: product
  };
});

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Collections - Vivah Villa Collection Wedding Attire Rental</title>
  <meta name="description" content="Browse every Vivah Villa Collection rental outfit with crawlable images: sherwanis, indowesterns, Jodhpuris, lehengas, cholis, suits and premium wedding attire in Rajkot.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${SITE_URL}/all-collections.html">
  <meta property="og:title" content="All Collections - Vivah Villa Collection">
  <meta property="og:description" content="Complete wedding attire rental collection from Vivah Villa Collection in Rajkot.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/all-collections.html">
  <meta property="og:image" content="${SITE_URL}/${collections[0]?.img || 'img/logo/logo.png'}">
  <link rel="stylesheet" href="css2.css">
  <link rel="stylesheet" href="font-awesome.min.css">
  <link rel="stylesheet" href="styles.css">
  <style>
    .all-collections-page {
      background: var(--bg-gradient);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .all-collections-page .fullscreen-panel-header {
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .all-collections-page .panel-close-btn {
      text-decoration: none;
    }

    .all-collections-page .panel-title h1 {
      margin: 0;
      color: var(--white);
      font-size: var(--font-size-3xl);
      font-weight: 700;
    }

    .all-collections-page .fullscreen-panel-content {
      min-height: calc(100vh - 96px);
    }

    .all-collections-page .fullscreen-filter-tabs {
      margin-bottom: 1.5rem;
    }

    .all-collections-page .fullscreen-collections-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 20px;
      justify-items: center;
      min-height: 100px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .all-collection-card {
      display: block !important;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-height: 200px;
      width: 100%;
      max-width: 320px;
      transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    }

    .all-collection-card[hidden] {
      display: none !important;
    }

    .all-collection-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .all-collection-image-link {
      display: block;
      margin-bottom: 12px;
      text-decoration: none;
    }

    .all-collection-image-link img {
      width: 100%;
      height: auto;
      max-height: 300px;
      object-fit: contain;
      border-radius: 4px;
      display: block;
    }

    .all-collection-card .collection-content {
      padding: 8px 0;
    }

    .all-collection-card .collection-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      line-height: 1.3;
      color: #333;
      font-weight: 600;
    }

    .all-collection-card .collection-description {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.45;
    }

    .all-collection-card .collection-price,
    .all-collection-card .collection-meta,
    .all-collection-card .collection-reel {
      margin: 4px 0 0;
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }

    .all-collection-card .collection-price {
      color: #8b1538;
      font-size: 16px;
      font-weight: 700;
    }

    .all-collection-card span {
      color: #666;
      font-weight: 600;
    }

    .all-collection-card .selling-price {
      color: #047857;
    }

    .collection-reel a {
      color: #E1306C;
      text-decoration: none;
      font-weight: 600;
    }

    .all-collections-empty {
      text-align: center;
      grid-column: 1 / -1;
      padding: var(--space-12);
      color: var(--gray-500);
      font-size: var(--font-size-lg);
    }

    .all-collections-footer {
      padding: 1.25rem;
      text-align: center;
      color: var(--gray-600);
      background: rgba(255,255,255,0.7);
    }

    .all-collections-footer a {
      color: var(--primary-color);
      font-weight: 700;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .all-collections-page .fullscreen-panel-header {
        align-items: flex-start;
        gap: 1rem;
      }

      .all-collections-page .fullscreen-collections-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        padding: 0.5rem;
      }
    }
  </style>
</head>
<body class="all-collections-page">
  <main>
    <section class="all-collections-panel" aria-labelledby="allCollectionsTitle">
      <div class="fullscreen-panel-header">
        <div class="panel-title">
          <h1 id="allCollectionsTitle">All Collections</h1>
          <p>Browse our complete collection of premium wedding attire</p>
        </div>
        <a class="panel-close-btn" href="index.html#collections" aria-label="Back to home collections">
          <i class="fas fa-times"></i>
        </a>
      </div>

      <div class="fullscreen-panel-content">
        <div class="fullscreen-filter-tabs" id="fullscreenFilterTabs" role="tablist" aria-label="Collection filters">
          <button class="fullscreen-filter-tab active" data-filter="all" type="button" role="tab" aria-selected="true">
            <span>All Collections</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="men" type="button" role="tab" aria-selected="false">
            <i class="fas fa-male"></i>
            <span>Men</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="women" type="button" role="tab" aria-selected="false">
            <i class="fas fa-female"></i>
            <span>Women</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="indowestern" type="button" role="tab" aria-selected="false">
            <span>Indowestern</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="sherwani" type="button" role="tab" aria-selected="false">
            <span>Sherwanis</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="lehenga" type="button" role="tab" aria-selected="false">
            <span>Lehengas</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="jodhpuri" type="button" role="tab" aria-selected="false">
            <span>Jodhpuris</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="open Jodhpuris" type="button" role="tab" aria-selected="false">
            <span>Open Jodhpuris</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="choli" type="button" role="tab" aria-selected="false">
            <span>Cholis</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="suit" type="button" role="tab" aria-selected="false">
            <span>Suit</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="blezer" type="button" role="tab" aria-selected="false">
            <span>Blezer</span>
          </button>
          <button class="fullscreen-filter-tab" data-filter="koti kurta" type="button" role="tab" aria-selected="false">
            <span>Koti Kurta</span>
          </button>
        </div>
        <div class="fullscreen-collections-grid" id="fullscreenCollectionsGrid">
${collections.map(card).join('\n')}
          <p class="all-collections-empty" id="collectionsEmpty" hidden>No collections found.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="all-collections-footer">
    <p>&copy; 2026 Vivah Villa Collection. <a href="index.html#contact">Contact</a></p>
  </footer>

  <script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Vivah Villa Collection Wedding Attire Rentals',
  url: `${SITE_URL}/all-collections.html`,
  numberOfItems: collections.length,
  itemListElement: itemList
}, null, 2)}
  </script>
  <script>
    (function () {
      const tabs = document.querySelectorAll('.fullscreen-filter-tab');
      const cards = document.querySelectorAll('.all-collection-card');
      const empty = document.getElementById('collectionsEmpty');

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const filter = tab.dataset.filter || 'all';
          let visibleCount = 0;

          tabs.forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', String(isActive));
          });

          cards.forEach((card) => {
            const tags = (card.dataset.tags || '').split('|');
            const shouldShow = filter === 'all' || tags.includes(filter);
            card.hidden = !shouldShow;
            if (shouldShow) visibleCount += 1;
          });

          if (empty) empty.hidden = visibleCount !== 0;
        });
      });
    })();
  </script>
</body>
</html>
`;

fs.writeFileSync('all-collections.html', page);

const collectionImageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/all-collections.html</loc>
${collections.map((item) => `    <image:image>
      <image:loc>${SITE_URL}/${esc(item.img || 'img/logo/logo.png')}</image:loc>
      <image:title>${esc(item.title || 'Vivah Villa Collection Outfit')}</image:title>
      <image:caption>${esc(item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.')}</image:caption>
    </image:image>`).join('\n')}
  </url>
</urlset>
`;

fs.writeFileSync('sitemap_collections.xml', collectionImageSitemap);
console.log(`Generated all-collections.html and sitemap_collections.xml with ${collections.length} active collection items.`);
