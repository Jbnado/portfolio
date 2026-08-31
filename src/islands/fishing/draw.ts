/**
 * Sorteio ponderado generico: cada item pesa `weight` no total, e um item de
 * peso maior tem mais chance de sair. Extraido do `cast()` para poder testar
 * o algoritmo sem precisar simular um lance de pesca inteiro.
 */
export function weightedPick<T extends { weight: number }>(
  pool: T[],
  rnd: () => number,
): T {
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = rnd() * total;
  return pool.find((item) => (roll -= item.weight) < 0) ?? pool[pool.length - 1];
}
