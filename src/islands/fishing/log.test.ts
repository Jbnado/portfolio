import { describe, it, expect } from 'vitest';
import { EMPTY_LOG, recordCatch } from './log';

describe('recordCatch', () => {
  it('registra um peixe novo', () => {
    const c = recordCatch(EMPTY_LOG, 'p1', 30);
    expect(c.p1).toEqual({ times: 1, largest: 30 });
  });

  it('guarda o maior quando pesca um maior', () => {
    let c = recordCatch(EMPTY_LOG, 'p1', 30);
    c = recordCatch(c, 'p1', 45);
    expect(c.p1).toEqual({ times: 2, largest: 45 });
  });

  it('mantem o recorde quando pesca um menor', () => {
    let c = recordCatch(EMPTY_LOG, 'p1', 45);
    c = recordCatch(c, 'p1', 12);
    expect(c.p1).toEqual({ times: 2, largest: 45 });
  });

  it('nao muda o caderno recebido', () => {
    const antes = recordCatch(EMPTY_LOG, 'p1', 30);
    const copia = JSON.parse(JSON.stringify(antes));
    recordCatch(antes, 'p1', 99);
    expect(antes).toEqual(copia);
  });

  it('mantem separados peixes diferentes', () => {
    let c = recordCatch(EMPTY_LOG, 'p1', 30);
    c = recordCatch(c, 'p2', 50);
    expect(Object.keys(c).sort()).toEqual(['p1', 'p2']);
  });
});
