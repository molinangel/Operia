import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 dentro de la aplicación.
 *
 * Se llega acá tanto si la organización no existe como si existe pero el
 * usuario no es miembro. Es deliberado: distinguir ambos casos le confirmaría
 * a un atacante qué organizaciones existen.
 */
export default function AppNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-fg-subtle">
          <SearchX className="size-7" />
        </div>
        <h1 className="text-2xl font-bold">No encontramos esta página</h1>
        <p className="mt-3 leading-relaxed text-fg-muted">
          Puede que el enlace esté mal, que el registro se haya archivado o que
          esta cuenta no sea tuya.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Entrar con otra cuenta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
