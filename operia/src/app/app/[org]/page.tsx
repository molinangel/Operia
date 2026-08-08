import Link from "next/link";
import {
  ArrowRight, ClipboardList, Clock, TriangleAlert, Users, Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { EmptyState, StatCard } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { requirePageCtx, vocab } from "@/server/context";
import { contactsRepo } from "@/server/repos/contacts";
import { jobsRepo } from "@/server/repos/jobs";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const ctx = await requirePageCtx(orgSlug);
  const v = vocab(ctx.org);

  const [stats, recent, contactCount] = await Promise.all([
    jobsRepo.dashboardStats(ctx),
    jobsRepo.recent(ctx, 6),
    contactsRepo.count(ctx),
  ]);

  const base = `/app/${orgSlug}`;
  const isNew = stats.open === 0 && recent.length === 0;

  return (
    <>
      <PageHeader
        title={`Hola${ctx.user.name ? `, ${ctx.user.name.split(" ")[0]}` : ""}`}
        description={`Así viene ${ctx.org.name} hoy.`}
        actions={
          <Button asChild>
            <Link href={`${base}/trabajos?nuevo=1`}>
              Crear {v.job.toLowerCase()}
            </Link>
          </Button>
        }
      />

      {isNew ? (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title="Tu cuenta ya está configurada"
          description={`Los estados, los campos y los documentos de tu rubro ya están listos. Lo único que falta sos vos: cargá lo que tenés abierto hoy y vas a ver cómo funciona todo junto.`}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href={`${base}/trabajos?nuevo=1`}>
                  Crear {v.job.toLowerCase()}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`${base}/contactos?nuevo=1`}>Cargar un cliente</Link>
              </Button>
            </div>
          }
          hint="Consejo: empezá por lo que tenés abierto ahora mismo. En 10 minutos el tablero refleja tu semana real."
        />
      ) : (
        <div className="space-y-6 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Abiertos"
              value={stats.open}
              sub={`${v.jobs.toLowerCase()} en curso`}
              tone="accent"
            />
            <StatCard
              label="Vencidos"
              value={stats.overdue}
              sub="pasaron su fecha límite"
              tone={stats.overdue > 0 ? "danger" : "neutral"}
            />
            <StatCard
              label="Terminados este mes"
              value={stats.completedThisMonth}
            />
            <StatCard
              label="Por cobrar"
              value={formatMoney(stats.pendingCents, ctx.org.currency)}
              sub="de trabajos entregados"
              tone={stats.pendingCents > 0 ? "warning" : "success"}
            />
          </div>

          {/* Distribución por estado */}
          <section className="rounded-[2px] border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">
                {v.jobs} por estado
              </h2>
              <Link
                href={`${base}/trabajos`}
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                Ver tablero <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.statuses.map((status) => (
                <Link
                  key={status.id}
                  href={`${base}/trabajos?estado=${status.id}`}
                  className="flex items-center gap-3 rounded-[2px] border border-border bg-surface-2 px-3.5 py-3 transition hover:border-border-strong"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {status.name}
                  </span>
                  <span className="font-display text-lg font-bold">
                    {status._count.jobs}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Actividad reciente */}
            <section className="rounded-[2px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-semibold">Movimiento reciente</h2>
              </div>
              <ul className="divide-y divide-border">
                {recent.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`${base}/trabajos/${job.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-2"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: job.status.color }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {job.title}
                        </span>
                        <span className="block truncate text-xs text-fg-subtle">
                          {job.code}
                          {job.contact && ` · ${job.contact.name}`}
                          {job.asset && ` · ${job.asset.label}`}
                        </span>
                      </span>
                      <Badge className="shrink-0">{job.status.name}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Accesos rápidos */}
            <section className="space-y-3">
              <QuickLink
                href={`${base}/contactos`}
                icon={<Users className="size-4" />}
                title="Contactos"
                sub={`${contactCount} cargados`}
              />
              <QuickLink
                href={`${base}/cobros/deudores`}
                icon={<Wallet className="size-4" />}
                title="Quién me debe"
                sub={formatMoney(stats.pendingCents, ctx.org.currency)}
              />
              <QuickLink
                href={`${base}/trabajos?vencidos=1`}
                icon={<TriangleAlert className="size-4" />}
                title="Vencidos"
                sub={`${stats.overdue} ${v.jobs.toLowerCase()}`}
              />
              <QuickLink
                href={`${base}/agenda`}
                icon={<Clock className="size-4" />}
                title="Agenda"
                sub="Próximas citas"
              />
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function QuickLink({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[2px] border border-border bg-surface px-4 py-3.5 transition hover:border-border-strong"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-fg-subtle">{sub}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-fg-subtle" />
    </Link>
  );
}
