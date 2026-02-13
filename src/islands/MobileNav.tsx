import { useState, useEffect, useRef } from 'preact/hooks';

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links?: NavLink[];
  cvHref?: string;
}

const defaultLinks: NavLink[] = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#projetos', label: 'Projetos' },
  { href: '#contacto', label: 'Contacto' },
];

export default function MobileNav({ links = defaultLinks, cvHref = '/Bernardo-CV.pdf' }: Props) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggle = () => {
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  };

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    drawer.addEventListener('keydown', trap);
    return () => drawer.removeEventListener('keydown', trap);
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        ref={triggerRef}
        type="button"
        class={`mobile-nav-trigger${open ? ' open' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        <span class="hamburger-line" />
        <span class="hamburger-line" />
        <span class="hamburger-line" />
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div class="mobile-nav-overlay" onClick={close}>
          <div
            ref={drawerRef}
            class="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            onClick={(e) => e.stopPropagation()}
          >
            <nav>
              {links.map(({ href, label }) => (
                <a href={href} class="mobile-nav-link" onClick={close}>
                  {label}
                </a>
              ))}
              <a
                href={cvHref}
                download
                class="mobile-nav-cv"
                onClick={close}
              >
                CV ↓
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
