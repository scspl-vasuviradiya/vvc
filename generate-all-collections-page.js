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
  const tags = (item.tags || []).join(' ');
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
              <h2 class="collection-title" itemprop="name">${esc(title)}</h2>
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
    }

    .all-collections-hero {
      padding: 132px 0 44px;
      background: linear-gradient(135deg, rgba(139, 21, 56, 0.92), rgba(31, 41, 55, 0.9)), url('img/gallery/hero.jpg') center/cover;
      color: var(--white);
    }

    .all-collections-hero .container {
      max-width: 1120px;
    }

    .all-collections-eyebrow {
      display: inline-block;
      margin-bottom: 14px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.78);
    }

    .all-collections-hero h1 {
      max-width: 760px;
      margin: 0 0 14px;
      font-size: clamp(2rem, 4vw, 4.25rem);
      line-height: 1.05;
      color: var(--white);
    }

    .all-collections-hero p {
      max-width: 720px;
      margin: 0;
      color: rgba(255, 255, 255, 0.86);
      font-size: 1.08rem;
    }

    .all-collections-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
    }

    .all-collections-actions .btn {
      min-height: 48px;
    }

    .all-collections-main {
      padding: 48px 0 80px;
    }

    .all-collections-summary {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 28px;
    }

    .all-collections-summary h2 {
      margin: 0 0 6px;
      font-size: clamp(1.5rem, 3vw, 2.35rem);
    }

    .all-collections-summary p {
      margin: 0;
      color: var(--gray-600);
    }

    .all-collections-count {
      flex: 0 0 auto;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      background: var(--white);
      padding: 12px 16px;
      color: var(--primary-color);
      font-weight: 800;
    }

    .all-collections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      align-items: start;
    }

    .all-collection-card {
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
      background: var(--white);
      height: 100%;
    }

    .all-collection-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .all-collection-image-link {
      display: block;
      background: #f8f5f2;
      aspect-ratio: 4 / 5;
      overflow: hidden;
    }

    .all-collection-image-link img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }

    .all-collection-card .collection-content {
      padding: 16px;
    }

    .all-collection-card .collection-title {
      margin: 0 0 8px;
      font-size: 1.05rem;
      line-height: 1.25;
    }

    .all-collection-card .collection-description {
      margin: 0 0 10px;
      color: var(--gray-600);
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .all-collection-card .collection-price,
    .all-collection-card .collection-meta,
    .all-collection-card .collection-reel {
      margin: 6px 0 0;
      font-size: 0.94rem;
      color: var(--gray-800);
      font-weight: 600;
    }

    .all-collection-card .collection-price {
      color: var(--primary-color);
      font-weight: 800;
    }

    .all-collection-card span {
      color: var(--gray-600);
      font-weight: 700;
    }

    .all-collection-card .selling-price {
      color: #047857;
    }

    .collection-reel a {
      color: #c13584;
      text-decoration: none;
      font-weight: 800;
    }

    @media (max-width: 700px) {
      .all-collections-hero {
        padding-top: 108px;
      }

      .all-collections-summary {
        display: block;
      }

      .all-collections-count {
        display: inline-block;
        margin-top: 14px;
      }
    }
  </style>
</head>
<body class="all-collections-page">
  <header class="header" id="header">
    <nav class="navbar">
      <div class="nav-container">
        <a href="index.html" class="nav-brand" aria-label="Vivah Villa Collection home">
          <img src="img/logo/logo.png" alt="Vivah Villa Collection" class="brand-logo">
          <div class="brand-text">
            <span class="brand-name">Vivah Villa</span>
            <span class="brand-subtitle">Collection</span>
          </div>
        </a>
        <div class="nav-menu" id="navMenu">
          <a class="nav-link" href="index.html#home">Home</a>
          <a class="nav-link active" href="all-collections.html">All Collections</a>
          <a class="nav-link" href="index.html#gallery">Gallery</a>
          <a class="nav-link" href="index.html#contact">Contact</a>
          <a class="nav-cta" href="https://wa.me/919099055844?text=Hi%20Vivah%20Villa%20Collection%2C%20I%20want%20to%20rent%20an%20outfit" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i>
            <span>Book Now</span>
          </a>
        </div>
      </div>
    </nav>
  </header>

  <main>
    <section class="all-collections-hero">
      <div class="container">
        <span class="all-collections-eyebrow">Complete Collection</span>
        <h1>All Vivah Villa Collection Wedding Outfits</h1>
        <p>Every active collection image is rendered directly on this page for search indexing, image discovery, and easy browsing before your store visit.</p>
        <div class="all-collections-actions">
          <a class="btn btn-primary btn-lg" href="https://wa.me/919099055844?text=Hi%20Vivah%20Villa%20Collection%2C%20I%20want%20to%20rent%20an%20outfit" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i>
            <span>Ask Availability</span>
          </a>
          <a class="btn btn-outline btn-lg" href="index.html#collections">
            <i class="fas fa-arrow-left"></i>
            <span>Back to Home</span>
          </a>
        </div>
      </div>
    </section>

    <section class="all-collections-main">
      <div class="container">
        <div class="all-collections-summary">
          <div>
            <h2>Browse ${collections.length} Rental Outfits</h2>
            <p>Sherwanis, indowesterns, Jodhpuris, lehengas, cholis, suits and curated festive wear.</p>
          </div>
          <div class="all-collections-count">${collections.length} images</div>
        </div>
        <div class="all-collections-grid">
${collections.map(card).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <p>&copy; 2026 Vivah Villa Collection. All rights reserved.</p>
        <p><a href="index.html">Home</a> | <a href="all-collections.html">All Collections</a> | <a href="index.html#contact">Contact</a></p>
      </div>
    </div>
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
