/** Todo motor devolve o mesmo par. A camada de mundo nunca sabe qual rodou. */
export type Result = { caught: boolean; quality: number };

export type PathKind = 'reta' | 'pendulo' | 'radial' | 'subida';

/** Zona alvo sobre o caminho. `pos` e `tamanho` em fracao de 0..1 do caminho. */
export type Zone = { pos: number; size: number };

export type TrackParams = {
  path: PathKind;
  periodMs: number;
  zones: Zone[];
  hits: number;
  /** Acertou uma zona, ela esvazia e a proxima vira a ativa. */
  alternates: boolean;
  /** null = nunca perde; o erro custa qualidade. */
  tolerance: number | null;
};

export type FishPattern = 'calmo' | 'erratico' | 'arisco';

export type HoldParams = {
  /** Altura da faixa do jogador, fracao de 0..1 da barra. */
  bandHeight: number;
  /** Aceleracao por ms^2, em fracao de barra. */
  gravity: number;
  lift: number;
  pattern: FishPattern;
  /** Fracao de barra por ms que o peixe percorre. */
  fishSpeed: number;
  /** Progresso ganho por ms dentro da faixa. */
  fillRate: number;
  /** Progresso perdido por ms fora da faixa. */
  drainRate: number;
};

/** Portao no anel: em `pos` (0..1 da volta), so estas pistas estao abertas. */
export type Gate = { pos: number; open: number[] };

export type DodgeParams = {
  lanes: number;
  periodMs: number;
  gates: Gate[];
  lapsToCatch: number;
  bumpsAllowed: number;
};

type Base = {
  id: string;
  /** Retangulo colorido de placeholder. Token CSS, nunca hex literal. */
  color: string;
  sizeMin: number;
  sizeMax: number;
};

export type Fish = Base &
  (
    | { engine: 'track'; params: TrackParams }
    | { engine: 'hold'; params: HoldParams }
    | { engine: 'dodge'; params: DodgeParams }
  );
