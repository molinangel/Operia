import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8">
        <Logo className="h-8 w-auto" />
      </Link>
      <p className="font-mono text-sm text-fg-subtle">404</p>
      <h1 className="mt-2 text-3xl font-bold">Esta página no existe</h1>
      <p className="mt-3 max-w-sm leading-relaxed text-fg-muted">
        El enlace que seguiste no lleva a ninguna parte. Puede que haya
        cambiado o que tenga un error de tipeo.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/precios">Ver {site.name}</Link>
        </Button>
      </div>
    </div>
  );
}
