export type Registro = { vezes: number; maior: number };
export type Caderno = Record<string, Registro>;

export const CADERNO_VAZIO: Caderno = Object.freeze({});
export const CHAVE_CADERNO = 'pesca:caderno';

export function registrarCaptura(
  caderno: Caderno,
  peixeId: string,
  tamanho: number,
): Caderno {
  const antes = caderno[peixeId];
  return {
    ...caderno,
    [peixeId]: {
      vezes: (antes?.vezes ?? 0) + 1,
      maior: Math.max(antes?.maior ?? 0, tamanho),
    },
  };
}

/**
 * localStorage lanca em janela privada e em contextos sem armazenamento, e
 * pode voltar vazio. Ler e gravar sempre dentro de try/catch, e a pagina tem
 * que renderizar certo com caderno vazio.
 */
export function carregarCaderno(): Caderno {
  try {
    const bruto = localStorage.getItem(CHAVE_CADERNO);
    return bruto ? (JSON.parse(bruto) as Caderno) : CADERNO_VAZIO;
  } catch {
    return CADERNO_VAZIO;
  }
}

export function salvarCaderno(caderno: Caderno): void {
  try {
    localStorage.setItem(CHAVE_CADERNO, JSON.stringify(caderno));
  } catch {
    // Sem armazenamento o jogo segue jogavel, so nao lembra.
  }
}
