import { useEffect } from 'preact/hooks';

const sectionIds = ['sobre', 'projetos', 'contacto'];

export default function ScrollSpy() {
  useEffect(() => {
    try {
      if (typeof IntersectionObserver === 'undefined') return;
    } catch {
      return;
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.navbar-link');

    const setActive = (id: string) => {
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    const visibleSections = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleSections.set(entry.target.id, entry.isIntersecting);
        });

        // Find first visible section (top-most in document order)
        const active = sectionIds.find((id) => visibleSections.get(id));

        // Edge case: near bottom of page, activate last section
        if (!active) {
          const nearBottom =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight - 100;
          if (nearBottom) {
            setActive(sectionIds[sectionIds.length - 1]);
            return;
          }
          // No section visible and not near bottom — clear all active states
          navLinks.forEach((link) => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          });
          return;
        }

        setActive(active);
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return null;
}
