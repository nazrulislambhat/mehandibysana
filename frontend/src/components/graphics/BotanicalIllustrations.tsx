import React from 'react';

export function BotanicalHeroStudy({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Outer hairline arch */}
      <path
        d="M36 414V180C36 100.471 100.471 36 180 36C259.529 36 324 100.471 324 180V414"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <path
        d="M52 414V184C52 113.308 109.308 56 180 56C250.692 56 308 113.308 308 184V414"
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* Lotus / henna crown dotwork */}
      <circle cx="180" cy="86" r="4" stroke="var(--color-accent)" strokeWidth="1.2" />
      <circle cx="180" cy="86" r="1.5" fill="var(--color-accent)" />
      <path
        d="M180 100C165 112 152 128 152 146C152 162 165 174 180 184C195 174 208 162 208 146C208 128 195 112 180 100Z"
        stroke="var(--color-text)"
        strokeWidth="1.15"
      />
      <path
        d="M180 112C171 122 165 133 165 145C165 156 172 165 180 171C188 165 195 156 195 145C195 133 189 122 180 112Z"
        stroke="var(--color-accent)"
        strokeWidth="1"
      />

      {/* Central botanical stem */}
      <path
        d="M180 184V352"
        stroke="var(--color-text)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Paired henna leaves along stem */}
      <path
        d="M180 218C156 212 138 194 134 172C156 174 174 192 180 218Z"
        stroke="var(--color-text)"
        strokeWidth="1.15"
      />
      <path
        d="M180 218C204 212 222 194 226 172C204 174 186 192 180 218Z"
        stroke="var(--color-text)"
        strokeWidth="1.15"
      />
      <path
        d="M180 264C149 258 125 236 120 208C148 212 172 234 180 264Z"
        stroke="var(--color-text)"
        strokeWidth="1.15"
      />
      <path
        d="M180 264C211 258 235 236 240 208C212 212 188 234 180 264Z"
        stroke="var(--color-text)"
        strokeWidth="1.15"
      />
      <path
        d="M180 310C153 305 134 286 130 262C154 266 173 284 180 310Z"
        stroke="var(--color-accent)"
        strokeWidth="1.15"
      />
      <path
        d="M180 310C207 305 226 286 230 262C206 266 187 284 180 310Z"
        stroke="var(--color-accent)"
        strokeWidth="1.15"
      />

      {/* Tiny botanical berries/dots */}
      <circle cx="144" cy="240" r="2.2" fill="var(--color-accent)" />
      <circle cx="216" cy="240" r="2.2" fill="var(--color-accent)" />
      <circle cx="152" cy="196" r="1.8" fill="var(--color-text-muted)" />
      <circle cx="208" cy="196" r="1.8" fill="var(--color-text-muted)" />

      {/* Grounding crescent & horizontal rule */}
      <path
        d="M110 352H250"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <path
        d="M148 368C164 380 196 380 212 368"
        stroke="var(--color-accent)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <circle cx="180" cy="390" r="2" fill="var(--color-text)" />
    </svg>
  );
}

export function BotanicalSprig({ className = '' }: { className?: string }) {
  return (
    <svg
      width="56"
      height="20"
      viewBox="0 0 56 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 10H52" stroke="var(--color-border)" strokeWidth="1" />
      <path
        d="M28 10C24 6 19 4 15 4C15 8 19 11 28 10Z"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
      />
      <path
        d="M28 10C32 6 37 4 41 4C41 8 37 11 28 10Z"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
      />
      <circle cx="28" cy="10" r="2" fill="var(--color-accent)" />
    </svg>
  );
}

export function BotanicalDivider() {
  return (
    <div
      className="editorial-container flex items-center justify-center py-2"
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-hairline" />
      <BotanicalSprig className="mx-4 shrink-0" />
      <div className="h-px flex-1 bg-hairline" />
    </div>
  );
}

export function ServiceMotifIcon({
  variant,
  className = '',
}: {
  variant: 'bridal' | 'events' | 'botanical';
  className?: string;
}) {
  if (variant === 'bridal') {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <circle cx="16" cy="16" r="12" stroke="var(--color-border-strong)" strokeWidth="1.2" />
        <path
          d="M16 7C13.5 10.5 12 13 12 16C12 18.2 13.8 20 16 20C18.2 20 20 18.2 20 16C20 13 18.5 10.5 16 7Z"
          stroke="var(--color-accent)"
          strokeWidth="1.35"
        />
        <circle cx="16" cy="24" r="1.5" fill="var(--color-text)" />
      </svg>
    );
  }

  if (variant === 'events') {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <path
          d="M16 4V28M4 16H28"
          stroke="var(--color-border-strong)"
          strokeWidth="1"
        />
        <rect
          x="10.5"
          y="10.5"
          width="11"
          height="11"
          transform="rotate(45 16 16)"
          stroke="var(--color-accent)"
          strokeWidth="1.35"
        />
        <circle cx="16" cy="16" r="2.2" fill="var(--color-text)" />
      </svg>
    );
  }

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M16 27C16 27 8 22 8 13.5C8 9.2 11.5 6 16 6C20.5 6 24 9.2 24 13.5C24 22 16 27 16 27Z"
        stroke="var(--color-accent)"
        strokeWidth="1.35"
      />
      <path d="M16 9V25" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 15L20 12.5M16 19L12 16.5" stroke="var(--color-text)" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

export function BotanicalCraftIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="16"
        y="16"
        width="288"
        height="228"
        rx="8"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      {/* Stone bowl / mortar outline */}
      <path
        d="M96 144H224C224 176 198 196 160 196C122 196 96 176 96 144Z"
        stroke="var(--color-text)"
        strokeWidth="1.35"
      />
      <path d="M132 196H188" stroke="var(--color-text)" strokeWidth="1.35" strokeLinecap="round" />
      {/* Pestle */}
      <path
        d="M196 86L164 144"
        stroke="var(--color-accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Botanical leaves rising behind bowl */}
      <path
        d="M142 144C136 118 118 98 98 94C102 116 118 136 142 144Z"
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      <path
        d="M154 144C152 110 144 82 134 66C150 76 162 104 154 144Z"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
      />
      <circle cx="236" cy="96" r="3" stroke="var(--color-border-strong)" strokeWidth="1.2" />
      <circle cx="88" cy="180" r="2" fill="var(--color-accent)" />
    </svg>
  );
}

export function BotanicalPortfolioStudy({
  variant,
  className = '',
}: {
  variant: 'mandala' | 'leaf' | 'paisley';
  className?: string;
}) {
  if (variant === 'mandala') {
    return (
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <circle cx="120" cy="120" r="78" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="120" cy="120" r="52" stroke="var(--color-text)" strokeWidth="1.15" />
        <circle cx="120" cy="120" r="18" stroke="var(--color-accent)" strokeWidth="1.2" />
        <circle cx="120" cy="120" r="4" fill="var(--color-accent)" />
        <path
          d="M120 42V68M120 172V198M42 120H68M172 120H198"
          stroke="var(--color-text)"
          strokeWidth="1.1"
        />
        <path
          d="M120 68C132 84 132 98 120 102C108 98 108 84 120 68Z"
          stroke="var(--color-accent)"
          strokeWidth="1.1"
        />
        <path
          d="M120 172C132 156 132 142 120 138C108 142 108 156 120 172Z"
          stroke="var(--color-accent)"
          strokeWidth="1.1"
        />
        <path
          d="M68 120C84 108 98 108 102 120C98 132 84 132 68 120Z"
          stroke="var(--color-text)"
          strokeWidth="1.1"
        />
        <path
          d="M172 120C156 108 142 108 138 120C142 132 156 132 172 120Z"
          stroke="var(--color-text)"
          strokeWidth="1.1"
        />
      </svg>
    );
  }

  if (variant === 'paisley') {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <path
          d="M108 38C138 42 156 76 146 112C136 148 102 164 74 152C52 142 46 116 62 96C76 78 96 78 102 62C106 50 96 42 108 38Z"
          stroke="var(--color-text)"
          strokeWidth="1.25"
        />
        <circle cx="96" cy="116" r="14" stroke="var(--color-accent)" strokeWidth="1.15" />
        <circle cx="96" cy="116" r="3" fill="var(--color-accent)" />
        <circle cx="128" cy="70" r="2.2" fill="var(--color-text-muted)" />
        <circle cx="136" cy="84" r="2.2" fill="var(--color-text-muted)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M56 150C88 118 118 82 144 48" stroke="var(--color-text)" strokeWidth="1.25" strokeLinecap="round" />
      <path
        d="M92 114C76 104 68 88 70 72C86 76 96 92 92 114Z"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
      />
      <path
        d="M112 90C128 96 142 90 148 76C134 72 118 76 112 90Z"
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      <circle cx="144" cy="48" r="3" fill="var(--color-accent)" />
    </svg>
  );
}

export function BotanicalEmptyCartGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="48" cy="48" r="42" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 4" />
      <path
        d="M32 34L28 66H68L64 34H32Z"
        stroke="var(--color-text)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M39 34V29C39 24.0294 43.0294 20 48 20C52.9706 20 57 24.0294 57 29V34"
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <path
        d="M48 45C44 49 44 55 48 58C52 55 52 49 48 45Z"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
      />
    </svg>
  );
}

