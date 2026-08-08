import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { PRESETS } from "@/lib/presets";
import { site } from "@/lib/site";
import { getCurrentUser } from "@/server/auth";
import { listUserOrgs } from "@/server/context";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: `Probá ${site.name} gratis ${site.trialDays} días. Sin tarjeta, sin instalación.`,
  alternates: { canonical: "/registro" },
};

type Props = {
  searchParams: Promise<{ rubro?: string; plan?: string }>;
};

const promises = [
  `${site.trialDays} días gratis, sin tarjeta`,
  "Configurado para tu rubro en 5 minutos",
  "Exportás tus datos cuando quieras",
  "Cancelás sin llamar a nadie",
];

export default async function RegisterPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) {
    const orgs = await listUserOrgs(user.id);
    if (orgs[0]) redirect(`/app/${orgs[0].slug}`);
  }

  const { rubro } = await searchParams;
  const initialIndustry = PRESETS.some((p) => p.key === rubro)
    ? rubro!
    : null;

  return (
    <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
      {/* Columna de refuerzo — reduce el abandono en el formulario */}
      <aside className="hidden lg:block lg:pt-6">
        <h1 className="text-3xl font-bold leading-tight">
          Empezá a ordenar tu negocio
          <br />
          <span className="text-accent">en cinco minutos</span>
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          Elegí a qué te dedicás y el sistema queda configurado con los estados,
          los campos y el vocabulario de tu rubro. Sin plantillas genéricas.
        </p>

        <ul className="mt-8 space-y-3">
          {promises.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-fg-muted">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm leading-relaxed text-fg-muted">
            <strong className="text-fg">Sos de los primeros.</strong> A los
            primeros 20 negocios les queda un 40% de descuento de por vida, a
            cambio de que nos cuenten qué les sirve y qué no.
          </p>
        </div>
      </aside>

      <div className="w-full">
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <RegisterForm
            presets={PRESETS}
            initialIndustry={initialIndustry}
          />
        </div>

        <p className="mt-6 text-center text-sm text-fg-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Entrá acá
          </Link>
        </p>
      </div>
    </div>
  );
}
