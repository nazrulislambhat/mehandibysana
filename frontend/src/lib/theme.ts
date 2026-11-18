export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mbs-theme';

export const THEME_COLOR_BY_MODE: Record<Theme, string> = {
  light: '#E7DDCF',
  dark: '#181818',
};

/**
 * Blocking pre-paint bootstrap injected in <head> to eliminate any light/dark FOUC.
 * - On mobile (< 768px): strictly follows OS device prefers-color-scheme.
 * - On desktop: reads explicit localStorage preference ('mbs-theme'), falling back to OS prefers-color-scheme.
 * Synchronizes document theme, colorScheme, and <meta name="theme-color"> for notification/browser bars.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var isMob=window.matchMedia&&window.matchMedia('(max-width: 767px)').matches;var k='${THEME_STORAGE_KEY}';var s=isMob?null:localStorage.getItem(k);var t=(!isMob&&(s==='dark'||s==='light'))?s:(m?'dark':'light');var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;var c=t==='dark'?'#181818':'#E7DDCF';var metas=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<metas.length;i++){metas[i].setAttribute('content',c);metas[i].removeAttribute('media');}}catch(e){}})();`;

const listeners = new Set<() => void>();
let globalListenersAttached = false;
let transitionCleanupTimer: number | null = null;

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
}

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  // Mobile devices follow system setting automatically, ignoring manual override
  if (isMobileDevice()) return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore storage access errors in private browsing / sandboxed contexts.
  }
  return null;
}

export function resolvePreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  // Mobile strictly follows device system setting
  if (isMobileDevice()) {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // Desktop checks manual preference first, then falls back to system setting
  const stored = readStoredTheme();
  if (stored) return stored;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyThemeToDocument(theme: Theme, animate = false): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (
    animate &&
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    root.classList.add('mbs-theme-transition');
    if (transitionCleanupTimer !== null) {
      window.clearTimeout(transitionCleanupTimer);
    }
    transitionCleanupTimer = window.setTimeout(() => {
      root.classList.remove('mbs-theme-transition');
      transitionCleanupTimer = null;
    }, 320);
  }

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  // Dynamically update mobile browser address bar and notification bar theme color
  const themeColor = THEME_COLOR_BY_MODE[theme];
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((meta) => {
    meta.setAttribute('content', themeColor);
    meta.removeAttribute('media');
  });
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function ensureGlobalListeners(): void {
  if (globalListenersAttached || typeof window === 'undefined') return;
  globalListenersAttached = true;

  // Ensure <meta name="theme-color"> & attributes reflect the resolved theme
  applyThemeToDocument(resolvePreferredTheme(), false);

  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const next: Theme =
      event.newValue === 'dark' || event.newValue === 'light'
        ? event.newValue
        : resolvePreferredTheme();
    applyThemeToDocument(next, true);
    notifyListeners();
  });

  if (window.matchMedia) {
    // Listen for device system setting changes (e.g. night mode scheduled change on mobile)
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (isMobileDevice() || readStoredTheme() === null) {
        applyThemeToDocument(event.matches ? 'dark' : 'light', true);
        notifyListeners();
      }
    };
    media.addEventListener('change', handleMediaChange);

    // Listen for viewport breakpoint transition between mobile & desktop
    const mobileMedia = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = () => {
      const next = resolvePreferredTheme();
      applyThemeToDocument(next, true);
      notifyListeners();
    };
    mobileMedia.addEventListener('change', handleViewportChange);
  }
}

export function getThemeSnapshot(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function getServerThemeSnapshot(): Theme {
  return 'light';
}

export function subscribeTheme(listener: () => void): () => void {
  ensureGlobalListeners();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setTheme(next: Theme, options: { persist?: boolean; animate?: boolean } = {}): void {
  const { persist = true, animate = true } = options;
  if (persist && typeof window !== 'undefined' && !isMobileDevice()) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage write errors.
    }
  }
  applyThemeToDocument(next, animate);
  notifyListeners();
}

export function toggleTheme(): Theme {
  const current = getThemeSnapshot();
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  setTheme(next, { persist: true, animate: true });
  return next;
}
