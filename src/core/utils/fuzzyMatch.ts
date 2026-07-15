// ============================================================================
// Coincidencia aproximada de texto (distancia de Levenshtein) — se usa para
// validar que un implemento escrito a mano por el proveedor sea uno real y,
// si tiene un error de tipeo, sugerir la palabra correcta de la lista.
// ============================================================================

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export interface FuzzyMatch<T extends string = string> {
  match: T;
  distance: number;
}

// Devuelve la opción más parecida a `input` dentro de `options` (ignora
// mayúsculas/espacios extra) junto con la distancia de edición.
export function closestMatch<T extends string>(input: string, options: readonly T[]): FuzzyMatch<T> | null {
  const target = input.trim().toLowerCase();
  if (!target || options.length === 0) return null;
  let best: FuzzyMatch<T> | null = null;
  for (const opt of options) {
    const d = levenshtein(target, opt.trim().toLowerCase());
    if (!best || d < best.distance) best = { match: opt, distance: d };
  }
  return best;
}

// Un match se considera un "error de tipeo razonable" (y no una palabra
// distinta) si la distancia de edición es pequeña en relación al largo.
export function isTypoOf(distance: number, wordLength: number): boolean {
  return distance > 0 && distance <= Math.max(2, Math.floor(wordLength * 0.34));
}
