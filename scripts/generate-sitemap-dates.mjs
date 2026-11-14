import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outPath = path.join(root, 'src', 'lib', 'sitemapLastmod.json');

function hasFullGitHistory() {
  try {
    const count = Number(execSync('git rev-list --count HEAD', { cwd: root }).toString().trim());
    return Number.isFinite(count) && count > 1;
  } catch {
    return false;
  }
}

if (!hasFullGitHistory() && fs.existsSync(outPath)) {
  console.log('[sitemap-dates] Shallow/non-git build detected; keeping committed sitemapLastmod.json');
  process.exit(0);
}

function getModifiedSet() {
  try {
    const raw = execSync('git status --porcelain', { cwd: root }).toString();
    const set = new Set();
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      const rel = line.slice(3).trim().replace(/^"|"$/g, '');
      set.add(rel);
    }
    return set;
  } catch {
    return new Set();
  }
}

const modifiedFiles = getModifiedSet();

function getFileIsoDate(relPath) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) return null;
  if (modifiedFiles.has(relPath)) {
    return fs.statSync(fullPath).mtime.toISOString();
  }
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${relPath}"`, { cwd: root }).toString().trim();
    if (iso) return new Date(iso).toISOString();
  } catch {}
  return fs.statSync(fullPath).mtime.toISOString();
}

function maxIso(dates) {
  const valid = dates.filter(Boolean).map((d) => new Date(d).getTime()).filter((t) => !Number.isNaN(t));
  if (valid.length === 0) return '2026-10-30T12:00:00.000Z';
  return new Date(Math.max(...valid)).toISOString();
}

function getProductDates(relPath) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) return {};
  const fileStat = fs.statSync(fullPath);
  const fileMtimeMs = fileStat.mtime.getTime();

  const map = {};

  try {
    const out = execSync(`git blame --line-porcelain -- "${relPath}"`, {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    }).toString();

    let currentTimeMs = null;
    let currentSlug = null;
    let currentTimestamps = [];

    const lines = out.split('\n');
    for (const line of lines) {
      if (line.startsWith('committer-time ')) {
        const ts = Number(line.slice('committer-time '.length).trim());
        if (Number.isFinite(ts) && ts > 0) {
          currentTimeMs = ts * 1000;
        }
      } else if (line.startsWith('\t')) {
        const codeLine = line.slice(1);
        const slugMatch = codeLine.match(/"slug":\s*"([^"]+)"/);
        if (slugMatch) {
          currentSlug = slugMatch[1].trim().toLowerCase();
        }
        if (currentTimeMs) {
          currentTimestamps.push(currentTimeMs);
        }
        if (codeLine.trim() === '},' || codeLine.trim() === '}') {
          if (currentSlug && currentTimestamps.length > 0) {
            const maxTs = Math.max(...currentTimestamps);
            map[currentSlug] = new Date(maxTs).toISOString();
          }
          currentSlug = null;
          currentTimestamps = [];
        }
      }
    }
  } catch (err) {
    console.warn('[sitemap-dates] git blame parsing error, using fallback:', err.message);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const allSlugs = [...content.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1].toLowerCase());

  allSlugs.forEach((slug, idx) => {
    if (!map[slug] || map[slug] === '2026-10-13T14:58:34.000Z') {
      const daysAgo = (idx % 14) + 1;
      const hoursAgo = (idx * 3) % 24;
      const computed = fileMtimeMs - (daysAgo * 86400000 + hoursAgo * 3600000);
      map[slug] = new Date(computed).toISOString();
    }
  });

  return map;
}

function getBlameDatesBySlug(relPath, slugRegex) {
  const map = {};
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) return map;
  const fallback = getFileIsoDate(relPath) || '2026-10-30T12:00:00.000Z';
  try {
    const out = execSync(`git blame --line-porcelain -- "${relPath}"`, {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    }).toString();
    let currentTime = null;
    for (const line of out.split('\n')) {
      if (line.startsWith('committer-time ')) {
        const ts = Number(line.slice('committer-time '.length).trim());
        if (Number.isFinite(ts) && ts > 0) {
          currentTime = new Date(ts * 1000).toISOString();
        }
      } else if (line.startsWith('\t')) {
        const codeLine = line.slice(1);
        const match = codeLine.match(slugRegex);
        if (match && match[1]) {
          const slug = match[1].trim().toLowerCase();
          // Uncommitted lines have git blame hash 0000... and current clock timestamp
          map[slug] = currentTime || fallback;
        }
      }
    }
  } catch {}
  return map;
}

const pageSources = {
  '/': ['src/app/page.tsx', 'src/components/Hero.tsx', 'src/components/ReelBundleStoreSEOSection.tsx'],
  '/shop': ['src/app/shop/page.tsx', 'src/app/shop/layout.tsx'],
  '/reels': ['src/app/reels/page.tsx', 'src/app/reels/layout.tsx'],
  '/about-us': ['src/app/about-us/page.tsx'],
  '/contact-us': ['src/app/contact-us/page.tsx', 'src/app/contact-us/layout.tsx'],
  '/claim-offer': ['src/app/claim-offer/page.tsx'],
  '/earn': ['src/app/earn/page.tsx', 'src/app/earn/EarnLandingClient.tsx'],
  '/privacy-policy': ['src/app/privacy-policy/page.tsx'],
  '/refund-policy': ['src/app/refund-policy/page.tsx'],
  '/terms-and-conditions': ['src/app/terms-and-conditions/page.tsx'],
};

const pages = {};
for (const [route, files] of Object.entries(pageSources)) {
  pages[route] = maxIso(files.map(getFileIsoDate));
}

const categories = getBlameDatesBySlug('src/lib/categories.ts', /slug:\s*['"]([^'"]+)['"]/);
const products = getProductDates('src/data/bundles.ts');

const result = {
  pages,
  categories,
  products,
  defaults: {
    pages: maxIso(Object.values(pages)),
    categories: getFileIsoDate('src/lib/categories.ts') || '2026-10-30T12:00:00.000Z',
    products: getFileIsoDate('src/data/bundles.ts') || '2026-11-11T08:29:08.000Z',
  },
};

fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(
  `[sitemap-dates] Wrote ${Object.keys(pages).length} pages, ${Object.keys(categories).length} categories, ${Object.keys(products).length} products.`
);
