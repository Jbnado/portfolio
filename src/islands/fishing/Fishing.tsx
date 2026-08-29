import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { FISH, sizeOf, guaranteedFish } from './fish';
import { mountSea, unmountSea } from './sea';
import type { Fish, TrackParams, HoldParams, DodgeParams, Result } from './types';
import { TrackView } from './views/TrackView';
import { HoldView } from './views/HoldView';
import { DodgeView } from './views/DodgeView';
import { weightedPick } from './draw';
import { WorldView, WorldPad, useBoat } from './views/WorldView';
import { TIER_BY_DEPTH, DEPTH_BY_TIER, depthAt, spotUnder, atShop } from './world';
import { ShopView } from './views/ShopView';
import {
  loadProgress, saveProgress, lineReaches, canFish, reachTier, luckOf, addCatch,
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
  keys: string;
  close: string;
  depth3: Record<string, string>;
  world: {
    shop: string; cast: string; noSpot: string; menu: string;
    shopShort: string; castShort: string; noSpotShort: string; logShort: string;
    needLine: string; needLineShort: string;
    turnPhone: string;
    depth: Record<string, string>;
  };
  shop: {
    title: string; coins: string; sell: string; nothingToSell: string;
    line: string; equip: string; equipped: string;
    close: string; help: string;
    baitName: Record<string, string>;
  };
  instruction: Record<string, string>;
  fish: Record<string, string>;
  water: Record<string, string>;
};

type Phase =
  | { kind: 'idle' }
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
  const [log, setLog] = useState<Log>(() => validLog(loadLog()));
  const [guaranteed, setGuaranteed] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Contador de erros so pra disparar a animacao. Alterna entre dois nomes
  // de keyframe (data-miss 1 e 2) porque trocar de classe pro MESMO nome nao
  // reinicia a animacao — nomes diferentes reiniciam, sem timer nenhum.
  const [miss, setMiss] = useState(0);
  const [menu, setMenu] = useState(false);
  const [shop, setShop] = useState(false);
  /** O efeito da sobreposicao so depende de `playing`, entao ele enxergaria
      um `menu` velho. A ref carrega o valor atual sem religar o efeito. */
  const menuRef = useRef(false);
  menuRef.current = menu;
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  const saveAnd = useCallback((p: Progress) => { setProgress(p); saveProgress(p); }, []);
  const onMiss = useCallback(() => setMiss((n) => n + 1), []);
  const { boat, setDir } = useBoat(playing && phase.kind !== 'playing' && !menu && !shop);
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
      const id = new URLSearchParams(location.search).get('peixe');
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
    // O peixe raro de cada profundidade so morde se a LINHA equipada
    // ALCANCA aquela profundidade. Uma linha mais funda cobre o que e mais
    // raso, entao a abissal pesca o raro em qualquer lugar. A linha e
    // permissao; sem ela o raro nem entra no sorteio.
    const pool = FISH.filter((f) => {
      if (f.tier > maxTier) return false;
      if (f.engine === 'hold') return lineReaches(progress, DEPTH_BY_TIER[f.tier]);
      return true;
    }).map((f) =>
      // A isca e probabilidade, nao permissao: ela SOMA sorte no peso do raro.
      f.engine === 'hold' ? { ...f, weight: rareWeight(f.weight, luck) } : f,
    );
    // Sorteio ponderado: sorteio uniforme faria o peixe raro (HOLD na faixa 1)
    // aparecer um em tres, e ele precisa ser raro pra ensinar por surpresa.
    const picked = weightedPick(pool, Math.random);
    // Modo garantido desacelera de verdade agora (achado I3): o peixe entra
    // na vista com o ritmo ja mais lento, nao so com a perda desligada.
    const fish = guaranteed ? guaranteedFish(picked) : picked;
    setPhase({ kind: 'playing', fish, luck });
  }, [boat, guaranteed, progress, saveAnd]);

  const enter = useCallback(() => {
    setPlaying(true);
    setPhase({ kind: 'idle' });
  }, []);

  /** A acao principal, uma so: o Espaco e o botao de toque chamam esta
      mesma funcao. Duplicar a regra faria teclado e dedo divergirem na
      primeira mudanca. */
  const act = useCallback(() => {
    if (menu) { setMenu(false); return; }
    if (phase.kind === 'result') { setPhase({ kind: 'idle' }); return; }
    if (phase.kind !== 'idle') return;
    if (atShop(boat)) { setShop(true); return; }
    if (spot && podePescar) cast();
  }, [menu, phase.kind, boat, spot, podePescar, cast]);

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
              {texts.exit} <small>{texts.exitHelp}</small>
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
            <WorldView boat={boat} reach={reachTier(progress)} texts={texts.world} />

            {/* Altura reservada. O botao de lancar entra e sai conforme o
                barco chega numa marca, e sem a reserva ele empurrava o lago
                inteiro pra cima e pra baixo a cada passo — a outra metade do
                "UI pulando". */}
            <div class="fishing-actions">
              {/* Sem isto o jogo e injogavel no celular: nao ha tecla nenhuma
                  para mover o barco, lancar, abrir a loja ou o caderno. */}
              {phase.kind !== 'playing' && (
                <WorldPad
                  setDir={setDir}
                  onAct={act}
                  onLog={() => setMenu((m) => !m)}
                  actLabel={
                    atShop(boat) ? texts.world.shopShort
                      : !podePescar ? texts.world.needLineShort
                        : spot ? texts.world.castShort : texts.world.noSpotShort
                  }
                  logLabel={texts.world.logShort}
                />
              )}

              {phase.kind === 'idle' && spot && (
                <button class="fishing-button" ref={castBtnRef} onClick={cast}>
                  {texts.cast}
                </button>
              )}

              {/* Como se abre e como se fecha, dito na tela: antes so quem
                  adivinhasse Tab e Esc descobria. */}
              <p class="fishing-keys">{texts.keys}</p>
            </div>

            {phase.kind !== 'idle' && (
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
                <p>
                  {phase.result.caught
                    ? `${texts.caught}: ${texts.fish[phase.fish.id]}, ${phase.size} cm`
                    : `${texts.escaped}: ${texts.fish[phase.fish.id]}`}
                </p>
                <button class="fishing-button" ref={castBtnRef} onClick={() => setPhase({ kind: 'idle' })}>
                  {texts.exit}
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
                texts={{ ...texts.shop, depth: texts.world.depth }}
              />
            )}

            {menu && (
              <div class="fishing-menu">
                <header class="fishing-menu-head">
                  <h3>{texts.log}</h3>
                  <button class="fishing-menu-close" onClick={() => setMenu(false)}>
                    {texts.close}
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
