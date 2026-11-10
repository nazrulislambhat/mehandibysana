import React, { useId } from 'react';

export type BrandCrestTone =
  | 'light'
  | 'dark'
  | 'ink-badge'
  | 'cream-badge'
  | 'transparent-ink'
  | 'transparent-cream';

export interface BrandCrestProps {
  tone?: BrandCrestTone;
  size?: number | string;
  decorative?: boolean;
  label?: string;
  className?: string;
}

/**
 * Canonical calligraphic 'S' Monogram path normalized inside 0 0 120 120 viewBox,
 * extracted at sub-pixel precision from the Mehandi by Sana production emblem.
 */
const PRODUCTION_MONOGRAM_120_PATH =
  'M49.2 40.5C49.9 39.9 50.4 39.8 51.2 40.5C51.4 41 51.4 41.5 51.5 41.9C55.5 44.2 61.4 37.2 60.7 33.4C58.8 34.5 57.6 36.7 55 35.6C55.6 33.6 57.1 32.2 56.4 30C55.2 25.7 50.1 24.6 46.7 26.9C45.1 28 44.1 29.5 43.3 31.1C41.5 35.1 43.5 41 45.2 44.7C47.8 50.4 51.9 55.2 55 60.5C56.8 63.6 58.4 67 59.5 70.4C60 72.1 60.4 73.8 61 75.4C65 74.3 69 73.8 73 72.5C74.7 71.9 76.8 71.4 77.6 69.6C77.5 69.1 77.3 68.7 77.2 68.3C78.9 67.5 79.2 69.1 80.3 69.8C81.1 68.7 80.5 66.1 79 65.8C78.4 65.6 77.9 66.2 77.3 66.1C76.4 64.7 78.1 63.8 79.4 64.1C81.4 64.6 82 67.2 81.9 68.9C81.5 73.7 76.4 75.3 72.7 76.5C72.8 77.3 72.7 77.9 72 78.4C71.5 78 71.2 77.5 70.6 77.3C68.3 76.3 63.8 76.2 61.5 77.3C61.3 79.1 61.8 81 61.6 82.8C61 87.6 58.9 94.8 55.2 98.4C53.1 100.4 50.3 102 47.3 100.4C44.4 98.8 43.9 95.5 44.1 92.5C44.4 86.2 50.2 80.8 55.3 77.7C56.4 77 57.7 76.7 58.7 76.1C58.6 73.8 57.5 71.2 56.6 69.1C54.5 63.8 51.6 59 48.1 54.4C46.1 51.8 43.4 48.9 39.9 49.7C38 48 40.5 46.6 41.7 45.6C41.4 44.4 40.7 43.3 40.3 42.1C39.2 39 38.7 35.7 38.9 32.4C38.9 32 39.2 31.6 39.3 31.1C39.6 29.4 39.9 27.8 40.7 26.3C43.5 20.6 50.3 18 56.2 20.1C65.6 23.6 65.4 37.6 57.4 42.3C55.3 43.5 48.1 44.9 49.2 40.5ZM48.1 98.1C50.8 99.7 54 97.9 55.4 95.3C57.7 91.3 59.2 86.8 59.2 82.1C59.2 80.9 59.5 79.2 59 78.1C54.7 79.1 47.3 85.9 46.2 90.3C45.5 93 45.4 96.4 48.1 98.1Z';

const TONE_PALETTES: Record<
  BrandCrestTone,
  {
    plateFill: string | null;
    plateStroke: string | null;
    ringColor: string;
    ringOpacity: string;
    dotHalo: string;
    dotHaloOpacity: string;
    gradTop: string;
    gradMid: string;
    gradBot: string;
  }
> = {
  light: {
    plateFill: '#fffee9',
    plateStroke: '#dfd3bd',
    ringColor: '#052225',
    ringOpacity: '0.16',
    dotHalo: '#9d5428',
    dotHaloOpacity: '0.42',
    gradTop: '#c97f45',
    gradMid: '#a85c30',
    gradBot: '#843d1b',
  },
  dark: {
    plateFill: '#052225',
    plateStroke: '#1a4347',
    ringColor: '#e5a365',
    ringOpacity: '0.24',
    dotHalo: '#e5a365',
    dotHaloOpacity: '0.46',
    gradTop: '#ebb073',
    gradMid: '#c67d48',
    gradBot: '#9e5427',
  },
  'ink-badge': {
    plateFill: '#052225',
    plateStroke: '#c67d48',
    ringColor: '#e5a365',
    ringOpacity: '0.26',
    dotHalo: '#e5a365',
    dotHaloOpacity: '0.52',
    gradTop: '#ebb073',
    gradMid: '#c67d48',
    gradBot: '#9e5427',
  },
  'cream-badge': {
    plateFill: '#fffee9',
    plateStroke: '#b97242',
    ringColor: '#9d5428',
    ringOpacity: '0.22',
    dotHalo: '#b97242',
    dotHaloOpacity: '0.48',
    gradTop: '#c97f45',
    gradMid: '#a85c30',
    gradBot: '#843d1b',
  },
  'transparent-ink': {
    plateFill: null,
    plateStroke: null,
    ringColor: '#052225',
    ringOpacity: '0.18',
    dotHalo: '#9d5428',
    dotHaloOpacity: '0.45',
    gradTop: '#c97f45',
    gradMid: '#a85c30',
    gradBot: '#843d1b',
  },
  'transparent-cream': {
    plateFill: null,
    plateStroke: null,
    ringColor: '#e5a365',
    ringOpacity: '0.28',
    dotHalo: '#e5a365',
    dotHaloOpacity: '0.54',
    gradTop: '#f0b375',
    gradMid: '#cc7e48',
    gradBot: '#a6592d',
  },
};

/**
 * Signature Calligraphic 'S' Monogram Seal — derived from the canonical
 * Mehandi by Sana production emblem and harmonized with architectural henna dotwork.
 */
export function BrandCrest({
  tone = 'transparent-ink',
  size = 40,
  decorative = true,
  label = 'Mehandi by Sana brand crest',
  className = '',
}: BrandCrestProps) {
  const palette = TONE_PALETTES[tone];
  const uid = useId().replace(/:/g, '');
  const gradId = `mbs-copper-${uid}`;
  const rimId = `mbs-rim-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="60" y1="16" x2="60" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.gradTop} />
          <stop offset="50%" stopColor={palette.gradMid} />
          <stop offset="100%" stopColor={palette.gradBot} />
        </linearGradient>
        {palette.plateStroke ? (
          <linearGradient id={rimId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.gradTop} />
            <stop offset="50%" stopColor={palette.plateStroke} />
            <stop offset="100%" stopColor={palette.gradBot} />
          </linearGradient>
        ) : null}
      </defs>

      {palette.plateFill ? (
        <rect
          x="3"
          y="3"
          width="114"
          height="114"
          rx="28"
          fill={palette.plateFill}
          stroke={palette.plateStroke ? `url(#${rimId})` : undefined}
          strokeWidth="1.65"
        />
      ) : null}

      {/* Outer architectural seal hairline */}
      <circle
        cx="60"
        cy="60"
        r="50.5"
        stroke={palette.ringColor}
        strokeOpacity={palette.ringOpacity}
        strokeWidth="1.15"
      />

      {/* Inner dashed henna dotwork halo */}
      <circle
        cx="60"
        cy="60"
        r="44.5"
        stroke={palette.dotHalo}
        strokeOpacity={palette.dotHaloOpacity}
        strokeWidth="1.35"
        strokeDasharray="2.2 4.8"
        strokeLinecap="round"
      />

      {/* Cardinal atelier diamonds & compass dots */}
      <polygon points="60,8.2 62.6,10.8 60,13.4 57.4,10.8" fill={`url(#${gradId})`} />
      <polygon points="60,106.6 62.6,109.2 60,111.8 57.4,109.2" fill={`url(#${gradId})`} />
      <circle cx="10.8" cy="60" r="1.5" fill={palette.dotHalo} fillOpacity="0.65" />
      <circle cx="109.2" cy="60" r="1.5" fill={palette.dotHalo} fillOpacity="0.65" />

      {/* Centerpiece Calligraphic 'S' Monogram */}
      <path
        d={PRODUCTION_MONOGRAM_120_PATH}
        transform="translate(60 60) scale(0.80) translate(-60 -60)"
        fill={`url(#${gradId})`}
        fillRule="evenodd"
      />
    </svg>
  );
}

export interface BrandLockupProps {
  tone?: 'light' | 'dark';
  crestSize?: number;
  subtitle?: string;
  className?: string;
}

/**
 * Horizontal Atelier Lockup combining the Calligraphic S Crest with editorial wordmark.
 */
export function BrandLockup({
  tone = 'light',
  crestSize = 40,
  subtitle = 'Srinagar · Bangalore',
  className = '',
}: BrandLockupProps) {
  const isDark = tone === 'dark';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BrandCrest
        tone={isDark ? 'ink-badge' : 'cream-badge'}
        size={crestSize}
        decorative
        className="shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-[1.35rem] sm:text-[1.52rem] font-medium tracking-tight transition-colors ${
            isDark
              ? 'text-inverse group-hover:text-terracotta'
              : 'text-ink group-hover:text-terracotta'
          }`}
        >
          Mehandi by Sana
        </span>
        {subtitle ? (
          <span
            className={`mt-1 inline-flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] ${
              isDark ? 'text-inverse/65' : 'text-umber'
            }`}
          >
            <span
              aria-hidden="true"
              className="w-1 h-1 rotate-45 bg-terracotta shrink-0"
            />
            <span>{subtitle}</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}
