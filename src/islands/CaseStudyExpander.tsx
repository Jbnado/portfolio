import { useEffect } from 'preact/hooks';

export default function CaseStudyExpander() {
  useEffect(() => {
    const allDetails = document.querySelectorAll<HTMLDetailsElement>('.case-study-details');

    if (allDetails.length === 0) return;

    const cleanups: (() => void)[] = [];

    allDetails.forEach((detail) => {
      const summary = detail.querySelector<HTMLElement>('.case-study-trigger');
      if (!summary) return;

      // Mark as enhanced — CSS takes over animation
      detail.classList.add('enhanced');
      // Force open so content is in DOM (hidden via grid-template-rows: 0fr)
      detail.setAttribute('open', '');
      summary.setAttribute('aria-expanded', 'false');

      const toggle = (e: Event) => {
        e.preventDefault();
        const isOpen = detail.classList.toggle('open');
        summary.setAttribute('aria-expanded', String(isOpen));

        if (isOpen) {
          const content = detail.querySelector<HTMLElement>('.case-study-content');
          if (content) {
            content.setAttribute('tabindex', '-1');
          }
        }
      };

      summary.addEventListener('click', toggle);

      cleanups.push(() => {
        summary.removeEventListener('click', toggle);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
