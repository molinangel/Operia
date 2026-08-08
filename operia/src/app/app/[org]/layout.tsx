import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getCurrentUser } from "@/server/auth";
import { listUserOrgs, requirePageCtx } from "@/server/context";
import { db } from "@/server/db";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;

  // Si no hay sesión no se llega a requireCtx: se redirige antes.
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/app/${orgSlug}`);

  const ctx = await requirePageCtx(orgSlug);
  const [orgs, subscription] = await Promise.all([
    listUserOrgs(user.id),
    db.subscription.findUnique({ where: { orgId: ctx.orgId } }),
  ]);

  const reference = subscription?.trialEndsAt ?? subscription?.currentPeriodEnd;
  const daysLeft = reference
    ? Math.ceil((reference.getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <AppShell
      org={{
        slug: ctx.org.slug,
        name: ctx.org.name,
        jobLabelPlural: ctx.org.jobLabelPlural,
        assetLabelPlural: ctx.org.assetLabelPlural,
        useAssets: ctx.org.useAssets,
      }}
      orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      user={{ name: user.name, email: user.email }}
      subscription={
        subscription ? { status: subscription.status, daysLeft } : null
      }
    >
      {children}
    </AppShell>
  );
}
