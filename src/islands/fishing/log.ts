export type LogEntry = { times: number; largest: number };
export type Log = Record<string, LogEntry>;

export const EMPTY_LOG: Log = Object.freeze({});
export const LOG_KEY = 'fishing:log';

export function recordCatch(
  log: Log,
  fishId: string,
  size: number,
): Log {
  const previous = log[fishId];
  return {
    ...log,
    [fishId]: {
      times: (previous?.times ?? 0) + 1,
      largest: Math.max(previous?.largest ?? 0, size),
    },
  };
}

/**
 * localStorage lanca em janela privada e em contextos sem armazenamento, e
 * pode voltar vazio. Ler e gravar sempre dentro de try/catch, e a pagina tem
 * que renderizar certo com caderno vazio.
 */
export function loadLog(): Log {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as Log) : EMPTY_LOG;
  } catch {
    return EMPTY_LOG;
  }
}

export function saveLog(log: Log): void {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    // Sem armazenamento o jogo segue jogavel, so nao lembra.
  }
}
