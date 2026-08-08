import { site, whatsappLink } from "@/lib/site";

/**
 * Acceso directo a WhatsApp.
 *
 * En Latinoamérica convierte bastante más que un formulario de contacto, pero
 * el globito verde flotante es un adorno de plantilla. Acá es una pestaña
 * rectangular anclada al borde, en el registro del resto del sitio.
 */
export function WhatsappFab() {
  if (!site.support.whatsapp) return null;

  return (
    <a
      href={whatsappLink(`Hola, quiero saber más sobre ${site.name}.`)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium shadow-[var(--shadow-md)] transition-colors hover:bg-surface-2"
    >
      <svg viewBox="0 0 24 24" className="size-4 text-accent" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.2 1.25-1.97 1.41-.53.11-1.21.2-3.51-.75-2.95-1.22-4.85-4.2-5-4.4-.14-.2-1.19-1.58-1.19-3.02s.75-2.14 1.02-2.44c.27-.29.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.59.83 2.03.9 2.18.07.14.12.31.02.51-.09.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.92 1.06.95 1.95 1.24 2.23 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.51.31.07.11.07.63-.17 1.31Z" />
      </svg>
      <span>Escribinos</span>
    </a>
  );
}
