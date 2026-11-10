const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'essential-oil': 'henna-care-essential-oils',
  'essential-oils': 'henna-care-essential-oils',
  'bridal-kit': 'henna-kits-combos',
  'bridal-kits': 'henna-kits-combos',
  'organic-henna-cones': 'organic-henna',
  'organic-henna-powder': 'organic-henna',
  'artist-tools': 'mehandi-tools-supplies',
  tools: 'mehandi-tools-supplies',
};

export function normalizeCategorySlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, '')
    .replace(/&/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return CATEGORY_SLUG_ALIASES[cleaned] || cleaned;
}

