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

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'vivah-villa-outfit';
}

function uniqueSlug(item, usedSlugs) {
  const base = slugify(item.title || item.img || 'vivah-villa-outfit');
  let slug = base;
  let count = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${count}`;
    count += 1;
  }
  usedSlugs.add(slug);
  return slug;
}

const usedSlugs = new Set();
collections.forEach((item) => {
  item.slug = uniqueSlug(item, usedSlugs);
});

function productPath(item) {
  return `products/${item.slug}.html`;
}

function productUrl(item) {
  return `${SITE_URL}/${productPath(item)}`;
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

function productTitle(item) {
  return `${normalizeText(item.title || 'Wedding Outfit')} Rental in Rajkot | Vivah Villa`;
}

function productMetaDescription(item) {
  const title = normalizeText(item.title || 'premium wedding outfit');
  const cat = category(item).replace(/^Men's |^Women's /, '');
  const price = cleanText(item.price || '');
  const priceText = isVisibleValue(price) ? ` Rent starts at ${price}.` : '';
  return shortSentence(`${title} ${cat} available for rent at Vivah Villa Collection in Rajkot.${priceText} ${item.desc || ''}`, 155);
}

function card(item, index) {
  const tags = (item.tags || []).join('|');
  const img = item.img || 'img/logo/logo.png';
  const title = item.title || 'Vivah Villa Collection Outfit';
  const desc = item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.';
  const alt = imageAlt(item);
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

  return `          <article class="collection-card visible all-collection-card" data-tags="${esc(tags)}">
            <a class="all-collection-image-link" href="${esc(productPath(item))}" aria-label="View ${esc(title)} details">
              <img src="${esc(img)}" alt="${esc(alt)}" width="320" height="400" ${eager} decoding="async">
            </a>
            <div class="collection-content">
              <h3 class="collection-title"><a href="${esc(productPath(item))}">${esc(title)}</a></h3>
              <p class="collection-description">${esc(desc)}</p>
              <p class="collection-price"><span>Rent:</span> ${esc(price)}</p>${sizeHtml}${sellingPriceHtml}${reelHtml}
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
      url: productUrl(item)
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

const RELATED_CATEGORY_TAGS = [
  'sherwani',
  'indowestern',
  'jodhpuri',
  'open Jodhpuris',
  'lehenga',
  'choli',
  'suit',
  'blezer',
  'koti kurta'
];

function primaryCategoryTag(item) {
  const tags = item.tags || [];
  return RELATED_CATEGORY_TAGS.find((tag) => tags.includes(tag)) || '';
}

function rentPriceNumber(item) {
  const value = moneyNumber(item.price);
  return value ? Number(value) : null;
}

function relatedItems(currentItem) {
  const currentTags = new Set(currentItem.tags || []);
  const currentCategory = primaryCategoryTag(currentItem);
  const currentPrice = rentPriceNumber(currentItem);

  return collections
    .filter((item) => item !== currentItem)
    .map((item, index) => {
      const itemTags = item.tags || [];
      const sharedTags = itemTags.filter((tag) => currentTags.has(tag));
      const itemCategory = primaryCategoryTag(item);
      const itemPrice = rentPriceNumber(item);
      const categoryRank = currentCategory && itemCategory === currentCategory
        ? 0
        : sharedTags.some((tag) => RELATED_CATEGORY_TAGS.includes(tag))
          ? 1
          : sharedTags.length
            ? 2
            : 3;
      const priceDiff = currentPrice !== null && itemPrice !== null
        ? Math.abs(currentPrice - itemPrice)
        : Number.MAX_SAFE_INTEGER;

      return { item, index, categoryRank, priceDiff, sharedCount: sharedTags.length };
    })
    .sort((a, b) =>
      a.categoryRank - b.categoryRank ||
      a.priceDiff - b.priceDiff ||
      b.sharedCount - a.sharedCount ||
      a.index - b.index
    )
    .slice(0, 4)
    .map((entry) => entry.item);
}

function productPage(item) {
  const title = normalizeText(item.title || 'Vivah Villa Collection Outfit');
  const desc = item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.';
  const img = item.img || 'img/logo/logo.png';
  const price = cleanText(item.price || 'Price on request');
  const sellingPrice = cleanText(item.sellingPrice || '');
  const tags = (item.tags || []).map((tag) => normalizeText(tag)).filter(Boolean);
  const sizeHtml = isVisibleValue(item.size) ? `<p><span>Sizes</span>${esc(item.size)}</p>` : '';
  const sellingPriceHtml = isVisibleValue(sellingPrice) ? `<p><span>Selling Price</span>${esc(sellingPrice)}</p>` : '';
  const reelHtml = item.reelUrl ? `<a class="btn btn-outline" href="${esc(item.reelUrl)}" target="_blank" rel="noopener"><i class="fab fa-instagram"></i><span>Watch Reel</span></a>` : '';
  const related = relatedItems(item);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: desc,
    image: absoluteUrl(img),
    category: category(item),
    brand: {
      '@type': 'Brand',
      name: 'Vivah Villa Collection'
    },
    offers: {
      '@type': 'Offer',
      url: productUrl(item),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'ClothingStore',
        name: 'Vivah Villa Collection',
        telephone: '+919099055844',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Near Ayodhya chowk, 150 Feet Ring Rd',
          addressLocality: 'Rajkot',
          addressRegion: 'Gujarat',
          postalCode: '360006',
          addressCountry: 'IN'
        }
      }
    }
  };
  const numericPrice = moneyNumber(price);
  if (numericPrice) productSchema.offers.price = numericPrice;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(productTitle(item))}</title>
  <meta name="description" content="${esc(productMetaDescription(item))}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${productUrl(item)}">
  <meta property="og:title" content="${esc(productTitle(item))}">
  <meta property="og:description" content="${esc(productMetaDescription(item))}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="${productUrl(item)}">
  <meta property="og:image" content="${absoluteUrl(img)}">
  <link rel="stylesheet" href="../css2.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
    crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="../styles.css">
  <style>
    body.product-page { background: #f7f2ed; color: #24151a; }
    .product-page main { padding-top: 108px; }
    .product-hero { padding: 28px 0 48px; }
    .product-wrap { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    .breadcrumb { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 0 0 20px; font-size: 14px; color: #6b5a60; }
    .breadcrumb a { color: #8b1538; text-decoration: none; font-weight: 700; }
    .product-layout { display: grid; grid-template-columns: minmax(280px, 520px) 1fr; gap: 40px; align-items: start; }
    .product-media img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; object-position: top; border-radius: 8px; box-shadow: 0 16px 40px rgba(36, 21, 26, 0.16); background: #fff; }
    .product-copy { padding-top: 10px; }
    .product-kicker { color: #8b1538; font-weight: 800; text-transform: uppercase; letter-spacing: 0; font-size: 13px; margin-bottom: 10px; }
    .product-copy h1 { margin: 0 0 16px; font-family: "Playfair Display", serif; font-size: clamp(34px, 5vw, 58px); line-height: 1.05; color: #24151a; }
    .product-desc { font-size: 18px; line-height: 1.7; color: #4d3d43; margin: 0 0 22px; }
    .product-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 24px; }
    .product-tags span { background: #fff; border: 1px solid #eadde2; border-radius: 999px; padding: 8px 12px; color: #5c4950; font-weight: 700; font-size: 13px; }
    .product-facts { display: grid; gap: 10px; margin: 0 0 26px; }
    .product-facts p { margin: 0; padding: 14px 16px; background: #fff; border: 1px solid #eadde2; border-radius: 8px; font-weight: 800; color: #24151a; }
    .product-facts span { display: block; margin-bottom: 4px; color: #77636b; font-size: 13px; font-weight: 700; }
    .product-actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .related-section { padding: 32px 0 64px; background: #fff; }
    .related-section h2 { margin: 0 0 18px; font-family: "Playfair Display", serif; font-size: 30px; color: #24151a; }
    .related-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
    .related-card { display: block; text-decoration: none; color: inherit; border: 1px solid #eadde2; border-radius: 8px; overflow: hidden; background: #fff; }
    .related-card img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; object-position: top; display: block; }
    .related-card span { display: block; padding: 12px; font-weight: 800; line-height: 1.35; }
    @media (max-width: 820px) {
      .product-page main { padding-top: 92px; }
      .product-layout { grid-template-columns: 1fr; gap: 24px; }
      .related-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  </style>
</head>
<body class="product-page">
  <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
  <header class="header" data-anim="fade-down">
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar-container">
        <a class="navbar-brand" href="../index.html#home" data-anim="fade-right">
          <img src="../img/logo/logo.png" alt="Vivah Villa Collection" class="brand-logo">
          <div class="brand-text">
            <span class="brand-title">Vivah Villa</span>
            <span class="brand-subtitle">Collection</span>
          </div>
        </a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        <nav class="navbar-nav desktop-nav" id="navbarNav">
          <a class="nav-link" href="../index.html#home">Home</a>
          <a class="nav-link" href="../index.html#about">About</a>
          <a class="nav-link" href="../all-collections.html">Collections</a>
          <a class="nav-link" href="../index.html#gallery">Gallery</a>
          <a class="nav-link" href="../index.html#contact">Contact</a>
          <a class="nav-cta" href="https://wa.me/919099055844?text=Hi%20Vivah%20Villa%20Collection%2C%20I%20want%20to%20rent%20${encodeURIComponent(title)}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp" aria-hidden="true"></i>
            <span>WhatsApp</span>
          </a>
        </nav>
        <nav class="mobile-nav" id="mobileNav">
          <div class="mobile-nav-header">
            <div class="brand-mobile">
              <img src="../img/logo/logo.png" alt="Vivah Villa Collection">
              <span>Vivah Villa Collection</span>
            </div>
            <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu"><i class="fas fa-times"></i></button>
          </div>
          <div class="mobile-nav-links">
            <a class="mobile-nav-link" href="../index.html#home">Home</a>
            <a class="mobile-nav-link" href="../index.html#about">About</a>
            <a class="mobile-nav-link" href="../all-collections.html">Collections</a>
            <a class="mobile-nav-link" href="../index.html#gallery">Gallery</a>
            <a class="mobile-nav-link" href="../index.html#contact">Contact</a>
          </div>
        </nav>
      </div>
    </nav>
  </header>
  <main>
    <section class="product-hero">
      <div class="product-wrap">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="../index.html">Home</a>
          <span>/</span>
          <a href="../all-collections.html">Collections</a>
          <span>/</span>
          <span>${esc(title)}</span>
        </nav>
        <div class="product-layout">
          <div class="product-media">
            <img src="../${esc(img)}" alt="${esc(imageAlt(item))}" width="640" height="800" fetchpriority="high" decoding="async">
          </div>
          <div class="product-copy">
            <p class="product-kicker">${esc(category(item))} Rental in Rajkot</p>
            <h1>${esc(title)}</h1>
            <p class="product-desc">${esc(desc)}</p>
            <div class="product-tags">${tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
            <div class="product-facts">
              <p><span>Rent</span>${esc(price)}</p>
              ${sizeHtml}
              ${sellingPriceHtml}
            </div>
            <div class="product-actions">
              <a class="btn btn-primary btn-lg" href="https://wa.me/919099055844?text=Hi%20Vivah%20Villa%20Collection%2C%20I%20want%20to%20rent%20${encodeURIComponent(title)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Check Availability</span></a>
              <a class="btn btn-outline btn-lg" href="tel:+919099055844"><i class="fas fa-phone"></i><span>Call Now</span></a>
              ${reelHtml}
            </div>
          </div>
        </div>
      </div>
    </section>
    ${related.length ? `<section class="related-section">
      <div class="product-wrap">
        <h2>Similar Rentals</h2>
        <div class="related-grid">
          ${related.map((relatedItem) => `<a class="related-card" href="${esc(relatedItem.slug)}.html"><img src="../${esc(relatedItem.img || 'img/logo/logo.png')}" alt="${esc(imageAlt(relatedItem))}" loading="lazy" decoding="async"><span>${esc(relatedItem.title || 'Vivah Villa Collection Outfit')}</span></a>`).join('\n          ')}
        </div>
      </div>
    </section>` : ''}
  </main>
  <script type="application/ld+json">
${JSON.stringify(productSchema, null, 2)}
  </script>
  <script>
    (function () {
      const body = document.body;
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      const mobileNav = document.getElementById('mobileNav');
      const mobileNavClose = document.getElementById('mobileNavClose');
      const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
      function setMenuState(isOpen) {
        if (!mobileNav || !mobileMenuBtn || !mobileMenuOverlay) return;
        mobileNav.classList.toggle('active', isOpen);
        mobileMenuOverlay.classList.toggle('active', isOpen);
        body.classList.toggle('menu-open', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      }
      if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => setMenuState(mobileNav ? !mobileNav.classList.contains('active') : false));
      if (mobileNavClose) mobileNavClose.addEventListener('click', () => setMenuState(false));
      if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', () => setMenuState(false));
      document.querySelectorAll('.mobile-nav-link').forEach((link) => link.addEventListener('click', () => setMenuState(false)));
    })();
  </script>
</body>
</html>
`;
}

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
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
    crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="styles.css">
  <style>
    .all-collections-page {
      background: var(--bg-gradient);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .all-collections-page main {
      padding-top: 80px;
    }

    .all-collections-page .all-collections-panel {
      padding: var(--space-20) 0 var(--space-5);
      background: var(--bg-gradient);
      min-height: auto;
      overflow: visible;
    }

    .all-collections-page .navbar-brand {
      text-decoration: none;
    }

    .all-collections-page .fullscreen-panel-content {
      flex: initial;
      min-height: auto;
      padding: 0;
      overflow: visible;
      background: transparent;
    }

    .all-collections-page .fullscreen-filter-tabs {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      gap: var(--space-2);
      margin-bottom: var(--space-12);
      padding: 0;
      border-bottom: 0;
    }

    .all-collections-page .fullscreen-filter-tab {
      background: var(--white);
      padding: var(--space-3) var(--space-4);
    }

    .all-collections-page .fullscreen-filter-tab:hover,
    .all-collections-page .fullscreen-filter-tab.active {
      background: var(--primary-color);
    }

    .all-collections-page .fullscreen-collections-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 20px;
      justify-items: center;
      min-height: 100px;
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
      transform: translateY(-8px);
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
      max-height: 300px;
      object-fit: contain;
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

      .all-collections-page .fullscreen-collections-grid {
        grid-template-columns: 1fr;
        gap: var(--space-8);
        padding: 20px;
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
            <span class="brand-title">Vivah Villa</span>
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
          <a class="nav-link" href="/all-collections.html">Collections</a>
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
            <a class="mobile-nav-link" href="/all-collections.html">Collections</a>
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
    <section id="collections" class="collections-section all-collections-panel" aria-label="All Collections">
      <div class="container">
        <div class="section-header" data-anim="fade-up">
          <span class="section-badge">Our Collections</span>
          <h2 class="section-title">Premium Wedding Attire</h2>
          <p class="section-description">
            Browse our complete collection of premium wedding outfits. All pieces are available
            for rent and can be pre-booked for your special dates.
          </p>
        </div>
      <div class="fullscreen-panel-content">
        <h1 class="sr-only">All Wedding Dress Rental Collections in Rajkot</h1>
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
            <li><a href="/all-collections.html">Collections</a></li>
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

fs.mkdirSync('products', { recursive: true });
collections.forEach((item) => {
  fs.writeFileSync(productPath(item), productPage(item));
});

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

const productSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${collections.map((item) => `  <url>
    <loc>${productUrl(item)}</loc>
    <lastmod>2026-09-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${absoluteUrl(item.img || 'img/logo/logo.png')}</image:loc>
      <image:title>${esc(item.title || 'Vivah Villa Collection Outfit')}</image:title>
      <image:caption>${esc(item.desc || 'Premium wedding attire available for rent at Vivah Villa Collection.')}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync('sitemap_products.xml', productSitemap);
console.log(`Generated all-collections.html, sitemap_collections.xml, sitemap_products.xml, and ${collections.length} product pages.`);
