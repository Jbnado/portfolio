/** Todo motor devolve o mesmo par. A camada de mundo nunca sabe qual rodou. */
export type Resultado = { pego: boolean; qualidade: number };

export type Caminho = 'reta' | 'pendulo' | 'radial' | 'subida';

/** Zona alvo sobre o caminho. `pos` e `tamanho` em fracao de 0..1 do caminho. */
export type Zona = { pos: number; tamanho: number };

export type ParamsTrajeto = {
  caminho: Caminho;
  periodoMs: number;
  zonas: Zona[];
  acertos: number;
  /** Acertou uma zona, ela esvazia e a proxima vira a ativa. */
  alternancia: boolean;
  /** null = nunca perde; o erro custa qualidade. */
  tolerancia: number | null;
};

export type PadraoPeixe = 'calmo' | 'erratico' | 'arisco';

export type ParamsSustentacao = {
  /** Altura da faixa do jogador, fracao de 0..1 da barra. */
  alturaFaixa: number;
  /** Aceleracao por ms^2, em fracao de barra. */
  gravidade: number;
  impulso: number;
  padrao: PadraoPeixe;
  /** Fracao de barra por ms que o peixe percorre. */
  velocidadePeixe: number;
  /** Progresso ganho por ms dentro da faixa. */
  encher: number;
  /** Progresso perdido por ms fora da faixa. */
  drenar: number;
};

/** Portao no anel: em `pos` (0..1 da volta), so estas pistas estao abertas. */
export type Portao = { pos: number; abertas: number[] };

export type ParamsDragagem = {
  pistas: number;
  periodoMs: number;
  portoes: Portao[];
  voltasParaFisgar: number;
  batidasToleradas: number;
};

type Base = {
  id: string;
  /** Retangulo colorido de placeholder. Token CSS, nunca hex literal. */
  cor: string;
  tamanhoMin: number;
  tamanhoMax: number;
};

export type Peixe = Base &
  (
    | { motor: 'trajeto'; params: ParamsTrajeto }
    | { motor: 'sustentacao'; params: ParamsSustentacao }
    | { motor: 'dragagem'; params: ParamsDragagem }
  );
