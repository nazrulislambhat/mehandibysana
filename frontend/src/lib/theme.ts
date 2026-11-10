export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mbs-theme';

export const THEME_COLOR_BY_MODE: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#071618',
};

/**
 * Blocking pre-paint bootstrap injected in <head> to eliminate any light/dark FOUC.
 * Reads explicit localStorage preference ('mbs-theme'), falling back to OS prefers-color-scheme.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s==='dark'||s==='light'?s:(m?'dark':'light');var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;var c=t==='dark'?'#071618':'#ffffff';var metas=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<metas.length;i++){metas[i].setAttribute('content',c);metas[i].removeAttribute('media');}}catch(e){}})();`;

const listeners = new Set<() => void>();
let globalListenersAttached = false;
let transitionCleanupTimer: number | null = null;

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
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
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme() !== null) return;
      applyThemeToDocument(event.matches ? 'dark' : 'light', true);
      notifyListeners();
    };
    media.addEventListener('change', handleMediaChange);
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
  if (persist && typeof window !== 'undefined') {
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
