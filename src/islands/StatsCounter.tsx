import { useState, useEffect } from 'preact/hooks';

interface Props {
  value: number;
  suffix?: string;
}

export default function StatsCounter({ value, suffix = '' }: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    const duration = 800;
    let start: number | null = null;
    let id: number;

    setDisplay(0);

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out decelerate: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        id = requestAnimationFrame(animate);
      }
    };

    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [value]);

  return <span class="stats-counter-value">{display}{suffix}</span>;
}
