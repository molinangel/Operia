import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { listUserOrgs } from "@/server/context";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Si ya hay sesión, no tiene sentido mostrar el formulario.
  const user = await getCurrentUser();
  if (user) {
    const orgs = await listUserOrgs(user.id);
    redirect(orgs[0] ? `/app/${orgs[0].slug}` : "/registro/negocio");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Entrá a tu cuenta</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Bienvenido de vuelta. Retomá donde lo dejaste.
        </p>
      </div>

      <div className="mt-8 rounded-[2px] border border-border bg-surface p-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-fg-muted">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-accent hover:underline">
          Probalo gratis
        </Link>
      </p>
    </div>
  );
}
