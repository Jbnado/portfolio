import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { FISH, sizeOf, guaranteedFish } from './fish';
import { mountSea, unmountSea } from './sea';
import type { Fish, TrackParams, HoldParams, DodgeParams, Result } from './types';
import { TrackView } from './views/TrackView';
import { HoldView } from './views/HoldView';
import { DodgeView } from './views/DodgeView';
import { weightedPick } from './draw';
import { castDuration, frameAt, fightFrame, shadowScale } from './cast';
import { WorldView, WorldPad, useBoat } from './views/WorldView';
import { TIER_BY_DEPTH, DEPTH_BY_TIER, depthAt, spotUnder, atShop } from './world';
import { ShopView } from './views/ShopView';
import { CatchView } from './views/CatchView';
import { TutorialView } from './views/TutorialView';
import {
  loadProgress, saveProgress, rareBites, canFish, reachTier, luckOf, addCatch, rarityOf,
  rareWeight, luckyQuality, type Progress,
} from './shop';
import {
  loadLog,
  saveLog,
  recordCatch,
  type Log,
} from './log';

type Texts = {
  cast: string;
  caught: string;
  escaped: string;
  log: string;
  logEmpty: string;
  times: string;
  time: string;
  largest: string;
  guaranteedMode: string;
  guaranteedModeHelp: string;
  reeling: string;
  falls: string;
  resets: string;
  fallsUnlimited: string;
  play: string;
  exit: string;
  exitHelp: string;
  gameArea: string;
  howToPlay: string;
  keyLeft: string;
  keyRight: string;
  keyAct: string;
  keyLog: string;
  keyClose: string;
  keyPick: string;
  scroll: string;
  back: string;
  close: string;
  fight: string;
  tuto: { title: string; skip: string; next: string; chapters: Record<TutorialChapter, string[]> };
  depth3: Record<string, string>;
  world: {
    shop: string; cast: string; noSpot: string; menu: string;
    shopShort: string; castShort: string; noSpotShort: string; logShort: string;
    clickHint: string;
    needLine: string; needLineShort: string;
    turnPhone: string;
    depth: Record<string, string>;
  };
  shop: {
    title: string; coins: string; sell: string; nothingToSell: string;
    line: string; baitLabel: string; equip: string; equipped: string;
    close: string; choose: string; act: string;
    baitName: Record<string, string>;
  };
  rarity: Record<'comum' | 'raro' | 'lenda', string>;
  instruction: Record<string, string>;
  fish: Record<string, string>;
  water: Record<string, string>;
};

type TutorialChapter = 'intro' | 'catch' | 'sale';

type Phase =
  | { kind: 'idle' }
  // A espera entre o lance e a mordida. O peixe JA esta sorteado aqui: e o
  // que deixa o vulto na agua ser honesto sobre o tamanho do que vem vindo,
  // sem entregar o nome, que pertence ao CatchView.
  | { kind: 'casting'; fish: Fish; luck: number; ms: number }
  // A sorte viaja com a fase: ela e lida no lance e tem que valer no
  // resultado, mesmo que o jogador troque de isca no meio tempo.
  | { kind: 'playing'; fish: Fish; luck: number }
  | { kind: 'result'; fish: Fish; result: Result; size: number };

// `loadLog` faz `JSON.parse` sem validar o formato: um valor gravado
// por fora (ou corrompido) pode virar array, string ou numero e passar direto
// pelo cast. `Object.entries` abaixo quebra num primitivo, entao qualquer
// resultado que nao seja um objeto simples vira caderno vazio aqui.
function validLog(c: Log): Log {
  return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
}

export default function Fishing({ texts }: { texts: Texts }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  /** Quadro do pescador durante a espera. So 1 ou 2: o 0 e a fase parada e o
      3 pertence a luta, e nenhum dos dois depende de tempo. */
  const [castFrame, setCastFrame] = useState<1 | 2>(1);
  /** Quadro da luta. O comum fica no 3; raro e lenda alternam, e a alternancia
      le como esforco. */
  const [fightF, setFightF] = useState<2 | 3>(3);
  const [log, setLog] = useState<Log>(() => validLog(loadLog()));
  const [guaranteed, setGuaranteed] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Contador de erros so pra disparar a animacao. Alterna entre dois nomes
  // de keyframe (data-miss 1 e 2) porque trocar de classe pro MESMO nome nao
  // reinicia a animacao — nomes diferentes reiniciam, sem timer nenhum.
  const [miss, setMiss] = useState(0);
  /** Aponta para `contar`, que nasce mais abaixo. A ref quebra a ordem de
      declaracao sem religar callbacks a cada render. */
  const contarRef = useRef<(ch: TutorialChapter) => void>(() => {});
  const [menu, setMenu] = useState(false);
  const [shop, setShop] = useState(false);
  /** O efeito da sobreposicao so depende de `playing`, entao ele enxergaria
      um `menu` velho. A ref carrega o valor atual sem religar o efeito. */
  const menuRef = useRef(false);
  menuRef.current = menu;
  /** O ouvinte de teclas e registado uma vez, entao a fase tem de chegar nele
      por ref. Sem isto, Esc durante a espera fechava o jogo inteiro. */
  const castingRef = useRef(false);
  castingRef.current = phase.kind === 'casting';
  /** O painel do caderno, para o teclado o poder rolar. */
  const dexRef = useRef<HTMLDivElement>(null);

  /** Tutorial em CAPITULOS, disparados por acontecimento: despejar tudo na
      abertura e o jeito errado — ninguem le um manual antes de jogar. Quem
      fala e o lojista, e ele volta quando voce faz algo novo.

      O que ja foi visto e da PESSOA, nao da partida: fica em chave propria. */
  const [tuto, setTuto] = useState<{ ch: TutorialChapter; i: number } | null>(null);
  const vistos = useRef<string[]>([]);
  useEffect(() => {
    try { vistos.current = JSON.parse(localStorage.getItem('fishing:tuto') ?? '[]'); } catch { /* modo privado */ }
    if (!Array.isArray(vistos.current)) vistos.current = [];
    if (!vistos.current.includes('intro')) setTuto({ ch: 'intro', i: 0 });
  }, []);

  const marcarVisto = useCallback((ch: TutorialChapter) => {
    if (!vistos.current.includes(ch)) vistos.current = [...vistos.current, ch];
    try { localStorage.setItem('fishing:tuto', JSON.stringify(vistos.current)); } catch { /* modo privado */ }
  }, []);

  /** Um capitulo NAO entra por cima do que ja esta na tela. Sao dois casos, e
      os dois aconteciam:

      - A venda dispara o capitulo de dentro da LOJA, e a caixa de fala,
        ancorada no rodape do lago, cortava a lista ao meio — com o rodape do
        painel a sair por baixo dela.
      - A captura dispara o capitulo junto com a REVELACAO, e o veu do
        tutorial (z-index 6) tapava o cartao e o clarao (z-index 3). Ou seja:
        na primeira fisgada, a unica em que o capitulo abre, a comemoracao
        ficava escondida.

      Fica pendente e abre quando a tela esvazia — que e tambem onde a fala
      faz mais sentido: acabaste de pescar, agora vem ca. */
  const pendente = useRef<TutorialChapter | null>(null);
  const painelRef = useRef(false);
  painelRef.current = menu || shop || phase.kind !== 'idle';

  /** Abre um capitulo, se ele ainda nao foi visto. */
  const contar = useCallback((ch: TutorialChapter) => {
    if (vistos.current.includes(ch)) return;
    if (painelRef.current) { pendente.current = ch; return; }
    setTuto({ ch, i: 0 });
  }, []);
  contarRef.current = contar;

  useEffect(() => {
    if (menu || shop || phase.kind !== 'idle') return;
    const ch = pendente.current;
    if (ch === null) return;
    pendente.current = null;
    if (!vistos.current.includes(ch)) setTuto({ ch, i: 0 });
  }, [menu, shop, phase.kind]);

  const fecharTuto = useCallback(() => {
    setTuto((t) => { if (t) marcarVisto(t.ch); return null; });
  }, [marcarVisto]);

  const passoTuto = useCallback(() => {
    setTuto((t) => {
      if (!t) return null;
      const proximo = t.i + 1;
      if (proximo < texts.tuto.chapters[t.ch].length) return { ...t, i: proximo };
      marcarVisto(t.ch);
      return null;
    });
  }, [texts.tuto.chapters, marcarVisto]);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const saveAnd = useCallback((p: Progress) => {
    // Vender e o porao sair de cheio para vazio. A comparacao usa uma ref e
    // nao o atualizador de estado: disparar efeito de dentro do updater e
    // impuro, e um dia rodaria duas vezes sem aviso.
    if (progressRef.current.hold.length > 0 && p.hold.length === 0) contarRef.current('sale');
    progressRef.current = p;
    setProgress(p);
    saveProgress(p);
  }, []);
  const onMiss = useCallback(() => setMiss((n) => n + 1), []);
  const { boat, facing, setDir, sailTo } = useBoat(playing && phase.kind !== 'playing' && phase.kind !== 'casting' && !menu && !shop && tuto === null);
  /** A linha equipada decide ate onde da para pescar. Sem ela, o meio e o
      abissal ficam fechados. */
  const podePescar = canFish(progress, depthAt(boat));
  /** Marca fora do alcance da linha NAO conta como marca: ela nem e
      desenhada, e sem esta trava o barco continuava "em cima" de um ponto
      invisivel e o botao de lancar aparecia do nada. */
  const spot = podePescar ? spotUnder(boat) : null;
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const castBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // O <canvas> pertence a pagina Astro, nao a ilha, entao a ilha o alcanca por
  // seletor. Efeito de montagem unica: nao ha loop de animacao no v1.
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.fishing-sea');
    if (canvas) mountSea(canvas);
    return () => unmountSea();
  }, []);

  // A sobreposicao e um dialogo modal: enquanto ela esta aberta o documento
  // atras nao rola, Esc fecha, Tab fica preso dentro dela, o foco entra nela e
  // VOLTA para o botao Jogar ao sair — sem isso quem navega por teclado e
  // largado no meio da pagina, ou pior, escapa do dialogo por Tab enquanto
  // ele ainda cobre a tela inteira.
  useEffect(() => {
    if (!playing) return;
    document.body.classList.add('fishing-locked');
    overlayRef.current?.focus();

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        // Esc fecha o que esta POR CIMA primeiro. Sem isto, fechar o caderno
        // derrubava o jogo inteiro junto — e "Esc fecha" deixava de ser
        // verdade justamente onde o jogador mais usa a tecla.
        if (menuRef.current) { setMenu(false); return; }
        // Desistir do lance NAO cobra o peixe ja sorteado: sair no meio da
        // espera seria uma armadilha, e "Esc fecha o que esta por cima"
        // deixaria de ser verdade justamente no unico ponto sem saida.
        if (castingRef.current) { setPhase({ kind: 'idle' }); return; }
        setPlaying(false);
        return;
      }
      if (ev.key !== 'Tab') return;
      const dialog = overlayRef.current;
      if (!dialog) return;
      // Consultado a cada Tab, nunca cacheado na abertura: o conjunto de
      // focaveis muda entre fases (o botao de lancar e o checkbox do modo
      // garantido existem em idle/result, nenhum em playing — achado I7:
      // o checkbox some do playing porque o Space que o motor intercepta
      // globalmente quebrava o toggle por teclado dele), entao uma lista
      // presa na abertura prenderia o foco num elemento que ja nao existe
      // mais. Inclui input: o checkbox fica de fora de
      // 'a[href], button, [tabindex]', e sem esse seletor o trap nao o
      // alcancaria nas fases em que ele existe.
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (ev.shiftKey) {
        // O container tem tabindex=-1: no playing o foco pousa nele (nenhum
        // motor tem controle proprio), e dali Shift+Tab sairia do dialogo por
        // padrao se nao tratarmos esse caso tambem.
        if (document.activeElement === first || document.activeElement === dialog) {
          ev.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('fishing-locked');
      window.removeEventListener('keydown', onKey);
      playBtnRef.current?.focus();
    };
  }, [playing]);

  // O botao de lancar desmonta a cada troca de fase (idle -> playing ->
  // result), e sem foco explicito o navegador devolve o foco para <body>,
  // vazando do dialogo. No playing nao ha controle proprio — os tres motores
  // ouvem Espaco na window — entao o foco fica no container da sobreposicao.
  useEffect(() => {
    if (!playing) return;
    if (phase.kind === 'playing') {
      overlayRef.current?.focus();
    } else {
      castBtnRef.current?.focus();
    }
  }, [playing, phase.kind]);

  // Sem mapa no v1, a profundidade e simulada pelo caderno: as faixas abrem
  // conforme se pesca. Sem isto a curva de aprendizado da matriz nao aparece.
  const cast = useCallback(() => {
    // Atalho de teste, SO em desenvolvimento: ?peixe=p7 forca o sorteio, para
    // dar pra provar cada dificuldade sem depender do acaso (o p7 tem peso 1
    // em 106 na faixa 3, ~1% por lance). Em producao o Vite substitui
    // import.meta.env.DEV por false e o ramo inteiro sai do bundle.
    if (import.meta.env.DEV) {
      const q = new URLSearchParams(location.search);
      // ?fisga=p23 pula o minigame e vai direto a REVELACAO, no tamanho
      // maximo da especie. E a unica forma de ver as tres comemoracoes sem
      // depender de sortear um lendario, que tem peso 1 e so morde no ponto
      // dele com a isca dele.
      const fisga = q.get('fisga');
      const premio = fisga ? FISH.find((f) => f.id === fisga) : undefined;
      if (premio) {
        setPhase({ kind: 'result', fish: premio, result: { caught: true, quality: 1 }, size: premio.sizeMax });
        return;
      }
      const id = q.get('peixe');
      const forced = id ? FISH.find((f) => f.id === id) : undefined;
      if (forced) {
        setPhase({ kind: 'playing', fish: guaranteed ? guaranteedFish(forced) : forced, luck: 0 });
        return;
      }
    }
    // A profundidade onde o barco esta e que abre a faixa. Isto substitui o
    // "quantos peixes voce ja conhece" do v1, que era progressao de mentira
    // por nao existir mapa: agora andar para a direita E a progressao.
    const aqui = depthAt(boat);
    // Guarda dupla: `act` ja nao chama sem alcance, mas o sorteio nao pode
    // depender de quem o chamou para respeitar a regra.
    if (!canFish(progress, aqui)) return;
    const maxTier = TIER_BY_DEPTH[aqui];
    const luck = luckOf(progress);
    // O peixe raro de cada profundidade tem dono: no raso e a ISCA, mais
    // fundo e a propria linha (ver `rareBites`). Sem o equipamento, o raro
    // nem entra no sorteio.
    const pool = FISH.filter((f) => {
      if (f.tier > maxTier) return false;
      // Lendario so morde no ponto dele e so com a isca dele. Fora disso nem
      // entra no sorteio — e o que faz "raríssimo" significar algo.
      if (f.legend) return f.legend.spot === spot?.id && progress.bait === f.legend.bait;
      if (f.engine === 'hold') return rareBites(progress, DEPTH_BY_TIER[f.tier]);
      return true;
    }).map((f) => {
      // A profundidade em que o barco ESTA manda no sorteio. Sem isto, com 24
      // especies, o abissal devolveria lambari o tempo todo: o cardume raso
      // continua no bolo e afogaria o que se foi buscar la.
      const distancia = maxTier - f.tier;
      const perto = distancia === 0 ? 1 : distancia === 1 ? 0.35 : 0.12;
      // A isca e probabilidade, nao permissao: ela SOMA sorte no peso do raro.
      const base = f.engine === 'hold' ? rareWeight(f.weight, luck) : f.weight;
      return { ...f, weight: Math.max(1, Math.round(base * perto)) };
    });
    // Sorteio ponderado: sorteio uniforme faria o peixe raro (HOLD na faixa 1)
    // aparecer um em tres, e ele precisa ser raro pra ensinar por surpresa.
    const picked = weightedPick(pool, Math.random);
    // Modo garantido desacelera de verdade agora (achado I3): o peixe entra
    // na vista com o ritmo ja mais lento, nao so com a perda desligada.
    const fish = guaranteed ? guaranteedFish(picked) : picked;
    // Nao vai direto pra luta: passa pela espera, onde o pescador levanta,
    // lanca, e o vulto se aproxima na agua.
    setPhase({ kind: 'casting', fish, luck, ms: castDuration(Math.random) });
  }, [boat, guaranteed, progress, saveAnd]);

  /** A espera. Um laco de animacao em vez de dois `setTimeout` porque quem
      decide o quadro e `frameAt`, no modulo puro que os testes cobrem — aqui
      so se conta o tempo e se entrega o resultado. `setCastFrame` com o mesmo
      valor nao re-renderiza, entao o laco custa uma conta por quadro. */
  useEffect(() => {
    if (phase.kind !== 'casting') return;
    const { fish, luck, ms } = phase;
    const t0 = performance.now();
    let raf = 0;
    const passo = () => {
      const decorrido = performance.now() - t0;
      if (decorrido >= ms) { setPhase({ kind: 'playing', fish, luck }); return; }
      setCastFrame(frameAt(decorrido));
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /** O debate durante a luta. O comum nao se debate, entao para ele nao se
      acende laco nenhum: fica no quadro da fisgada e pronto. */
  useEffect(() => {
    if (phase.kind !== 'playing') { setFightF(3); return; }
    const rar = rarityOf(phase.fish);
    if (rar === 'comum') { setFightF(3); return; }
    const t0 = performance.now();
    let raf = 0;
    const passo = () => {
      setFightF(fightFrame(rar, performance.now() - t0));
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const enter = useCallback(() => {
    setPlaying(true);
    setPhase({ kind: 'idle' });
  }, []);

  /** A acao principal, uma so: o Espaco e o botao de toque chamam esta
      mesma funcao. Duplicar a regra faria teclado e dedo divergirem na
      primeira mudanca. */
  const act = useCallback(() => {
    if (tuto !== null) { passoTuto(); return; }
    if (menu) { setMenu(false); return; }
    if (phase.kind === 'result') { setPhase({ kind: 'idle' }); return; }
    if (phase.kind !== 'idle') return;
    if (atShop(boat)) { setShop(true); return; }
    if (spot && podePescar) cast();
  }, [tuto, passoTuto, menu, phase.kind, boat, spot, podePescar, cast]);

  /** O painel do caderno rola; o teclado tem de o rolar tambem. Sem isto o
      grid de 24 especies so se via com a roda do rato — e quem abriu com Tab
      nao tem por que largar o teclado a meio. */
  useEffect(() => {
    if (!menu) return;
    const onKey = (ev: KeyboardEvent) => {
      const passo = ev.code === 'KeyW' || ev.code === 'ArrowUp' ? -1
        : ev.code === 'KeyS' || ev.code === 'ArrowDown' ? 1 : 0;
      if (!passo) return;
      ev.preventDefault();
      // Rolagem por FRACAO da altura visivel, nao por pixels fixos: no
      // telefone o painel e baixo e um passo de 120px saltaria uma fila
      // inteira do grid.
      const alvo = dexRef.current;
      if (alvo) alvo.scrollBy({ top: passo * alvo.clientHeight * 0.45, behavior: 'smooth' });
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [menu]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.code === 'Tab') { ev.preventDefault(); setMenu((m) => !m); return; }
      if (ev.code !== 'Space' || ev.repeat) return;
      // Se o foco esta num controle, o proprio navegador vai ativa-lo com
      // Espaco: agir aqui tambem faria a acao duas vezes.
      const alvo = document.activeElement;
      if (alvo instanceof HTMLButtonElement || alvo instanceof HTMLInputElement) return;
      ev.preventDefault();
      act();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, act]);

  const onDone = useCallback(
    (fish: Fish, luck: number) => (raw: Result) => {
      // Modo garantido forca a captura mas nao mexe em quality: o tamanho
      // continua refletindo o desempenho do jogador, so a perda e desligada.
      const result = guaranteed ? { caught: true, quality: raw.quality } : raw;
      // A isca tambem puxa o TAMANHO para cima, sem passar do teto da especie.
      const size = sizeOf(fish, luckyQuality(result.quality, luck));
      if (result.caught) {
        const updated = recordCatch(log, fish.id, size);
        setLog(updated);
        saveLog(updated);
        // O peixe vai pro porao; vender na loja e o que vira moeda.
        saveAnd(addCatch(progress, fish.id, size));
        contarRef.current('catch');
      }
      setPhase({ kind: 'result', fish, result, size });
    },
    [log, guaranteed, progress, saveAnd],
  );

  return (
    <div>
      <p class="fishing-prompt">{texts.howToPlay}</p>

      <button class="fishing-button" ref={playBtnRef} onClick={enter}>
        {texts.play}
      </button>

      <section>
        <h2>{texts.log}</h2>
        {Object.keys(log).length === 0 ? (
          <p>{texts.logEmpty}</p>
        ) : (
          <ul>
            {Object.entries(log).map(([id, r]) => (
              <li key={id}>
                {texts.fish[id]} — {r.times} {r.times === 1 ? texts.time : texts.times}, {texts.largest} {r.largest} cm
              </li>
            ))}
          </ul>
        )}
      </section>

      {playing && (
        <div
          class="fishing-overlay"
          data-miss={miss ? (miss % 2 ? '1' : '2') : undefined}
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={texts.gameArea}
        >
          {/* Vinheta vermelha do erro. E de borda, nao de tela cheia, de
              proposito: piscar area grande esbarra no criterio de tres
              flashes por segundo (WCAG 2.3.1, nivel A) se alguem martelar o
              espaco. aria-hidden porque o erro ja e dito pela contagem. */}
          <span class="fishing-flash" aria-hidden="true" />

          <div class="fishing-overlay-bar">
            <button class="fishing-exit" onClick={() => setPlaying(false)}>
              {texts.exit}<kbd class="key">{texts.keyClose}</kbd>
            </button>

            {/* Estado sempre a vista. Moeda escondida faz a economia parecer
                arbitraria; linha e isca escondidas fazem a trava de
                profundidade parecer defeito. */}
            <span class="fishing-stat">{texts.shop.coins}: <strong>{progress.coins}</strong></span>
            <span class="fishing-stat">
              {texts.shop.line}: <strong>{progress.line ? texts.world.depth[progress.line] : '—'}</strong>
            </span>
            <span class="fishing-stat">
              {texts.shop.baitLabel}: <strong>{progress.bait ? texts.shop.baitName[progress.bait] : '—'}</strong>
            </span>

            {/* Rever o tutorial e um botao, nao um segredo: quem chegou
                depois da primeira visita tambem precisa aprender. */}
            <button class="fishing-help" onClick={() => setTuto({ ch: 'intro', i: 0 })} aria-label={texts.tuto.title}>
              ?
            </button>

            {/* So fora do playing (achado I7): os tres motores fazem
                preventDefault() no keydown de Space na window, e isso cancela
                o keyup que o navegador usa pra ativar um checkbox por
                teclado. Alcancavel mas inerte dentro da partida. */}
            {phase.kind !== 'playing' && (
              <label class="fishing-option">
                <input
                  type="checkbox"
                  checked={guaranteed}
                  onChange={(e) => setGuaranteed((e.target as HTMLInputElement).checked)}
                />
                <span>{texts.guaranteedMode}</span>
                <small>{texts.guaranteedModeHelp}</small>
              </label>
            )}
          </div>

          {/* role=dialog com aria-modal esconde tudo fora da subarvore para
              leitores de tela: a live region tem que morar aqui dentro, senao
              o anuncio de captura nunca chega enquanto a sobreposicao esta
              aberta. */}
          <p class="fishing-live" role="status" aria-live="polite">
            {phase.kind === 'result'
              ? phase.result.caught
                ? `${texts.caught}: ${texts.fish[phase.fish.id]}, ${phase.size} cm`
                : `${texts.escaped}: ${texts.fish[phase.fish.id]}`
              : ''}
          </p>

          <div class="fishing-arena">
            {/* O mundo fica SEMPRE desenhado. O minigame cobre a cena em vez de
                substitui-la: e assim que da pra julgar como a partida aparece
                por cima do lago, que e o ponto deste blockout. */}
            {/* O quadro do pescador sai da FASE, nunca de um keyframe: a
                espera e sorteada a cada lance e o CSS nao tem como saber esse
                numero. O vulto so existe durante a espera, e o tamanho dele
                vem do peixe ja sorteado. */}
            <WorldView
              boat={boat}
              reach={reachTier(progress)}
              onSailTo={sailTo}
              texts={texts.world}
              frame={phase.kind === 'casting' ? castFrame : phase.kind === 'playing' ? fightF : 0}
              shadow={phase.kind === 'casting' ? shadowScale(phase.fish) : null}
              facing={facing}
            >
              {tuto !== null && (
                <TutorialView
                  step={tuto.i}
                  total={texts.tuto.chapters[tuto.ch].length}
                  text={texts.tuto.chapters[tuto.ch][tuto.i]}
                  onNext={passoTuto}
                  onSkip={fecharTuto}
                  texts={{ skip: texts.tuto.skip, next: texts.tuto.next }}
                />
              )}
            </WorldView>

            {/* Altura reservada. O botao de lancar entra e sai conforme o
                barco chega numa marca, e sem a reserva ele empurrava o lago
                inteiro pra cima e pra baixo a cada passo — a outra metade do
                "UI pulando". */}
            {/* Altura reservada e conteudo estavel: nada entra ou sai do
                fluxo, entao o lago nao se mexe. */}
            <div class="fishing-actions">
              {/* O BOTAO DA BRIGA. Os tres motores so escutam a barra de
                  espaco na window — no celular nao existe espaco, entao sem
                  isto da para navegar e lancar e o jogo TRAVA no minigame.

                  Ele dispara o evento de tecla de verdade em vez de mexer nos
                  motores: eles estao afinados e fechados, e um caminho de
                  entrada novo nao justifica reabri-los. Manda keydown e keyup
                  porque o SUSTENTACAO precisa dos dois — la se SEGURA.

                  preventDefault no pointerdown impede o botao de tomar foco:
                  com foco, apertar espaco clicaria o botao E chegaria ao
                  motor, agindo duas vezes. */}
              {phase.kind === 'playing' && (
                <button
                  type="button"
                  class="fishing-fight"
                  onPointerDown={(ev) => {
                    ev.preventDefault();
                    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true }));
                    const solta = () => {
                      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
                      window.removeEventListener('pointerup', solta);
                      window.removeEventListener('pointercancel', solta);
                    };
                    window.addEventListener('pointerup', solta);
                    window.addEventListener('pointercancel', solta);
                  }}
                >
                  {texts.fight}<kbd class="key">{texts.keyAct}</kbd>
                </button>
              )}

              {phase.kind !== 'playing' && (
                <WorldPad
                  setDir={setDir}
                  onAct={act}
                  onLog={() => setMenu((m) => !m)}
                  actEnabled={tuto === null && phase.kind === 'idle' && (atShop(boat) || (!!spot && podePescar))}
                  actLabel={
                    atShop(boat) ? texts.world.shopShort
                      : !podePescar ? texts.world.needLineShort
                        : spot ? texts.world.castShort : texts.world.noSpotShort
                  }
                  logLabel={`${texts.world.logShort} ${Object.keys(log).length}/${FISH.length}`}
                  keys={{ left: texts.keyLeft, right: texts.keyRight, act: texts.keyAct, log: texts.keyLog }}
                />
              )}

            </div>

            {/* O veu cobre a cena para o minigame e para a revelacao — mas
                NAO durante a espera. Em `casting` o que ha para ver e
                justamente o lago: o pescador levantando, a linha indo, e o
                vulto se aproximando. Tapar isso apagava a animacao inteira no
                instante em que se aperta o espaco. */}
            {(phase.kind === 'playing' || phase.kind === 'result') && (
              <div class="fishing-over">
            {phase.kind === 'playing' && (
              <>
                <p class="fishing-prompt">{texts.instruction[phase.fish.engine]}</p>
                {phase.fish.engine === 'track' && (
                  <TrackView
                    params={phase.fish.params as TrackParams}
                    onDone={onDone(phase.fish, phase.luck)}
                    onMiss={onMiss}
                  />
                )}
                {phase.fish.engine === 'hold' && (
                  <HoldView
                    params={phase.fish.params as HoldParams}
                    color={phase.fish.color}
                    onDone={onDone(phase.fish, phase.luck)}
                  />
                )}
                {phase.fish.engine === 'dodge' && (
                  <DodgeView
                    params={phase.fish.params as DodgeParams}
                    texts={{ reeling: texts.reeling, falls: texts.falls, resets: texts.resets, fallsUnlimited: texts.fallsUnlimited }}
                    onDone={onDone(phase.fish, phase.luck)}
                    onMiss={onMiss}
                  />
                )}
              </>
            )}

            {phase.kind === 'result' && (
              <>
                {/* Fisgar tem premio; escapar tem so a noticia. Dar a mesma
                    vista aos dois roubaria o peso da fisgada, que e a unica
                    coisa que o jogo tem para comemorar. */}
                {phase.result.caught ? (
                  <>
                    <p class="fishing-caught">{texts.caught}</p>
                    <CatchView
                      fish={phase.fish}
                      cm={phase.size}
                      texts={{ name: texts.fish[phase.fish.id], rarity: texts.rarity }}
                    />
                  </>
                ) : (
                  <p>{`${texts.escaped}: ${texts.fish[phase.fish.id]}`}</p>
                )}
                {/* Dispensar o resultado NAO e sair do jogo. O rotulo era
                    "Sair" e mentia: quem lesse achava que ia perder a partida. */}
                <button class="fishing-button" ref={castBtnRef} onClick={() => setPhase({ kind: 'idle' })}>
                  {texts.back}<kbd class="key">{texts.keyAct}</kbd>
                </button>
              </>
            )}
              </div>
            )}

            {/* Caderno por cima da cena. Por enquanto so o nome e um quadrado
                vazio no lugar da foto — o espaco ja fica reservado para ela. */}
            {shop && (
              <ShopView
                progress={progress}
                onChange={saveAnd}
                onClose={() => setShop(false)}
                texts={{
                  ...texts.shop,
                  depth: texts.world.depth,
                  keyClose: texts.keyClose, keyPick: texts.keyPick, keyAct: texts.keyAct,
                }}
              />
            )}

            {menu && (
              <div class="fishing-menu" ref={dexRef}>
                <header class="fishing-menu-head">
                  <h3>{texts.log}</h3>
                  {/* O cracha de rolar fica na cabeca do caderno: sem ele, W e
                      S rolavam mas ninguem sabia — e num grid de 24 especies
                      quase tudo esta abaixo da dobra. */}
                  <span class="fishing-menu-keys">
                    <kbd class="key">{texts.keyPick}</kbd>{texts.scroll}
                  </span>
                  <button class="fishing-menu-close" onClick={() => setMenu(false)}>
                    {texts.close}<kbd class="key">{texts.keyClose}</kbd>
                  </button>
                </header>

                {/* Todas as especies aparecem sempre, as que faltam como
                    "???": o caderno serve para mostrar o que ainda ha por
                    pescar, nao so o que ja se pescou. */}
                <ul class="fishing-dex">
                  {FISH.map((f) => {
                    const r = log[f.id];
                    return (
                      <li key={f.id} class="fishing-dex-item" data-found={String(!!r)}>
                        <span class="fishing-menu-pic" aria-hidden="true">{r ? '' : '???'}</span>
                        <strong>{r ? texts.fish[f.id] : '???'}</strong>
                        {r ? (
                          <small>
                            {texts.water[f.water]}
                            {' · '}{r.times} {r.times === 1 ? texts.time : texts.times}
                            <br />{texts.largest} {r.largest} cm
                          </small>
                        ) : (
                          <small>{texts.depth3[f.tier]}</small>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
