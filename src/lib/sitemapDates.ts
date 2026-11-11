import sitemapLastmod from './sitemapLastmod.json';

type LastmodData = {
  pages: Record<string, string>;
  categories: Record<string, string>;
  products: Record<string, string>;
  defaults: {
    pages: string;
    categories: string;
    products: string;
  };
};

const data = sitemapLastmod as LastmodData;

function toValidIso(candidate?: string | null): string | null {
  if (!candidate) return null;
  const ts = new Date(candidate).getTime();
  if (Number.isNaN(ts)) return null;
  return new Date(ts).toISOString();
}

function maxIso(...dates: (string | undefined | null)[]): string {
  const valid = dates
    .map((d) => toValidIso(d))
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime());
  if (valid.length === 0) return data.defaults.pages;
  return new Date(Math.max(...valid)).toISOString();
}

export function getPageLastmod(routePath: string): string {
  return data.pages[routePath] || data.defaults.pages;
}

export function getCategoryLastmod(slug: string, customDate?: string): string {
  const key = String(slug || '').trim().toLowerCase();
  return toValidIso(customDate) || data.categories[key] || data.defaults.categories;
}

export function getProductLastmod(slug: string, updatedAt?: string, createdAt?: string): string {
  const key = String(slug || '').trim().toLowerCase();
  const baseDate = data.products[key] || data.defaults.products;
  return maxIso(updatedAt, createdAt, baseDate);
}

export function getSitemapIndexLastmods() {
  return {
    pages: maxIso(...Object.values(data.pages), data.defaults.pages),
    categories: maxIso(...Object.values(data.categories), data.defaults.categories),
    products: maxIso(...Object.values(data.products), data.defaults.products),
  };
}
