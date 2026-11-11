import React from 'react';

export type HennaPlateId =
  | 'bridal-mandala'
  | 'chinar-silhouette'
  | 'sunburst-medallion'
  | 'lotus-jali'
  | 'mughal-archways'
  | 'hathphool-cuff';

/**
 * Hero Architectural Henna & Botanical Composition
 * Used inside the Mughal-arched hero frame instead of external product photography.
 */
export function HeroHennaComposition({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Botanical henna mandala and cone illustration by Mehandi by Sana"
      className={className}
    >
      {/* Subtle Adaptive Arch Ground & Architectural Hairlines */}
      <rect width="400" height="500" fill="var(--color-plate-ground)" />
      <path
        d="M28 472V188C28 96 105 24 200 24C295 24 372 96 372 188V472"
        stroke="var(--color-border)"
        strokeWidth="1.2"
      />
      <path
        d="M44 472V192C44 109 114 42 200 42C286 42 356 109 356 192V472"
        stroke="var(--color-accent)"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      {/* Crown Lotus Finial Ornament */}
      <g transform="translate(200 66)">
        <path
          d="M0 -14C5 -6 5 2 0 8C-5 2 -5 -6 0 -14Z"
          fill="var(--color-accent)"
        />
        <path
          d="M0 8C-8 4 -14 -2 -14 -9C-7 -6 -3 1 0 8Z"
          stroke="var(--color-text)"
          strokeWidth="1.2"
          fill="var(--color-plate-ground)"
        />
        <path
          d="M0 8C8 4 14 -2 14 -9C7 -6 3 1 0 8Z"
          stroke="var(--color-text)"
          strokeWidth="1.2"
          fill="var(--color-plate-ground)"
        />
        <circle cx="0" cy="-19" r="2" fill="var(--color-text)" />
      </g>

      {/* Grand Central Bridal Mandala */}
      <g transform="translate(200 226)">
        <circle r="116" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 5" />
        <circle r="98" stroke="var(--color-text)" strokeWidth="1.3" />
        <circle r="86" stroke="var(--color-accent)" strokeWidth="0.9" />
        <circle r="54" stroke="var(--color-text)" strokeWidth="1.3" />
        <circle r="24" stroke="var(--color-accent)" strokeWidth="1.4" />
        <circle r="8" fill="var(--color-text)" />
        <circle r="3.2" fill="var(--color-text-inverse)" />

        {/* 12 Outer Petal Arches */}
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = i * 30;
          return (
            <g key={`outer-${deg}`} transform={`rotate(${deg})`}>
              <path
                d="M0 -86C11 -102 12 -114 0 -122C-12 -114 -11 -102 0 -86Z"
                fill={i % 2 === 0 ? 'var(--color-text)' : 'none'}
                stroke="var(--color-text)"
                strokeWidth="1.15"
              />
              <circle cx="0" cy="-129" r="2.2" fill="var(--color-accent)" />
            </g>
          );
        })}

        {/* 8 Inner Scalloped Lotus Petals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const deg = i * 45;
          return (
            <g key={`inner-${deg}`} transform={`rotate(${deg})`}>
              <path
                d="M0 -24C14 -42 13 -64 0 -78C-13 -64 -14 -42 0 -24Z"
                stroke="var(--color-accent)"
                strokeWidth="1.25"
                fill="none"
              />
              <path
                d="M0 -34C6 -45 6 -56 0 -64C-6 -56 -6 -45 0 -34Z"
                fill="var(--color-text)"
              />
              <circle cx="0" cy="-49" r="1.6" fill="var(--color-text-inverse)" />
            </g>
          );
        })}
      </g>

      {/* Symmetrical Flowing Henna Vine Drops Flanking Stem */}
      <path
        d="M200 342V412"
        stroke="var(--color-text)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M200 364C166 360 144 338 136 314C162 318 186 338 200 364Z"
        stroke="var(--color-text)"
        strokeWidth="1.25"
        fill="var(--color-text)"
      />
      <path
        d="M200 364C234 360 256 338 264 314C238 318 214 338 200 364Z"
        stroke="var(--color-text)"
        strokeWidth="1.25"
        fill="var(--color-text)"
      />
      {/* Delicate veining contrasting against filled botanical leaves */}
      <path
        d="M192 358C174 352 158 340 146 325"
        stroke="var(--color-text-inverse)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M208 358C226 352 242 340 254 325"
        stroke="var(--color-text-inverse)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Fine Rolled 0.38mm Henna Cone Poised Beside Lower Scroll */}
      <g transform="translate(262 390) rotate(-38)">
        <path
          d="M0 -42L12 12C12 18 6 22 0 22C-6 22 -12 18 -12 12L0 -42Z"
          fill="var(--color-accent-solid)"
          stroke="var(--color-text)"
          strokeWidth="1.35"
        />
        <path d="M0 -42V-52" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M-8 4H8" stroke="var(--color-accent-ink)" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M-5 -12H5" stroke="var(--color-accent-ink)" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M-12 12C-4 15 4 15 12 12" stroke="var(--color-text)" strokeWidth="1.1" />
      </g>
      <circle cx="226" cy="346" r="2.2" fill="var(--color-accent)" />
      <circle cx="218" cy="354" r="1.4" fill="var(--color-text)" />

      {/* Bottom Grounding Horizon */}
      <path d="M98 412H302" stroke="var(--color-text)" strokeWidth="1.1" />
      <circle cx="98" cy="412" r="2.2" fill="var(--color-accent)" />
      <circle cx="302" cy="412" r="2.2" fill="var(--color-accent)" />
    </svg>
  );
}

/**
 * Unique Atelier Portrait of Sana (Burqa / Modest Veiled Henna Artist)
 * Created specifically for the About page arched frame.
 */
export function SanaBurqaAtelierPortrait({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of Sana wearing a modest black burqa and applying organic henna in Srinagar"
      className={className}
    >
      {/* Adaptive Arch Canvas */}
      <rect width="400" height="500" fill="var(--color-plate-ground)" />

      {/* Double Mughal Archway Frame */}
      <path
        d="M28 482V194C28 96 105 22 200 22C295 22 372 96 372 194V482"
        stroke="var(--color-border)"
        strokeWidth="1.2"
      />
      <path
        d="M44 482V198C44 110 114 40 200 40C286 40 356 110 356 198V482"
        stroke="var(--color-accent)"
        strokeOpacity="0.5"
        strokeWidth="1.1"
        strokeDasharray="4 6"
      />

      {/* Crown Lotus Finial Above Sana */}
      <g transform="translate(200 60)">
        <path
          d="M0 -13C4.5 -5 4.5 2 0 7C-4.5 2 -4.5 -5 0 -13Z"
          fill="var(--color-accent)"
        />
        <path
          d="M0 7C-7 3.5 -12 -2 -12 -8.5C-6 -5.5 -2.5 1 0 7Z"
          stroke="var(--color-text)"
          strokeWidth="1.15"
          fill="var(--color-plate-ground)"
        />
        <path
          d="M0 7C7 3.5 12 -2 12 -8.5C6 -5.5 2.5 1 0 7Z"
          stroke="var(--color-text)"
          strokeWidth="1.15"
          fill="var(--color-plate-ground)"
        />
        <circle cx="0" cy="-17" r="1.8" fill="var(--color-text)" />
      </g>

      {/* Delicate Radiating Botanical Halo */}
      <circle cx="200" cy="176" r="96" stroke="var(--color-border)" strokeWidth="1" />
      <circle
        cx="200"
        cy="176"
        r="112"
        stroke="var(--color-accent)"
        strokeOpacity="0.32"
        strokeWidth="0.9"
        strokeDasharray="2 5"
      />

      {/* Twin Symmetrical Chinar Sprigs Framing Upper Arch */}
      <g transform="translate(78 118) rotate(-22)">
        <path
          d="M0 30C-8 22 -14 10 -10 0C-3 4 0 10 0 16C0 10 3 4 10 0C14 10 8 22 0 30Z"
          stroke="var(--color-text)"
          strokeWidth="1.2"
          fill="var(--color-plate-ground)"
        />
        <path d="M0 30V6" stroke="var(--color-accent)" strokeWidth="1.2" />
      </g>
      <g transform="translate(322 118) rotate(22)">
        <path
          d="M0 30C-8 22 -14 10 -10 0C-3 4 0 10 0 16C0 10 3 4 10 0C14 10 8 22 0 30Z"
          stroke="var(--color-text)"
          strokeWidth="1.2"
          fill="var(--color-plate-ground)"
        />
        <path d="M0 30V6" stroke="var(--color-accent)" strokeWidth="1.2" />
      </g>

      {/* Sculpted Flowing Deep Obsidian/Black Burqa & Draped Shoulders */}
      <path
        d="M200 84C150 84 114 118 106 168C98 214 78 264 62 326C52 364 48 416 48 476H352C352 416 346 364 336 326C320 264 302 214 294 168C286 118 250 84 200 84Z"
        fill="var(--color-burqa-fill)"
        stroke="var(--color-border-strong)"
        strokeOpacity="0.45"
        strokeWidth="1"
      />

      {/* Graceful Ivory/Cream Shoulder Drape Folds */}
      <path
        d="M126 154C112 204 94 268 78 346"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.22"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M274 154C288 204 306 268 322 346"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.22"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Draped Khimar Veil Layer Over Chest */}
      <path
        d="M142 124C160 102 240 102 258 124C272 146 276 196 278 242C258 296 232 322 200 326C168 322 142 296 122 242C124 196 128 146 142 124Z"
        fill="var(--color-burqa-khimar)"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.28"
        strokeWidth="1.15"
      />

      {/* Soft Curved Brow & Eye Opening */}
      <path
        d="M150 154C156 140 184 139 200 141C216 139 244 140 250 154C251 164 245 174 236 177C214 170 186 170 164 177C155 174 149 164 150 154Z"
        fill="#fceee3"
      />

      {/* Soft Undercap Headband Line */}
      <path
        d="M149 149C176 141 224 141 251 149"
        stroke="var(--color-burqa-fill)"
        strokeWidth="1.6"
      />

      {/* Expressive Serene Eyes & Winged Brows */}
      <g>
        {/* Left Eyebrow & Eye */}
        <path
          d="M161 153C169 148 180 148 188 152"
          stroke="#111111"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M163 161C170 156 180 156 187 161C180 165 170 165 163 161Z"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="1.35"
        />
        <circle cx="175" cy="160.5" r="2.8" fill="#111111" />
        <circle cx="176" cy="159.5" r="0.9" fill="#ffffff" />
        <path d="M163 161L159 159" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" />

        {/* Right Eyebrow & Eye */}
        <path
          d="M212 152C220 148 231 148 239 153"
          stroke="#111111"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M213 161C220 156 230 156 237 161C230 165 220 165 213 161Z"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="1.35"
        />
        <circle cx="225" cy="160.5" r="2.8" fill="#111111" />
        <circle cx="226" cy="159.5" r="0.9" fill="#ffffff" />
        <path d="M237 161L241 159" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Draped Niqab Veil with Sculpted Nose Bridge & Embroidered Terracotta Trim */}
      <path
        d="M148 171C174 167 190 164 200 164C210 164 226 167 252 171L265 268C244 298 220 310 200 310C180 310 156 298 135 268L148 171Z"
        fill="var(--color-burqa-fill)"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <path
        d="M150 172C176 168 190 165 200 165C210 165 224 168 250 172"
        stroke="var(--color-burqa-vein)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Delicate Kashmiri Veil Trim Dots */}
      <path
        d="M146 270C172 296 228 296 254 270"
        stroke="var(--color-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="200" cy="292" r="2.2" fill="var(--color-accent)" />
      <circle cx="178" cy="287" r="1.4" fill="var(--color-burqa-vein)" />
      <circle cx="222" cy="287" r="1.4" fill="var(--color-burqa-vein)" />

      {/* Subtle Vertical Drape Line Below Niqab */}
      <path
        d="M200 182C198 214 195 244 192 272"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.16"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Right Foreground Arm in Draped Abaya Sleeve Extending Across Torso */}
      <path
        d="M90 328C124 318 164 334 194 364L168 416C132 396 102 374 78 352Z"
        fill="var(--color-burqa-fill)"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.38"
        strokeWidth="1.2"
      />
      {/* Embroidered Terracotta & Ivory Sleeve Cuff */}
      <path d="M188 358L162 410" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M180 353L154 405"
        stroke="var(--color-burqa-vein)"
        strokeOpacity="0.7"
        strokeWidth="1.1"
        strokeDasharray="2 4"
      />

      {/* Artist Hand Gently Guiding Rolled 0.38mm Henna Cone */}
      <g>
        {/* Tapered Back of Hand & Graceful Fingers */}
        <path
          d="M178 370C190 361 206 362 216 368C226 374 236 378 238 386C230 393 218 394 208 394C198 397 184 398 172 392C168 384 171 376 178 370Z"
          fill="#fceee3"
          stroke="var(--color-burqa-fill)"
          strokeWidth="1.3"
        />
        {/* Forefinger & Thumb Pinching the Cone */}
        <path
          d="M206 368C218 364 230 368 234 374"
          stroke="var(--color-burqa-fill)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Organic Mahogany Henna Tips & Wrist Vine Motif on Artist Hand */}
        <path d="M229 371L235 375" stroke="var(--color-accent)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M231 382L237 385" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="196" cy="380" r="2.2" fill="var(--color-accent)" />
        <path
          d="M184 384C190 379 198 381 206 385"
          stroke="var(--color-accent)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Rolled 0.38mm Terracotta Henna Cone Held at Artistic Angle */}
        <g transform="translate(226 352) rotate(32)">
          <path
            d="M0 -34L10 16C10 21 5 25 0 25C-5 25 -10 21 -10 16L0 -34Z"
            fill="var(--color-accent-solid)"
            stroke="var(--color-burqa-fill)"
            strokeWidth="1.3"
          />
          <path d="M0 -34V-42" stroke="var(--color-burqa-vein)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-7 6H7" stroke="var(--color-accent-ink)" strokeWidth="1.1" />
          <path d="M-4 -9H4" stroke="var(--color-accent-ink)" strokeWidth="1.1" />
        </g>

        {/* Freshly Piped Spiral Henna Paisleys Flowering Beneath Cone */}
        <path
          d="M250 388C272 384 294 396 298 416C302 434 286 448 268 446C254 444 246 432 254 420C260 412 272 414 276 422"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="268" cy="424" r="2.6" fill="var(--color-burqa-vein)" stroke="var(--color-accent)" strokeWidth="1.2" />
        <circle cx="305" cy="402" r="2" fill="var(--color-accent)" />
        <circle cx="311" cy="418" r="1.7" fill="var(--color-burqa-vein)" />
        <circle cx="242" cy="442" r="1.7" fill="var(--color-burqa-vein)" />
      </g>

      {/* Bottom Seal Signature Rule inside Abaya Hem */}
      <path d="M96 458H304" stroke="var(--color-burqa-vein)" strokeOpacity="0.28" strokeWidth="1" />
      <circle cx="200" cy="458" r="3" fill="var(--color-accent)" />
    </svg>
  );
}

/**
 * Six Unique Botanical & Bridal Henna Graphic Plates
 * Used on Homepage GalleryPreviewSection and /gallery Page (no external photography).
 */
export function HennaPlateArtwork({
  plateId,
  className = '',
}: {
  plateId: HennaPlateId;
  className?: string;
}) {
  switch (plateId) {
    case 'bridal-mandala':
      return (
        <svg
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={className}
        >
          <rect width="400" height="500" fill="var(--color-plate-ground)" />
          <rect x="20" y="20" width="360" height="460" rx="14" stroke="var(--color-border)" strokeWidth="1" />
          <g transform="translate(200 245)">
            <circle r="134" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 5" />
            <circle r="112" stroke="var(--color-text)" strokeWidth="1.4" />
            <circle r="76" stroke="var(--color-accent)" strokeWidth="1.2" />
            <circle r="36" stroke="var(--color-text)" strokeWidth="1.4" />
            <circle r="10" fill="var(--color-text)" />
            <circle r="4" fill="var(--color-accent-solid)" />
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5})`}>
                <path
                  d="M0 -76C10 -94 10 -106 0 -114C-10 -106 -10 -94 0 -76Z"
                  fill={i % 2 === 0 ? 'var(--color-text)' : 'none'}
                  stroke="var(--color-text)"
                  strokeWidth="1.15"
                />
                <circle cx="0" cy="-124" r="2.2" fill="var(--color-accent)" />
              </g>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={`in-${i}`} transform={`rotate(${i * 45})`}>
                <path
                  d="M0 -36C12 -50 12 -64 0 -72C-12 -64 -12 -50 0 -36Z"
                  stroke="var(--color-accent)"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </g>
          {/* Wrist & Forearm Lace Border */}
          <path d="M90 426H310M90 438H310" stroke="var(--color-text)" strokeWidth="1.3" />
          <path d="M110 438L130 456L150 438L170 456L190 438L210 456L230 438L250 456L270 438L290 456" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'chinar-silhouette':
      return (
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={className}
        >
          {/* Persistent Dark Archival Plaque Plate */}
          <rect width="400" height="400" fill="var(--color-plaque-surface)" />
          <rect x="20" y="20" width="360" height="360" rx="14" stroke="var(--color-plaque-text)" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="200" cy="200" r="128" stroke="var(--color-plaque-text)" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="4 6" />
          {/* Grand Kashmiri 5-Lobe Chinar Leaf in Warm Ivory + Copper veins */}
          <g transform="translate(200 206)">
            <path
              d="M0 104V62M0 62C-18 68 -56 76 -84 56C-62 42 -42 32 -28 24C-62 12 -98 -8 -110 -34C-80 -34 -56 -26 -38 -16C-44 -58 -24 -102 0 -132C24 -102 44 -58 38 -16C56 -26 80 -34 110 -34C98 -8 62 12 28 24C42 32 62 42 84 56C56 76 18 68 0 62Z"
              stroke="var(--color-plaque-text)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M0 62V-112" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M0 18L-92 -28M0 18L92 -28M0 44L-68 50M0 44L68 50" stroke="var(--color-accent)" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="0" cy="-138" r="3.5" fill="var(--color-accent)" />
            <circle cx="-116" cy="-38" r="2.8" fill="var(--color-accent)" />
            <circle cx="116" cy="-38" r="2.8" fill="var(--color-accent)" />
            <circle cx="-88" cy="60" r="2.5" fill="var(--color-plaque-text)" />
            <circle cx="88" cy="60" r="2.5" fill="var(--color-plaque-text)" />
          </g>
        </svg>
      );

    case 'sunburst-medallion':
      return (
        <svg
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={className}
        >
          <rect width="400" height="500" fill="var(--color-plate-ground)" />
          <rect x="20" y="20" width="360" height="460" rx="14" stroke="var(--color-border)" strokeWidth="1" />
          {/* Radiant Eid Sunburst */}
          <g transform="translate(200 250)">
            <circle r="136" stroke="var(--color-text)" strokeWidth="1.2" />
            <circle r="62" stroke="var(--color-accent)" strokeWidth="1.5" />
            <circle r="22" fill="var(--color-accent-solid)" />
            <circle r="8" fill="var(--color-accent-ink)" />
            {Array.from({ length: 24 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 15})`}>
                <line
                  x1="0"
                  y1="-68"
                  x2="0"
                  y2={i % 2 === 0 ? '-128' : '-104'}
                  stroke={i % 2 === 0 ? 'var(--color-text)' : 'var(--color-accent)'}
                  strokeWidth={i % 2 === 0 ? '1.5' : '1.1'}
                  strokeLinecap="round"
                />
                {i % 2 === 0 ? <circle cx="0" cy="-144" r="2.6" fill="var(--color-text)" /> : null}
              </g>
            ))}
          </g>
          {/* Corner Crescent Filigree */}
          <path d="M168 430C184 442 216 442 232 430" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M168 70C184 58 216 58 232 70" stroke="var(--color-text)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'lotus-jali':
      return (
        <svg
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={className}
        >
          <rect width="400" height="500" fill="var(--color-plate-ground)" />
          <rect x="20" y="20" width="360" height="460" rx="14" stroke="var(--color-border)" strokeWidth="1" />
          {/* Diamond Jali Latticework Frame */}
          <g stroke="var(--color-border)" strokeWidth="1.1">
            <path d="M60 90L340 370M130 90L340 300M200 90L340 230M60 160L310 410M60 230L240 410" />
            <path d="M340 90L60 370M270 90L60 300M200 90L60 230M340 160L90 410M340 230L160 410" />
          </g>
          {/* Floating Crisp Lotus Blossoms */}
          <g transform="translate(200 220)">
            <circle r="86" fill="var(--color-plate-ground)" stroke="var(--color-text)" strokeWidth="1.4" />
            <path
              d="M0 -64C18 -40 22 -10 0 28C-22 -10 -18 -40 0 -64Z"
              fill="var(--color-accent)"
            />
            <path
              d="M0 28C-38 14 -64 -18 -56 -48C-30 -36 -10 -6 0 28Z"
              stroke="var(--color-text)"
              strokeWidth="1.5"
              fill="var(--color-plate-ground)"
            />
            <path
              d="M0 28C38 14 64 -18 56 -48C30 -36 10 -6 0 28Z"
              stroke="var(--color-text)"
              strokeWidth="1.5"
              fill="var(--color-plate-ground)"
            />
            <circle cx="0" cy="-74" r="3" fill="var(--color-text)" />
            <path d="M0 28V64" stroke="var(--color-text)" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'mughal-archways':
      return (
        <svg
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={className}
        >
          {/* Persistent Dark Archival Plaque Royal Archway Plate */}
          <rect width="400" height="500" fill="var(--color-plaque-surface)" />
          {/* Triple Mughal Scalloped Archways in Warm Ivory & Copper */}
          <path
            d="M44 452V210C44 172 64 146 92 126C124 104 166 86 200 52C234 86 276 104 308 126C336 146 356 172 356 210V452H44Z"
            stroke="var(--color-plaque-text)"
            strokeWidth="1.5"
          />
          <path
            d="M72 452V218C72 186 88 164 114 146C140 128 172 112 200 84C228 112 260 128 286 146C312 164 328 186 328 218V452"
            stroke="var(--color-accent)"
            strokeWidth="1.4"
          />
          {/* Chandelier Florals Hanging Down Arch */}
          <path d="M200 84V360" stroke="var(--color-plaque-text)" strokeOpacity="0.6" strokeWidth="1.2" />
          {[140, 210, 280, 350].map((y, idx) => (
            <g key={y} transform={`translate(200 ${y})`}>
              <circle r={24 - idx * 3} stroke="var(--color-accent)" strokeWidth="1.3" fill="var(--color-plaque-surface)" />
              <circle r={10 - idx} fill="var(--color-plaque-text)" />
              <circle r="3" fill="var(--color-accent)" />
            </g>
          ))}
          <path d="M84 416H316" stroke="var(--color-plaque-text)" strokeOpacity="0.35" strokeWidth="1.1" />
        </svg>
      );

    case 'hathphool-cuff':
      return (
        <svg
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={className}
        >
          <rect width="400" height="500" fill="var(--color-plate-ground)" />
          <rect x="20" y="20" width="360" height="460" rx="14" stroke="var(--color-border)" strokeWidth="1" />
          {/* Wrist Jewelry Cuff Bands */}
          <path d="M82 372H318M82 390H318M82 408H318" stroke="var(--color-text)" strokeWidth="1.4" />
          {Array.from({ length: 9 }).map((_, idx) => (
            <circle
              key={`cuff-${idx}`}
              cx={100 + idx * 25}
              cy="390"
              r="3.2"
              fill={idx % 2 === 0 ? 'var(--color-accent)' : 'var(--color-text)'}
            />
          ))}
          {/* Draping Beaded Chains Up Toward Central Medallion & Ring Vines */}
          <path
            d="M110 372C128 310 162 276 200 248C238 276 272 310 290 372"
            stroke="var(--color-accent)"
            strokeWidth="1.4"
            strokeDasharray="4 5"
          />
          <path
            d="M200 248V122M138 154L200 248L262 154"
            stroke="var(--color-text)"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          {/* Central Diamond Hathphool Brooch */}
          <g transform="translate(200 248)">
            <rect
              x="-24"
              y="-24"
              width="48"
              height="48"
              transform="rotate(45)"
              fill="var(--color-plaque-surface)"
              stroke="var(--color-accent)"
              strokeWidth="1.6"
            />
            <circle r="10" fill="var(--color-plaque-text)" />
            <circle r="4" fill="var(--color-accent)" />
          </g>
          {/* Three Finger Rings at Top */}
          <ellipse cx="138" cy="142" rx="14" ry="18" stroke="var(--color-text)" strokeWidth="1.4" />
          <ellipse cx="200" cy="112" rx="16" ry="20" stroke="var(--color-accent)" strokeWidth="1.6" />
          <ellipse cx="262" cy="142" rx="14" ry="18" stroke="var(--color-text)" strokeWidth="1.4" />
          <circle cx="200" cy="112" r="4" fill="var(--color-text)" />
        </svg>
      );
  }
}
