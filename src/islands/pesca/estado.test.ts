import { describe, it, expect } from 'vitest';
import { CADERNO_VAZIO, registrarCaptura } from './estado';

describe('registrarCaptura', () => {
  it('registra um peixe novo', () => {
    const c = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    expect(c.p1).toEqual({ vezes: 1, maior: 30 });
  });

  it('guarda o maior quando pesca um maior', () => {
    let c = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    c = registrarCaptura(c, 'p1', 45);
    expect(c.p1).toEqual({ vezes: 2, maior: 45 });
  });

  it('mantem o recorde quando pesca um menor', () => {
    let c = registrarCaptura(CADERNO_VAZIO, 'p1', 45);
    c = registrarCaptura(c, 'p1', 12);
    expect(c.p1).toEqual({ vezes: 2, maior: 45 });
  });

  it('nao muda o caderno recebido', () => {
    const antes = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    const copia = JSON.parse(JSON.stringify(antes));
    registrarCaptura(antes, 'p1', 99);
    expect(antes).toEqual(copia);
  });

  it('mantem separados peixes diferentes', () => {
    let c = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    c = registrarCaptura(c, 'p2', 50);
    expect(Object.keys(c).sort()).toEqual(['p1', 'p2']);
  });
});
