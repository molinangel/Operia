"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2, CalendarDays, ChevronsUpDown, FileText, LayoutGrid, LogOut,
  Menu, Package, Settings, Users, Wallet, X, ChartNoAxesColumn,
} from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/primitives";
import { logoutAction } from "@/server/actions/auth";
import { cn, initials } from "@/lib/utils";

export type ShellOrg = {
  slug: string;
  name: string;
  jobLabelPlural: string;
  assetLabelPlural: string;
  useAssets: boolean;
};

export type ShellUser = { name: string | null; email: string };

export type ShellSubscription = {
  status: string;
  daysLeft: number | null;
};

export function AppShell({
  org,
  orgs,
  user,
  subscription,
  children,
}: {
  org: ShellOrg;
  orgs: Array<{ slug: string; name: string }>;
  user: ShellUser;
  subscription: ShellSubscription | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgMenu, setOrgMenu] = useState(false);

  const base = `/app/${org.slug}`;

  const nav = [
    { href: base, label: "Inicio", icon: LayoutGrid, exact: true },
    { href: `${base}/trabajos`, label: org.jobLabelPlural, icon: FileText },
    { href: `${base}/contactos`, label: "Contactos", icon: Users },
    ...(org.useAssets
      ? [{ href: `${base}/activos`, label: org.assetLabelPlural, icon: Building2 }]
      : []),
    { href: `${base}/agenda`, label: "Agenda", icon: CalendarDays },
    { href: `${base}/cobros`, label: "Cobros", icon: Wallet },
    { href: `${base}/catalogo`, label: "Catálogo", icon: Package },
    { href: `${base}/reportes`, label: "Reportes", icon: ChartNoAxesColumn },
    { href: `${base}/config`, label: "Configuración", icon: Settings },
  ];

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Selector de organización */}
      <div className="relative border-b border-border p-3">
        <button
          type="button"
          onClick={() => setOrgMenu((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-[2px] px-2 py-2 text-left transition hover:bg-surface-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-accent text-sm font-bold text-accent-fg">
            {initials(org.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{org.name}</span>
            <span className="block truncate text-xs text-fg-subtle">
              {org.slug}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-fg-subtle" />
        </button>

        {orgMenu && (
          <div className="absolute inset-x-3 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-surface">
            {orgs.map((o) => (
              <Link
                key={o.slug}
                href={`/app/${o.slug}`}
                onClick={() => setOrgMenu(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-surface-2",
                  o.slug === org.slug && "bg-accent-soft text-accent",
                )}
              >
                <span className="flex size-6 items-center justify-center rounded bg-surface-2 text-[10px] font-bold">
                  {initials(o.name)}
                </span>
                <span className="truncate">{o.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-[2px] px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Estado de la suscripción */}
      {subscription && subscription.status === "TRIAL" && (
        <div className="mx-3 mb-3 rounded-[2px] border border-accent/30 bg-accent-soft p-3">
          <p className="text-xs font-semibold text-accent">
            {subscription.daysLeft !== null && subscription.daysLeft > 0
              ? `Te quedan ${subscription.daysLeft} días de prueba`
              : "Tu prueba terminó"}
          </p>
          <Link
            href={`${base}/config/suscripcion`}
            className="mt-1.5 inline-block text-xs text-fg-muted underline-offset-2 hover:underline"
          >
            Ver planes y activar
          </Link>
        </div>
      )}

      {/* Usuario */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
            {initials(user.name ?? user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {user.name ?? "Sin nombre"}
            </span>
            <span className="block truncate text-xs text-fg-subtle">
              {user.email}
            </span>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="rounded-[2px] p-1.5 text-fg-subtle transition hover:bg-surface-2 hover:text-danger"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Barra lateral fija en escritorio */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Cajón en móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="rounded-[2px] p-2 text-fg-muted transition hover:bg-surface-2 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="lg:hidden">
            <Logo className="h-6 w-auto" />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {subscription?.status === "TRIAL" && (
              <Badge tone="accent" className="hidden sm:inline-flex">
                Prueba
              </Badge>
            )}
            {subscription?.status === "PAST_DUE" && (
              <Badge tone="warning">Pago pendiente</Badge>
            )}
            {subscription?.status === "SUSPENDED" && (
              <Badge tone="danger">Cuenta suspendida</Badge>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/** Cabecera de página, uniforme en toda la aplicación. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-fg-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cerrar"
      className="rounded-[2px] p-1.5 text-fg-subtle transition hover:bg-surface-2 hover:text-fg"
    >
      <X className="size-4" />
    </button>
  );
}
