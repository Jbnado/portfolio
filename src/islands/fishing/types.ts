/** Todo motor devolve o mesmo par. A camada de mundo nunca sabe qual rodou. */
export type Result = { caught: boolean; quality: number };

export type PathKind = 'pendulo' | 'radial';

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
  /** Teto de velocidade da faixa, em fracao de barra por ms. Sem ele a
      aceleracao acumula sem limite e so da para tocar, nunca segurar. */
  maxSpeed: number;
  pattern: FishPattern;
  /** Fracao de barra por ms que o peixe percorre. */
  fishSpeed: number;
  /** Progresso ganho por ms dentro da faixa. */
  fillRate: number;
  /** Progresso perdido por ms fora da faixa. */
  drainRate: number;
  /** Carencia: quanto tempo a barra pode ficar zerada antes de o peixe ir
      embora. Zerar deixa de ser perda imediata e vira "esta escapando".
      null = nunca perde por carencia estourada, mesma convencao de
      `tolerance` (TRAJETO) e `bumpsAllowed` (DRAGAGEM) — sem isto o
      SUSTENTACAO nao tinha como declarar "este peixe nunca escapa". */
  graceMs: number | null;
};

/** Portao no anel: em `pos` (0..1 da volta), so estas pistas estao abertas. */
export type Gate = { pos: number; open: number[] };

export type DodgeParams = {
  lanes: number;
  periodMs: number;
  gates: Gate[];
  /** Largura angular do vao, em fracao da volta. E a MESMA largura que a
      vista desenha como buraco no anel: o que se ve e o que se julga. */
  gapWidth: number;
  /** Passagens limpas SEGUIDAS para fisgar. Cair zera a contagem, entao
      ficar parado nunca pesca: toda pista quebra em algum portao. */
  cleanToCatch: number;
  /** null = nunca perde o peixe; cair custa so tamanho e zera a sequencia. */
  bumpsAllowed: number | null;
};

type Base = {
  id: string;
  /** Faixa de dificuldade: 1 e o raso que ensina, 3 e o abissal sem perdao. */
  tier: 1 | 2 | 3;
  /** Peso relativo no sorteio dentro da faixa elegivel. Existe para que o
      peixe que ensina a perder seja raro de encontrar, e nao um em tres. */
  weight: number;
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
