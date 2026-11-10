'use client';

import React, { useState } from 'react';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';

export interface StainStage {
  id: 'apply' | 'six-hours' | 'one-day';
  step: string;
  timeLabel: string;
  title: string;
  shadeName: string;
  swatchHex: string;
  secondaryHex: string;
  pasteOverlay: boolean;
  summary: string;
  scienceNote: string;
  careTip: string;
}

interface SkinToneOption {
  id: string;
  label: string;
  baseFill: string;
  shadowStroke: string;
  palmCrease: string;
}

const SKIN_TONES: SkinToneOption[] = [
  {
    id: 'ivory',
    label: 'Fair Ivory',
    baseFill: '#F4E1D2',
    shadowStroke: '#D9BCA5',
    palmCrease: '#E2C6B0',
  },
  {
    id: 'wheatish',
    label: 'Warm Wheatish',
    baseFill: '#E6C5A7',
    shadowStroke: '#C59E7B',
    palmCrease: '#D3AE8D',
  },
  {
    id: 'olive',
    label: 'Medium Olive',
    baseFill: '#CFA37E',
    shadowStroke: '#AA7D58',
    palmCrease: '#BC8E68',
  },
  {
    id: 'caramel',
    label: 'Deep Caramel',
    baseFill: '#A3724F',
    shadowStroke: '#7B5032',
    palmCrease: '#8E5F3E',
  },
];

const STAIN_STAGES: StainStage[] = [
  {
    id: 'apply',
    step: '01',
    timeLabel: 'On Application · 0 hrs',
    title: 'Fresh Olive Paste & Bright Saffron Base',
    shadeName: 'Botanical Olive Paste → Tangerine Base',
    swatchHex: '#3E4B2C',
    secondaryHex: '#E07826',
    pasteOverlay: true,
    summary:
      'Piped fresh from a 0.38mm cone, Sana’s triple-sifted paste sits as a glossy dark-olive relief on the skin. When gently flaked off after drying, the initial stain is a bright saffron-orange.',
    scienceNote:
      '100% pure Sojat lawsone contains zero PPD or black chemical dyes—an initial bright tangerine stain is the hallmark of authentic, chemical-free henna.',
    careTip:
      'Keep paste on for 4–6 hours. Mist with lemon-sugar sealant and scrape off with oil or balm—never wash with water.',
  },
  {
    id: 'six-hours',
    step: '02',
    timeLabel: 'After 6 Hours · 6 hrs',
    title: 'Warm Copper & Burnt Terracotta',
    shadeName: 'Oxidizing Copper-Terracotta',
    swatchHex: '#B2461D',
    secondaryHex: '#943514',
    pasteOverlay: false,
    summary:
      'Six hours after paste removal, exposure to air and natural body warmth deepens the orange base into a rich copper-terracotta with sharp floral and mandala definition.',
    scienceNote:
      'Lawsone pigment molecules bind to skin keratin and steadily oxidize through warm amber and burnt sienna tones.',
    careTip:
      'Avoid soap, sanitizer, and water immersion. Coat palms with Sana’s Stain Darkening Balm before sleeping.',
  },
  {
    id: 'one-day',
    step: '03',
    timeLabel: 'After 1 Day · 24–48 hrs',
    title: 'Deep Bridal Mahogany & Espresso',
    shadeName: 'Peak Bridal Mahogany',
    swatchHex: '#4E190F',
    secondaryHex: '#360F08',
    pasteOverlay: false,
    summary:
      'At 24 to 48 hours, oxidation reaches full maturity—transforming into a velvety, high-contrast bridal mahogany-chestnut stain that holds cleanly for 10 to 14 days.',
    scienceNote:
      'Full epidermal oxidation locks dense mahogany pigment into the stratum corneum for long-lasting bridal richness.',
    careTip:
      'Moisturize daily with botanical balm or sweet almond oil to preserve crisp line clarity and slow natural exfoliation.',
  },
];

export interface StainProgressionGuideProps {
  compact?: boolean;
}

export function StainProgressionGuide({ compact = false }: StainProgressionGuideProps) {
  const [activeIndex, setActiveIndex] = useState<number>(2);
  const [skinToneId, setSkinToneId] = useState<string>('wheatish');

  const activeStage = STAIN_STAGES[activeIndex] ?? STAIN_STAGES[2];
  const activeSkin =
    SKIN_TONES.find((tone) => tone.id === skinToneId) ?? SKIN_TONES[1];

  // Primary motif stroke/fill reflects current stage
  const motifPrimaryColor = activeStage.swatchHex;
  const motifAccentColor = activeStage.secondaryHex;

  return (
    <section
      aria-labelledby="stain-guide-heading"
      className={`border-b border-hairline bg-canvas ${
        compact ? 'rounded-2xl border p-6 sm:p-8 lg:p-10' : ''
      }`}
    >
      <div className={compact ? '' : 'editorial-container py-16 md:py-24'}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta mb-3">
              Natural Oxidation Timeline
            </p>
            <h2
              id="stain-guide-heading"
              className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight"
            >
              How your organic henna stain develops
            </h2>
            <p className="text-sm sm:text-base text-umber leading-relaxed mt-3">
              Because our cones are 100% chemical-free, your stain evolves naturally from fresh olive paste and saffron-orange into deep bridal mahogany over 24 hours.
            </p>
          </div>

          {/* Skin Undertone Switcher */}
          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-umber">
              Preview on Skin Tone
            </span>
            <div
              role="group"
              aria-label="Select skin undertone preview"
              className="inline-flex flex-wrap items-center gap-2 rounded-full border border-divider bg-paper p-1.5"
            >
              {SKIN_TONES.map((tone) => {
                const isSelected = tone.id === skinToneId;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSkinToneId(tone.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-inverse'
                        : 'text-ink/80 hover:text-terracotta hover:bg-linen'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: tone.baseFill }}
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    />
                    <span>{tone.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left 5 Columns: Live Botanical Palm & Mandala Stain Canvas */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-divider bg-paper p-6 sm:p-8 shadow-sm overflow-hidden">
              {/* Top Stage Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-linen px-3 py-1 text-xs font-medium text-ink">
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: motifPrimaryColor }}
                    className="w-2.5 h-2.5 rounded-full transition-colors duration-500"
                  />
                  <span>{activeStage.timeLabel}</span>
                </span>
                <BotanicalSprig className="w-11 h-4" />
              </div>

              {/* Interactive Anatomical Palm + Bridal Mandala SVG */}
              <div className="relative mx-auto max-w-[310px] py-2">
                <svg
                  viewBox="0 0 320 370"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label={`Henna stain simulation at ${activeStage.timeLabel}: ${activeStage.shadeName}`}
                  className="w-full h-auto drop-shadow-[0_10px_22px_rgba(17,17,17,0.10)]"
                >
                  {/* Subtle botanical halo behind palm */}
                  <circle
                    cx="160"
                    cy="195"
                    r="138"
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                  />

                  {/* Stylized Graceful Palm & Wrist Silhouette */}
                  <path
                    d="M114 352V282C96 268 78 242 66 208C61 194 69 183 80 186C90 189 98 202 105 216V116C105 106 119 106 119 116V188H126V86C126 75 142 75 142 86V184H150V74C150 63 166 63 166 74V184H174V88C174 77 190 77 190 88V194H197V118C197 108 212 108 212 118V224C212 252 198 272 184 284V352H114Z"
                    style={{
                      fill: activeSkin.baseFill,
                      stroke: activeSkin.shadowStroke,
                      transition: 'fill 420ms ease, stroke 420ms ease',
                    }}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />

                  {/* Subtle natural palm creases */}
                  <path
                    d="M114 232C136 226 164 230 188 244"
                    style={{ stroke: activeSkin.palmCrease, transition: 'stroke 420ms ease' }}
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <path
                    d="M122 254C144 252 166 258 182 268"
                    style={{ stroke: activeSkin.palmCrease, transition: 'stroke 420ms ease' }}
                    strokeWidth="1"
                    strokeLinecap="round"
                  />

                  {/* Henna Mandala & Kashmiri Vine Artwork */}
                  <g
                    style={{
                      color: motifPrimaryColor,
                      transition: 'color 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    {/* Central Palm Mandala */}
                    <circle
                      cx="154"
                      cy="228"
                      r="26"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '2.4' : '1.7'}
                    />
                    <circle
                      cx="154"
                      cy="228"
                      r="17"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '2' : '1.4'}
                      strokeDasharray="2.5 3.5"
                    />
                    <circle
                      cx="154"
                      cy="228"
                      r="8"
                      fill="currentColor"
                      fillOpacity={activeStage.pasteOverlay ? '0.92' : '0.82'}
                    />

                    {/* 8 Mandala Lotus Petals */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <g key={angle} transform={`rotate(${angle} 154 228)`}>
                        <path
                          d="M154 202C149 194 150 187 154 183C158 187 159 194 154 202Z"
                          fill="currentColor"
                          fillOpacity={activeStage.pasteOverlay ? '0.9' : '0.78'}
                        />
                        <circle
                          cx="154"
                          cy="177"
                          r="1.7"
                          fill={motifAccentColor}
                        />
                      </g>
                    ))}

                    {/* Wrist Bracelet Cuff & Paisley Drops */}
                    <path
                      d="M116 296H182M116 306H182"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '2.2' : '1.6'}
                      strokeLinecap="round"
                    />
                    <path
                      d="M124 316L134 328L144 316L154 328L164 316L174 328"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '2' : '1.4'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="134" cy="336" r="2.2" fill="currentColor" />
                    <circle cx="154" cy="336" r="2.2" fill="currentColor" />
                    <circle cx="174" cy="336" r="2.2" fill="currentColor" />

                    {/* Finger Botanical Trails & Tip Caps */}
                    {/* Index finger */}
                    <path
                      d="M112 178V134"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '1.9' : '1.3'}
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                    <path
                      d="M106 123C106 114 118 114 118 123V128H106V123Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />

                    {/* Middle finger */}
                    <path
                      d="M134 172V112"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '1.9' : '1.3'}
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                    <path
                      d="M127 98C127 88 141 88 141 98V105H127V98Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />

                    {/* Ring finger */}
                    <path
                      d="M158 172V100"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '1.9' : '1.3'}
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                    <path
                      d="M151 86C151 76 165 76 165 86V93H151V86Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />

                    {/* Fourth finger */}
                    <path
                      d="M182 178V114"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '1.9' : '1.3'}
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                    <path
                      d="M175 100C175 90 189 90 189 100V107H175V100Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />

                    {/* Little finger */}
                    <path
                      d="M204 186V140"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '1.9' : '1.3'}
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                    <path
                      d="M198 128C198 119 211 119 211 128V134H198V128Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />

                    {/* Thumb vine */}
                    <path
                      d="M95 218C88 208 82 199 76 194"
                      stroke="currentColor"
                      strokeWidth={activeStage.pasteOverlay ? '2' : '1.4'}
                      strokeLinecap="round"
                    />
                    <circle cx="74" cy="191" r="3.2" fill="currentColor" />
                  </g>

                  {/* On Stage 01 (Fresh Application), show subtle 3D paste highlight + saffron stain reveal badge */}
                  {activeStage.pasteOverlay ? (
                    <g>
                      <circle
                        cx="154"
                        cy="228"
                        r="26"
                        stroke="#7B8E5E"
                        strokeWidth="0.8"
                        strokeDasharray="6 6"
                      />
                    </g>
                  ) : null}
                </svg>
              </div>

              {/* Bottom Pigment Swatch Readout */}
              <div className="mt-3 rounded-xl border border-hairline bg-linen/75 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: activeStage.swatchHex }}
                      className="w-7 h-7 rounded-full border-2 border-paper shadow-xs transition-colors duration-500"
                    />
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: activeStage.secondaryHex }}
                      className="w-7 h-7 rounded-full border-2 border-paper shadow-xs transition-colors duration-500"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">
                      {activeStage.shadeName}
                    </p>
                    <p className="text-[11px] text-umber">
                      {activeStage.pasteOverlay
                        ? 'Paste relief shown · Saffron stain underneath'
                        : '100% Natural Lawsone Oxidation'}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[11px] uppercase text-umber shrink-0">
                  {activeStage.swatchHex}
                </span>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Interactive 3-Stage Selector & Care Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stage Selector Buttons (01 Apply · 02 6 Hours · 03 After 1 Day) */}
            <div
              role="tablist"
              aria-label="Henna stain timeline stages"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {STAIN_STAGES.map((stage, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveIndex(idx)}
                    className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-terracotta bg-paper shadow-sm ring-1 ring-terracotta/25'
                        : 'border-hairline bg-paper/65 hover:bg-paper hover:border-terracotta/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-serif text-xs italic text-terracotta">
                        Stage {stage.step}
                      </span>
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: stage.swatchHex }}
                        className="w-4 h-4 rounded-full border border-black/15"
                      />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink">
                      {stage.id === 'apply'
                        ? 'On Application'
                        : stage.id === 'six-hours'
                          ? 'After 6 Hours'
                          : 'After 1 Day'}
                    </p>
                    <p className="text-[11px] text-umber mt-0.5">
                      {stage.id === 'apply'
                        ? '0 hrs · Olive Paste / Saffron'
                        : stage.id === 'six-hours'
                          ? '6 hrs · Warm Copper'
                          : '24+ hrs · Deep Mahogany'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Timeline Range Scrubber */}
            <div className="rounded-xl border border-hairline bg-paper/80 px-5 py-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <label
                  htmlFor="stain-timeline-slider"
                  className="font-medium text-ink"
                >
                  Scrub Oxidation Timeline
                </label>
                <span className="font-medium text-terracotta">
                  {activeStage.timeLabel}
                </span>
              </div>
              <input
                id="stain-timeline-slider"
                type="range"
                min={0}
                max={2}
                step={1}
                value={activeIndex}
                onChange={(e) => setActiveIndex(Number(e.target.value))}
                className="w-full accent-[#d9541e] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-umber mt-1">
                <span>0 hrs (Apply)</span>
                <span>6 hrs (Copper)</span>
                <span>24+ hrs (Mahogany)</span>
              </div>
            </div>

            {/* Active Stage Detailed Editorial Card */}
            <div
              role="tabpanel"
              className="rounded-2xl border border-divider bg-paper p-6 sm:p-8 space-y-5"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-terracotta mb-1.5">
                  {activeStage.timeLabel}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink leading-snug">
                  {activeStage.title}
                </h3>
                <p className="text-sm sm:text-base text-ink/90 leading-relaxed mt-3">
                  {activeStage.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-hairline">
                <div className="rounded-xl bg-linen/65 p-4 border border-hairline/80">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink mb-1">
                    Why It Looks Like This
                  </p>
                  <p className="text-xs text-umber leading-relaxed">
                    {activeStage.scienceNote}
                  </p>
                </div>

                <div className="rounded-xl bg-paper p-4 border border-terracotta/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta mb-1">
                    Sana’s Aftercare Ritual
                  </p>
                  <p className="text-xs text-ink leading-relaxed">
                    {activeStage.careTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
