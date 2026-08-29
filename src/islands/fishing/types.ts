/** Todo motor devolve o mesmo par. A camada de mundo nunca sabe qual rodou. */
export type Result = { caught: boolean; quality: number };

export type TrackParams = {
  periodMs: number;
  /** Tamanho da zona verde, fracao de 0..1 da barra. E o botao de
      dificuldade do TRAJETO: a zona encolhe conforme o peixe fica dificil.
      A POSICAO nao mora aqui — ela e sorteada a cada acerto e vive no
      estado, entao nao da pra decorar onde mirar. */
  zoneSize: number;
  hits: number;
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
      `tolerance` (TRAJETO) e `fallsToLose` (DRAGAGEM) — sem isto o
      SUSTENTACAO nao tinha como declarar "este peixe nunca escapa". */
  graceMs: number | null;
};

/** Vao no anel: um buraco de `width` (fracao da volta) centrado em `pos`, que
    quebra TODAS as pistas menos `open`. Posicao e largura sao sorteadas a cada
    lance, entao nao moram nos parametros do peixe — vivem no estado. */
export type Gate = { pos: number; width: number; open: number };

export type DodgeParams = {
  periodMs: number;
  /** Quantos vaos o anel tem neste lance, sorteado neste intervalo. Junto com
      a velocidade da volta, e o botao de dificuldade da DRAGAGEM: mais vaos
      significa mais trocas de pista obrigatorias por volta. */
  gatesMin: number;
  gatesMax: number;
  /** Largura de cada vao, sorteada neste intervalo, vao a vao. */
  gapMin: number;
  gapMax: number;
  /** Milissegundos limpos SEGUIDOS para fisgar. A barrinha enche enquanto
      voce nao cai e zera quando cai — e o peixe sendo puxado. */
  holdMs: number;
  /** Quanto tempo limpo cada queda custa. Errar RECUA a barrinha, nao zera:
      zerar 15 segundos de luta por um deslize era punicao demais. */
  penaltyMs: number;
  /** Quedas SEGUIDAS que perdem o peixe — passar limpo por um vao zera a
      contagem. null = nunca perde. */
  fallsToLose: number | null;
  /** Quantas vezes a barrinha pode chegar a ZERO antes de o peixe ir embora.
      E a segunda porta de saida: quem cai espacado nunca junta quedas
      seguidas, mas se a barra zera de novo e de novo, o peixe se soltou.
      null = nunca perde por esta via. */
  zeroesToLose: number | null;
};

type Base = {
  id: string;
  /** Faixa de dificuldade: 1 e o raso que ensina, 3 e o abissal sem perdao. */
  tier: 1 | 2 | 3;
  /** Peso relativo no sorteio dentro da faixa elegivel. Existe para que o
      peixe que ensina a perder seja raro de encontrar, e nao um em tres. */
  weight: number;
  /** De que agua o peixe e. A graca do lago e que os dois aparecem ali: e a
      premissa do cenario, entao ela precisa estar visivel no caderno. */
  water: 'doce' | 'salgada';
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
