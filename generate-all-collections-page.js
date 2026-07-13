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

function normalizeText(value) {
  return String(value || '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortSentence(value, maxLength = 140) {
  const text = normalizeText(value).replace(/\s*([,.!?;:])\s*/g, '$1 ');
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : maxLength).trim()}.`;
}

function absoluteUrl(path) {
  const normalized = String(path || 'img/logo/logo.png').replace(/^\/+/, '');
  return `${SITE_URL}/${normalized}`;
}

function seoKeywords(item) {
  const values = [item.title, ...(item.tags || []), item.alt, 'vivah villa', 'vivahvilla.in', 'wedding attire rental rajkot'];
  return values
    .filter(Boolean)
    .join(', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldReplaceAltText(value) {
  const text = normalizeText(value);
  if (!text) return true;
  const commaCount = (text.match(/,/g) || []).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  return commaCount >= 4 || (words >= 14 && !/[.!?]/.test(text));
}

function imageAlt(item) {
  const suppliedAlt = normalizeText(item.alt);
  if (!shouldReplaceAltText(suppliedAlt)) return suppliedAlt;

  const title = normalizeText(item.title || 'Vivah Villa collection outfit');
  const description = shortSentence(item.desc, 110);
  if (description) return `${title}. ${description}`;
  return `${title} available for rent at Vivah Villa Collection.`;
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
  const alt = imageAlt(item);
  const price = cleanText(item.price || 'Price on request');
  const imageUrl = absoluteUrl(img);
  const keywords = seoKeywords(item);
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
            <a class="all-collection-image-link" href="${esc(img)}" aria-label="View ${esc(title)} image" itemprop="url">
              <img src="${esc(img)}" alt="${esc(alt)}" width="320" height="400" ${eager} decoding="async" itemprop="image">
            </a>
            <div class="collection-content">
              <h3 class="collection-title" itemprop="name">${esc(title)}</h3>
              <p class="collection-description" itemprop="description">${esc(desc)}</p>
              <p class="collection-price"><span>Rent:</span> ${esc(price)}</p>${sizeHtml}${sellingPriceHtml}${reelHtml}
              <meta itemprop="keywords" content="${esc(keywords)}">
              <meta itemprop="category" content="${esc(category(item))}">
              <meta itemprop="image" content="${esc(imageUrl)}">
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
    image: absoluteUrl(img),
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

const imageGallery = collections.map((item, index) => ({
  '@type': 'ImageObject',
  position: index + 1,
  contentUrl: absoluteUrl(item.img || 'img/logo/logo.png'),
  name: item.title || 'Vivah Villa Collection Outfit',
  description: item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.',
  keywords: seoKeywords(item)
}));

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Collections - Vivah Villa Collection Wedding Attire Rental</title>
  <meta name="description" content="Browse every Vivah Villa Collection rental outfit with crawlable images: sherwanis, indowesterns, Jodhpuris, lehengas, cholis, suits and premium wedding attire in Rajkot.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="googlebot" content="index, follow, max-image-preview:large">
  <meta name="googlebot-image" content="index, follow, max-image-preview:large">
  <meta name="keywords" content="vivah villa, vivahvilla.in, wedding collection, sherwani rent rajkot, indowestern for groom, jodhpuri suit rental, lehenga rental rajkot, wedding attire rental, bridal dress rental rajkot">
  <link rel="canonical" href="${SITE_URL}/all-collections.html">
  <link rel="sitemap" type="application/xml" href="${SITE_URL}/sitemap_collections.xml">
  <meta property="og:title" content="All Collections - Vivah Villa Collection">
  <meta property="og:description" content="Complete wedding attire rental collection from Vivah Villa Collection in Rajkot.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/all-collections.html">
  <meta property="og:image" content="${absoluteUrl(collections[0]?.img || 'img/logo/logo.png')}">
  <link rel="stylesheet" href="css2.css">
  <link rel="stylesheet" href="font-awesome.min.css">
  <link rel="stylesheet" href="styles.css">
  <style>
    .all-collections-page {
      background: var(--bg-gradient);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .all-collections-page main {
      padding-top: 108px;
    }

    .all-collections-page .header + main {
      min-height: calc(100vh - 108px);
    }

    .all-collections-page .fullscreen-panel-header {
      position: sticky;
      top: 96px;
      z-index: 20;
    }

    .all-collections-page .all-collections-panel {
      padding: 0 0 2rem;
    }

    .all-collections-page .navbar-brand {
      text-decoration: none;
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

    .all-collections-page .collections-seo-copy {
      max-width: 1040px;
      margin: 0 auto;
      padding: 0 16px 8px;
      color: rgba(255,255,255,0.92);
      line-height: 1.7;
    }

    .all-collections-page .collections-seo-copy p {
      margin: 0 0 0.75rem;
    }

    .all-collections-page .fullscreen-collections-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      padding: 16px;
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
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-height: 200px;
      width: 100%;
      max-width: 260px;
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
      aspect-ratio: 4 / 5;
      height: auto;
      max-height: 220px;
      object-fit: cover;
      object-position: top;
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

    .all-collections-page .footer-links li {
      margin-bottom: 0.75rem;
    }

    @media (max-width: 768px) {
      .all-collections-page main {
        padding-top: 92px;
      }

      .all-collections-page .fullscreen-panel-header {
        align-items: flex-start;
        gap: 1rem;
        top: 84px;
      }

      .all-collections-page .fullscreen-collections-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
        padding: 0.5rem;
      }

      .all-collection-card {
        max-width: 100%;
      }
    }
  </style>
</head>
<body class="all-collections-page">
  <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

  <header class="header" data-anim="fade-down">
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar-container">
        <a class="navbar-brand" href="index.html#home" data-anim="fade-right">
          <img src="img/logo/logo.png" alt="Vivah Villa Collection" class="brand-logo">
          <div class="brand-text">
            <h1 class="brand-title">Vivah Villa</h1>
            <span class="brand-subtitle">Collection</span>
          </div>
        </a>

        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <nav class="navbar-nav desktop-nav" id="navbarNav">
          <a class="nav-link" href="index.html#home">Home</a>
          <a class="nav-link" href="index.html#about">About</a>
          <a class="nav-link" href="index.html#collections">Collections</a>
          <a class="nav-link" href="index.html#gallery">Gallery</a>
          <a class="nav-link" href="index.html#contact">Contact</a>
          <a class="nav-cta" href="https://wa.me/919099055844?text=Hi%20Vivah%20Villa%20Collection%2C%20I%20want%20to%20rent%20an%20outfit" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp" aria-hidden="true"></i>
            <span>WhatsApp</span>
          </a>
        </nav>

        <nav class="mobile-nav" id="mobileNav">
          <div class="mobile-nav-header">
            <div class="brand-mobile">
              <img src="img/logo/logo.png" alt="Vivah Villa Collection">
              <span>Vivah Villa Collection</span>
            </div>
            <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="mobile-nav-links">
            <a class="mobile-nav-link" href="index.html#home">Home</a>
            <a class="mobile-nav-link" href="index.html#about">About</a>
            <a class="mobile-nav-link" href="index.html#collections">Collections</a>
            <a class="mobile-nav-link" href="index.html#gallery">Gallery</a>
            <a class="mobile-nav-link" href="index.html#contact">Contact</a>
            <div class="mobile-nav-cta">
              <a class="btn-whatsapp" href="https://wa.me/919099055844?text=Hi%20Vivah%20Villa%20Collection%2C%20I%20want%20to%20rent%20an%20outfit" target="_blank" rel="noopener">
                <i class="fab fa-whatsapp"></i>
                <span>Contact via WhatsApp</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
    </nav>
  </header>

  <main>
    <section class="all-collections-panel" aria-labelledby="allCollectionsTitle">
      <div class="fullscreen-panel-header">
        <div class="panel-title">
          <h1 id="allCollectionsTitle">All Collections</h1>
          <p>Browse our complete collection of premium wedding attire</p>
          <p id="redirectStatus" aria-live="polite">All product photos are listed below for search indexing and image discovery.</p>
        </div>
        <a class="panel-close-btn" href="index.html#collections" aria-label="Back to home collections">
          <i class="fas fa-times"></i>
        </a>
      </div>

      <div class="fullscreen-panel-content">
        <div class="collections-seo-copy">
          <p>Explore ${collections.length} wedding outfits with static crawlable images, descriptive product text, and category coverage across sherwanis, indowesterns, Jodhpuris, lehengas, cholis, suits, and koti kurtas.</p>
          <p>Each collection card includes an indexable image, product title, rental details, and descriptive copy so Google can discover and understand the image in context.</p>
        </div>
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

  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section footer-brand" data-anim="fade-up">
          <div class="footer-logo">
            <img src="img/logo/logo.png" alt="Vivah Villa Collection">
            <div class="footer-brand-text">
              <h3>Vivah Villa Collection</h3>
              <p>Traditional style • Modern convenience</p>
            </div>
          </div>
          <p class="footer-description">
            Your trusted partner for premium wedding attire in Rajkot.
            Making your special occasions truly memorable with our curated collections.
          </p>
        </div>

        <div class="footer-section" data-anim="fade-up">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="index.html#home">Home</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="index.html#collections">Collections</a></li>
            <li><a href="index.html#gallery">Gallery</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>

        <div class="footer-section" data-anim="fade-up">
          <h4>Services</h4>
          <ul class="footer-links">
            <li>Outfit Rental</li>
            <li>Alterations</li>
            <li>Styling Consultation</li>
            <li>Express Cleaning</li>
            <li>Home Delivery</li>
          </ul>
        </div>

        <div class="footer-section" data-anim="fade-up">
          <h4>Rental Policy</h4>
          <ul class="footer-links">
            <li>Security deposit required</li>
            <li>ID proof at booking</li>
            <li>Damage fees apply</li>
            <li>Late return charges</li>
            <li>Advance booking recommended</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; <span id="currentYear"></span> Vivah Villa Collection. All rights reserved.</p>
        </div>
        <div class="footer-actions">
          <a href="#top" class="back-to-top" aria-label="Back to top">
            <i class="fas fa-arrow-up"></i>
            <span>Back to top</span>
          </a>
        </div>
      </div>
    </div>
  </footer>

  <script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Vivah Villa Collection Wedding Attire Rentals',
  url: `${SITE_URL}/all-collections.html`,
  description: 'Static gallery of wedding attire rental products and images from Vivah Villa Collection in Rajkot.',
  primaryImageOfPage: absoluteUrl(collections[0]?.img || 'img/logo/logo.png'),
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: collections.length,
    itemListElement: itemList
  },
  associatedMedia: imageGallery
}, null, 2)}
  </script>
  <script>
    (function () {
      const body = document.body;
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      const mobileNav = document.getElementById('mobileNav');
      const mobileNavClose = document.getElementById('mobileNavClose');
      const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
      const currentYear = document.getElementById('currentYear');
      const tabs = document.querySelectorAll('.fullscreen-filter-tab');
      const cards = document.querySelectorAll('.all-collection-card');
      const empty = document.getElementById('collectionsEmpty');

      function setMenuState(isOpen) {
        if (!mobileNav || !mobileMenuBtn || !mobileMenuOverlay) return;
        mobileNav.classList.toggle('active', isOpen);
        mobileMenuOverlay.classList.toggle('active', isOpen);
        body.classList.toggle('menu-open', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      }

      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
          const isOpen = mobileNav ? !mobileNav.classList.contains('active') : false;
          setMenuState(isOpen);
        });
      }

      if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => setMenuState(false));
      }

      if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => setMenuState(false));
      }

      document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', () => setMenuState(false));
      });

      if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
      }

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
