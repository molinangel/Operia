import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 glow opacity-50" aria-hidden />

      <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/">
          <Logo className="h-7 w-auto" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        {children}
      </main>

      <footer className="relative px-5 py-6 text-center text-xs text-fg-subtle sm:px-8">
        <Link href="/terminos" className="hover:text-fg">
          Términos
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacidad" className="hover:text-fg">
          Privacidad
        </Link>
      </footer>
    </div>
  );
}
