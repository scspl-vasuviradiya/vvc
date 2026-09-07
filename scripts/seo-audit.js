const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://vivahvilla.in';
const productDir = path.join(ROOT, 'products');
const indexedFiles = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'all-collections.html'),
  ...fs.readdirSync(productDir)
    .filter((name) => name.endsWith('.html'))
    .sort()
    .map((name) => path.join(productDir, name))
];

const errors = [];
const warnings = [];
const canonicalOwners = new Map();

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2].trim() : '';
}

function meta(html, key, value) {
  const tag = tags(html, 'meta').find((entry) => attribute(entry, key).toLowerCase() === value.toLowerCase());
  return tag ? attribute(tag, 'content') : '';
}

function link(html, rel) {
  const tag = tags(html, 'link').find((entry) => attribute(entry, 'rel').toLowerCase() === rel.toLowerCase());
  return tag ? attribute(tag, 'href') : '';
}

function localFileForUrl(url, sourceFile) {
  if (!url || /^(?:https?:)?\/\//i.test(url) || /^(?:mailto|tel|javascript):/i.test(url) || url.startsWith('#')) return null;
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!clean) return null;
  if (clean === '/') return path.join(ROOT, 'index.html');
  const candidate = clean.startsWith('/')
    ? path.join(ROOT, clean.slice(1))
    : path.resolve(path.dirname(sourceFile), clean);
  return candidate;
}

for (const file of indexedFiles) {
  const fileName = relative(file);
  const html = fs.readFileSync(file, 'utf8');
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
  const description = meta(html, 'name', 'description');
  const canonical = link(html, 'canonical');
  const robots = meta(html, 'name', 'robots');
  const htmlLang = (html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i) || [])[1] || '';
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`${fileName}: missing title`);
  if (!description) errors.push(`${fileName}: missing meta description`);
  if (!canonical.startsWith(`${SITE_URL}/`)) errors.push(`${fileName}: missing or invalid canonical URL`);
  if (!/\bindex\b/i.test(robots)) errors.push(`${fileName}: page is not indexable`);
  if (htmlLang !== 'en-IN') errors.push(`${fileName}: expected html lang="en-IN"`);
  if (h1Count !== 1) errors.push(`${fileName}: expected one h1, found ${h1Count}`);

  if (title.length > 65) warnings.push(`${fileName}: title is ${title.length} characters`);
  if (description.length > 160) warnings.push(`${fileName}: description is ${description.length} characters`);
  if (description.length < 70) warnings.push(`${fileName}: description is only ${description.length} characters`);

  for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!meta(html, 'property', property)) errors.push(`${fileName}: missing ${property}`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!meta(html, 'name', name)) errors.push(`${fileName}: missing ${name}`);
  }

  if (canonical) {
    if (canonicalOwners.has(canonical)) {
      errors.push(`${fileName}: canonical duplicates ${canonicalOwners.get(canonical)}`);
    } else {
      canonicalOwners.set(canonical, fileName);
    }
  }

  const schemaBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!schemaBlocks.length) errors.push(`${fileName}: missing JSON-LD schema`);
  schemaBlocks.forEach((match, index) => {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${fileName}: invalid JSON-LD block ${index + 1} (${error.message})`);
    }
  });

  for (const imageTag of tags(html, 'img')) {
    if (!attribute(imageTag, 'alt')) errors.push(`${fileName}: image is missing alt text`);
    const imagePath = localFileForUrl(attribute(imageTag, 'src'), file);
    if (imagePath && !imagePath.includes('${') && !fs.existsSync(imagePath)) {
      errors.push(`${fileName}: missing image ${relative(imagePath)}`);
    }
  }

  for (const anchorTag of tags(html, 'a')) {
    const href = attribute(anchorTag, 'href');
    const linkedFile = localFileForUrl(href, file);
    if (linkedFile && !linkedFile.includes('${') && !fs.existsSync(linkedFile)) {
      errors.push(`${fileName}: broken internal link ${href}`);
    }
  }
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap_products.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const productCount = indexedFiles.length - 2;
if (sitemapUrls.length !== productCount) {
  errors.push(`sitemap_products.xml: expected ${productCount} product URLs, found ${sitemapUrls.length}`);
}

const sitemapIndex = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const required of ['sitemap_pages.xml', 'sitemap_products.xml']) {
  if (!sitemapIndex.includes(`${SITE_URL}/${required}`)) errors.push(`sitemap.xml: missing ${required}`);
}

console.log(`SEO audit checked ${indexedFiles.length} indexable pages (${productCount} products).`);
warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
errors.forEach((error) => console.error(`ERROR: ${error}`));

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`SEO audit passed with ${warnings.length} warning(s).`);
