import './TutorialView.css';

type Props = {
  step: number;
  total: number;
  text: string;
  onNext: () => void;
  onSkip: () => void;
  texts: { skip: string; next: string };
};

/** Tutorial em caixa de fala, no rodape da cena. Nao BLOQUEIA o jogo de
    proposito: ele manda clicar numa marca, entao precisa deixar clicar na
    marca enquanto fala. Quem quiser sair, sai pelo Pular. */
export function TutorialView({ step, total, text, onNext, onSkip, texts }: Props) {
  return (
    <div class="tuto" role="region" aria-label={text}>
      {/* Quadrado reservado para o retrato de quem fala — ainda nao existe,
          mas o lugar dele ja esta guardado, como no caderno. */}
      <span class="tuto-face" aria-hidden="true" />

      <button type="button" class="tuto-body" onClick={onNext}>
        <span class="tuto-text">{text}</span>
        <span class="tuto-foot">
          <span class="tuto-count">{step + 1}/{total}</span>
          <span class="tuto-next">{texts.next} <span class="tuto-caret" aria-hidden="true">&#9654;</span></span>
        </span>
      </button>

      <button type="button" class="tuto-skip" onClick={onSkip}>{texts.skip}</button>
    </div>
  );
}
