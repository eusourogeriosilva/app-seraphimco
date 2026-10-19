// Exemplo de consumo em TypeScript: nomes tipados, sem string solta.
import { cssVar, tokens, typeClass, type ColorToken } from '../tokens/dist/tokens.ts';

export const ctaStyle = {
  background: cssVar('color-button-primary-light-bg'),
  color: cssVar('color-button-primary-light-text'),
  borderRadius: cssVar('radius-control'),
} as const;

export const headingClass = typeClass('display-l');

/** Valor resolvido, para canvas, gráficos ou e-mail: tokens['color-bg-brand'] === '#6e1423'. */
export function resolvedColor(name: ColorToken): string {
  return tokens[name];
}

// cssVar('color-bordo-700') não compila: primitivos de cor não estão em TokenName.
