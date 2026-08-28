import { describe, it, expect } from 'vitest';
import ptBr from './pt-br.json';
import en from './en.json';
import es from './es.json';

function caminhos(obj: unknown, prefixo = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefixo];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    caminhos(v, prefixo ? `${prefixo}.${k}` : k),
  );
}

describe('paridade trilingue', () => {
  const base = caminhos(ptBr).sort();

  it('en tem exatamente as mesmas chaves de pt-br', () => {
    expect(caminhos(en).sort()).toEqual(base);
  });

  it('es tem exatamente as mesmas chaves de pt-br', () => {
    expect(caminhos(es).sort()).toEqual(base);
  });

  it('o jogo tem as chaves que a rota precisa', () => {
    for (const dic of [ptBr, en, es] as Record<string, any>[]) {
      expect(dic.jogo).toBeDefined();
      expect(typeof dic.jogo.titulo).toBe('string');
      expect(typeof dic.jogo.lancar).toBe('string');
      expect(Object.keys(dic.jogo.peixes)).toHaveLength(9);
    }
  });
});
