import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Statusline de terminal (estilo tmux/vim) fixa no rodapé.
 * Ao clicar num link, "digita" o comando equivalente e então navega.
 *
 * Regras (todas obrigatórias):
 * - Dark only: no tema claro nada acontece.
 * - Respeita prefers-reduced-motion: não intercepta, navegação instantânea.
 * - Nunca intercepta cliques modificados (ctrl/cmd/shift/alt, botão do meio).
 * - target="_blank", download e mailto: fire-and-forget (não atrasa a ação nativa).
 * - Âncoras internas (#...): ignoradas (o scroll começa na hora).
 * - Navegação same-tab interna: preventDefault → digita (≤300ms) → location.href.
 * - Sem JS a página funciona 100%; container é aria-hidden e pointer-events:none.
 */
export default function TermStatusline() {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const clearTimers = () => {
      timers.current.forEach((id) => clearTimeout(id));
      timers.current = [];
    };

    const isDark = () =>
      document.documentElement.classList.contains('dark');

    const commandFor = (a: HTMLAnchorElement): string => {
      const explicit = a.getAttribute('data-cmd');
      if (explicit) return explicit;

      const raw = a.getAttribute('href') ?? '';
      if (raw.startsWith('mailto:')) return 'mail -s "oi" bernardo';
      if (a.hasAttribute('download')) return 'scp jbnado.dev:cv.pdf ~/Downloads/';
      if (/^https?:\/\//i.test(raw)) {
        let shown = raw.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        if (shown.length > 40) shown = shown.slice(0, 39) + '…';
        return `xdg-open ${shown}`;
      }
      const path = raw.replace(location.origin, '') || '/';
      return `cd ${path}`;
    };

    const type = (cmd: string, done: () => void) => {
      clearTimers();
      setVisible(true);
      setText('');
      const budget = 260; // ms — teto abaixo de 300 exigido no spec
      const per = Math.max(6, Math.min(14, Math.floor(budget / cmd.length)));
      let i = 0;
      const step = () => {
        i += 1;
        setText(cmd.slice(0, i));
        if (i < cmd.length) {
          timers.current.push(window.setTimeout(step, per));
        } else {
          timers.current.push(window.setTimeout(done, 40));
        }
      };
      step();
    };

    const fireAndForget = (cmd: string) => {
      type(cmd, () => {
        timers.current.push(window.setTimeout(() => setVisible(false), 900));
      });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;

      const raw = a.getAttribute('href');
      if (!raw) return;

      // Só no universo do terminal, e nunca com movimento reduzido.
      if (!isDark() || prefersReduced) return;

      // Âncoras internas: sem statusline (scroll imediato).
      if (raw.startsWith('#')) return;

      const newTab = a.getAttribute('target') === '_blank';
      const isDownload = a.hasAttribute('download');
      const isMailto = raw.startsWith('mailto:');

      // Ações nativas paralelas: anima sem atrasar.
      if (newTab || isDownload || isMailto) {
        fireAndForget(commandFor(a));
        return;
      }

      // Navegação same-tab interna: intercepta, digita, então navega.
      const isInternal =
        raw.startsWith('/') || raw.startsWith(location.origin);
      if (!isInternal) return; // esquema desconhecido: deixa nativo

      const dest = a.href;
      e.preventDefault();
      type(commandFor(a), () => {
        window.location.href = dest;
      });
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      clearTimers();
    };
  }, []);

  return (
    <div
      class={`term-statusline${visible ? ' is-visible' : ''}`}
      aria-hidden="true"
    >
      <span class="term-statusline-prompt">jbnado@rp:~$</span>
      <span class="term-statusline-text">{text}</span>
      <span class="term-statusline-caret" />
    </div>
  );
}
