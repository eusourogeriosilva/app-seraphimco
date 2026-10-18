// Seraphim.co — gerado de seraphim.tokens.json (DTCG 2025.10). Não edite à mão.
// Primitivos de cor ficam em `privatePrimitives` e fora de `cssVar`: use os semânticos.

export const version = "2.1.0" as const;

/** Tokens públicos (semânticos, de componente e escalas), com valores resolvidos. */
export const tokens = {
  "color-bg-page": "#f0eeec",
  "color-bg-surface": "#ffffff",
  "color-bg-subtle": "#f8f6f4",
  "color-bg-brand": "#6e1423",
  "color-bg-brand-hover": "#560f1c",
  "color-bg-brand-deep": "#3f0a14",
  "color-bg-ink": "#1f1e1e",
  "color-bg-ink-raised": "#2c2a29",
  "color-bg-accent-subtle": "#fbeaee",
  "color-bg-muted": "#e2deda",
  "color-bg-disabled": "#e2deda",
  "color-text-primary": "#1f1e1e",
  "color-text-secondary": "#6b6460",
  "color-text-brand": "#6e1423",
  "color-text-accent": "#a8203f",
  "color-text-on-brand": "#ffffff",
  "color-text-on-dark": "#ffffff",
  "color-text-secondary-on-dark": "#d9d3cf",
  "color-text-accent-on-dark": "#f4c2cc",
  "color-text-disabled": "#6b6460",
  "color-accent-rule": "#a8203f",
  "color-accent-rule-on-dark": "#f4c2cc",
  "color-border-subtle": "#e2deda",
  "color-border-strong": "#1f1e1e",
  "color-border-control": "#8c8581",
  "color-border-brand": "#6e1423",
  "color-border-on-dark": "rgba(255, 255, 255, 0.2)",
  "color-border-frame": "rgba(31, 30, 30, 0.12)",
  "color-focus-ring": "#a8203f",
  "color-focus-ring-on-dark": "#f4c2cc",
  "color-status-success": "#1f6b4a",
  "color-status-success-bg": "#e6f2ec",
  "color-status-warning": "#8a5a00",
  "color-status-warning-bg": "#fbf1dc",
  "color-status-danger": "#b42318",
  "color-status-danger-bg": "#fdecea",
  "color-status-info": "#1d5f8f",
  "color-status-info-bg": "#e5eff7",
  "color-button-primary-bg": "#6e1423",
  "color-button-primary-bg-hover": "#560f1c",
  "color-button-primary-text": "#ffffff",
  "color-button-secondary-border": "#6e1423",
  "color-button-secondary-text": "#6e1423",
  "color-button-inverse-bg": "#ffffff",
  "color-button-inverse-text": "#6e1423",
  "color-button-outline-on-dark": "#ffffff",
  "color-input-bg": "#ffffff",
  "color-input-border": "#8c8581",
  "color-input-border-focus": "#6e1423",
  "color-input-border-error": "#b42318",
  "color-offer-highlight": "#a8203f",
  "color-offer-price": "#6e1423",
  "space-0": "0px",
  "space-4": "4px",
  "space-8": "8px",
  "space-12": "12px",
  "space-16": "16px",
  "space-20": "20px",
  "space-24": "24px",
  "space-32": "32px",
  "space-40": "40px",
  "space-48": "48px",
  "space-56": "56px",
  "space-64": "64px",
  "space-72": "72px",
  "space-80": "80px",
  "space-96": "96px",
  "space-128": "128px",
  "layout-gap-inline": "16px",
  "layout-gap-stack": "24px",
  "layout-section-gap": "56px",
  "layout-section-y": "96px",
  "layout-board-x": "80px",
  "layout-board-y": "72px",
  "layout-page-x": "64px",
  "layout-social-margin": "96px",
  "layout-container": "1200px",
  "radius-none": "0px",
  "radius-control": "2px",
  "radius-pill": "999px",
  "border-width-hairline": "1px",
  "border-width-control": "1.5px",
  "border-width-focus": "2px",
  "border-width-rule": "3px",
  "border-width-focus-offset": "3px",
  "size-control": "48px",
  "size-control-sm": "40px",
  "size-touch-min": "44px",
  "size-icon-sm": "16px",
  "size-icon": "24px",
  "size-icon-lg": "32px",
  "size-rule-width": "64px",
  "breakpoint-sm": "640px",
  "breakpoint-md": "960px",
  "breakpoint-lg": "1280px",
  "font-family-serif": "Newsreader, Georgia, serif",
  "font-family-sans": "'Hanken Grotesk', system-ui, sans-serif",
  "font-weight-regular": 400,
  "font-weight-medium": 500,
  "font-weight-semibold": 600,
  "font-weight-bold": 700,
  "font-size-12": "12px",
  "font-size-14": "14px",
  "font-size-16": "16px",
  "font-size-20": "20px",
  "font-size-22": "22px",
  "font-size-24": "24px",
  "font-size-28": "28px",
  "font-size-32": "32px",
  "font-size-40": "40px",
  "font-size-56": "56px",
  "font-size-72": "72px",
  "font-size-96": "96px",
  "font-size-120": "120px",
  "font-tracking-tight": "-0.015em",
  "font-tracking-normal": "0em",
  "font-tracking-wordmark": "0.05em",
  "font-tracking-caps-sm": "0.08em",
  "font-tracking-caps": "0.14em",
  "font-leading-display": "1.05",
  "font-leading-heading": "1.15",
  "font-leading-ui": "1.2",
  "font-leading-body": "1.6",
  "motion-duration-fast": "120ms",
  "motion-duration-base": "200ms",
  "motion-duration-slow": "320ms",
  "motion-easing-standard": [
    0.2,
    0,
    0,
    1
  ],
  "shadow-overlay": "0px 8px 24px 0px rgba(31, 30, 30, 0.12)"
} as const;

/** Paleta bruta. Só para documentação; o lint de tokens recusa o uso direto. */
export const privatePrimitives = {
  "color-bordo-600": "#8a1a2e",
  "color-bordo-700": "#6e1423",
  "color-bordo-800": "#560f1c",
  "color-bordo-900": "#3f0a14",
  "color-framboesa-500": "#c42b4d",
  "color-framboesa-600": "#a8203f",
  "color-rose-100": "#fbeaee",
  "color-rose-300": "#f4c2cc",
  "color-papel-0": "#ffffff",
  "color-papel-50": "#f8f6f4",
  "color-papel-100": "#f0eeec",
  "color-papel-200": "#e2deda",
  "color-pedra-300": "#d9d3cf",
  "color-pedra-400": "#8c8581",
  "color-pedra-600": "#6b6460",
  "color-grafite-800": "#2c2a29",
  "color-grafite-900": "#1f1e1e",
  "color-alpha-white-20": "rgba(255, 255, 255, 0.2)",
  "color-alpha-ink-12": "rgba(31, 30, 30, 0.12)",
  "color-verde-50": "#e6f2ec",
  "color-verde-700": "#1f6b4a",
  "color-ambar-50": "#fbf1dc",
  "color-ambar-700": "#8a5a00",
  "color-vermelho-50": "#fdecea",
  "color-vermelho-700": "#b42318",
  "color-azul-50": "#e5eff7",
  "color-azul-700": "#1d5f8f"
} as const;

/** Estilos de texto compostos. No CSS, as classes são `.type-<nome>`. */
export const typography = {
  "display-xl": {
    "fontFamily": "Newsreader, Georgia, serif",
    "fontSize": "72px",
    "fontWeight": 400,
    "lineHeight": 1.06,
    "letterSpacing": "-1.08px"
  },
  "display-l": {
    "fontFamily": "Newsreader, Georgia, serif",
    "fontSize": "56px",
    "fontWeight": 400,
    "lineHeight": 1.07,
    "letterSpacing": "-0.84px"
  },
  "h1": {
    "fontFamily": "Newsreader, Georgia, serif",
    "fontSize": "40px",
    "fontWeight": 400,
    "lineHeight": 1.15,
    "letterSpacing": "-0.6px"
  },
  "h2": {
    "fontFamily": "Newsreader, Georgia, serif",
    "fontSize": "32px",
    "fontWeight": 500,
    "lineHeight": 1.19,
    "letterSpacing": "-0.48px"
  },
  "h3": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "22px",
    "fontWeight": 600,
    "lineHeight": 1.36,
    "letterSpacing": "0px"
  },
  "lead": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "20px",
    "fontWeight": 400,
    "lineHeight": 1.5,
    "letterSpacing": "0px"
  },
  "body": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": 1.625,
    "letterSpacing": "0px"
  },
  "small": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": 1.57,
    "letterSpacing": "0px"
  },
  "eyebrow": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "12px",
    "fontWeight": 600,
    "lineHeight": 1.2,
    "letterSpacing": "1.68px",
    "textTransform": "uppercase"
  },
  "social-display": {
    "fontFamily": "Newsreader, Georgia, serif",
    "fontSize": "112px",
    "fontWeight": 400,
    "lineHeight": 1.05,
    "letterSpacing": "-1.68px"
  },
  "social-body": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "40px",
    "fontWeight": 400,
    "lineHeight": 1.4,
    "letterSpacing": "0px"
  },
  "social-eyebrow": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "28px",
    "fontWeight": 600,
    "lineHeight": 1.2,
    "letterSpacing": "3.92px",
    "textTransform": "uppercase"
  },
  "social-footer": {
    "fontFamily": "'Hanken Grotesk', system-ui, sans-serif",
    "fontSize": "24px",
    "fontWeight": 500,
    "lineHeight": 1.4,
    "letterSpacing": "1.92px",
    "textTransform": "uppercase"
  }
} as const;

export type TokenName = keyof typeof tokens;
export type ColorToken = Extract<TokenName, `color-${string}`>;
export type SpaceToken = Extract<TokenName, `space-${string}` | `layout-${string}`>;
export type TypographyName = keyof typeof typography;

/** Referência CSS a um token público: cssVar('color-bg-brand') → 'var(--color-bg-brand)'. */
export function cssVar<T extends TokenName>(name: T): `var(--${T})` {
  return `var(--${name})`;
}

/** Classe CSS de um estilo de texto: typeClass('h1') → 'type-h1'. */
export function typeClass<T extends TypographyName>(name: T): `type-${T}` {
  return `type-${name}`;
}
