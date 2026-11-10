export interface StudioNavItem {
  index: string;
  label: string;
  href: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  motif: 'botanical' | 'bridal' | 'events';
  prefetch?: boolean;
}

export interface ShopCollectionItem {
  index: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

export const STUDIO_NAV_ITEMS: StudioNavItem[] = [
  {
    index: '01',
    label: 'Shop',
    href: '/shop',
    eyebrow: 'Small-Batch Botanicals & Tools',
    description:
      'Freshly hand-rolled organic henna cones, triple-sifted Rajasthani hair henna, essential aftercare oils, and precision artist tools.',
    ctaLabel: 'Browse Full Apothecary',
    motif: 'botanical',
  },
  {
    index: '02',
    label: 'Services',
    href: '/services',
    eyebrow: 'Bridal & Festive Commissions',
    description:
      'Bespoke Kashmiri bridal mehandi, intimate engagement gatherings, and custom botanical stain consultations by Sumaiya Rashid Magray.',
    ctaLabel: 'Explore Booking Tiers',
    motif: 'bridal',
  },
  {
    index: '03',
    label: 'Gallery',
    href: '/gallery',
    eyebrow: 'Stain Progression & Portfolio',
    description:
      'An editorial archive of 48-hour mahogany stain maturity, intricate bridal compositions, and natural palm flora studies.',
    ctaLabel: 'View Bridal Archive',
    motif: 'events',
  },
  {
    index: '04',
    label: 'About',
    href: '/about',
    eyebrow: 'Srinagar & Bangalore · Est. 2019',
    description:
      'Rooted in zero-chemical botanical craft—how Sana blends Sojat henna harvests with pure eucalyptus and clove essential oils.',
    ctaLabel: 'Read Artist Story',
    motif: 'botanical',
  },
  {
    index: '05',
    label: 'Contact',
    href: '/contact',
    eyebrow: 'Inquiries & Date Reservations',
    description:
      'Reserve your bridal dates in Srinagar, Bangalore, or destination venues, request wholesale cone batches, or consult directly with Sana.',
    ctaLabel: 'Start a Conversation',
    motif: 'bridal',
  },
];

export const SHOP_COLLECTIONS: ShopCollectionItem[] = [
  {
    index: '01',
    title: 'All Botanicals & Tools',
    subtitle: 'Complete 19-piece catalog & fresh batches',
    href: '/shop',
    badge: 'All 19',
  },
  {
    index: '02',
    title: 'Organic Henna Cones & Powder',
    subtitle: 'Bridal stain cones, herbal hair henna & triple-sifted leaf',
    href: '/shop?category=organic-henna',
    badge: 'Fresh Batch',
  },
  {
    index: '03',
    title: 'Bridal & Self-Care Kits',
    subtitle: 'Complete stain rituals & curated gift sets',
    href: '/shop?category=henna-kits-combos',
  },
  {
    index: '04',
    title: 'Essential Oils & Aftercare',
    subtitle: 'Pure eucalyptus, clove oil & stain-sealing balms',
    href: '/shop?category=henna-care-essential-oils',
  },
  {
    index: '05',
    title: 'Artist Tools & Supplies',
    subtitle: 'Pre-cut cellophane sheets, micro scales & measuring spoons',
    href: '/shop?category=mehandi-tools-supplies',
    badge: 'New',
  },
];

