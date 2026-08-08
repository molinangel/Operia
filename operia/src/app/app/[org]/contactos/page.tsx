import Link from "next/link";
import { MessageCircle, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { NewContactDialog } from "@/components/app/new-contact-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/primitives";
import { whatsappLink } from "@/lib/site";
import { requirePageCtx } from "@/server/context";
import { contactsRepo, customFieldsRepo } from "@/server/repos/contacts";

type Props = {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function ContactsPage({ params, searchParams }: Props) {
  const { org: orgSlug } = await params;
  const { q } = await searchParams;
  const ctx = await requirePageCtx(orgSlug);

  const [{ items }, fieldDefs] = await Promise.all([
    contactsRepo.list(ctx, { search: q }),
    customFieldsRepo.list(ctx, "CONTACT"),
  ]);

  const canEdit = ctx.permissions.has("contact:write");
  const base = `/app/${orgSlug}`;

  const dialog = (
    <NewContactDialog
      orgSlug={orgSlug}
      customFields={fieldDefs.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: Array.isArray(f.options) ? (f.options as string[]) : [],
        required: f.required,
      }))}
    />
  );

  const isEmpty = items.length === 0 && !q;

  return (
    <>
      <PageHeader
        title="Contactos"
        description={
          items.length > 0 ? `${items.length} en la lista` : undefined
        }
        actions={canEdit ? dialog : undefined}
      />

      {isEmpty ? (
        <EmptyState
          icon={<Users className="size-7" />}
          title="Todavía no cargaste contactos"
          description="Acá viven tus clientes y proveedores, con todo su historial: qué trabajos les hiciste, qué documentos les mandaste y cuánto te deben."
          /* Enlace y no otro diálogo: dos instancias abrirían dos modales. */
          action={
            canEdit ? (
              <Button asChild>
                <Link href={`${base}/contactos?nuevo=1`}>Cargar el primero</Link>
              </Button>
            ) : undefined
          }
          hint="Consejo: cargá primero los 10 clientes que más te compran. El resto se van sumando solos a medida que trabajás."
        />
      ) : (
        <div className="p-5 sm:p-7">
          <form className="relative mb-5 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre, teléfono o email…"
              className="pl-9"
              aria-label="Buscar contactos"
            />
          </form>

          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-fg-muted">
              No encontramos contactos que coincidan con «{q}».
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
                    <th className="px-5 py-3 font-medium">Nombre</th>
                    <th className="hidden px-3 py-3 font-medium sm:table-cell">
                      Teléfono
                    </th>
                    <th className="hidden px-3 py-3 text-right font-medium md:table-cell">
                      Trabajos
                    </th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((contact) => (
                    <tr key={contact.id} className="transition hover:bg-surface-2">
                      <td className="px-5 py-3">
                        <Link
                          href={`${base}/contactos/${contact.id}`}
                          className="font-medium hover:text-accent"
                        >
                          {contact.name}
                        </Link>
                        {contact.isSupplier && (
                          <Badge className="ml-2">Proveedor</Badge>
                        )}
                        <span className="block text-xs text-fg-subtle sm:hidden">
                          {contact.phone}
                        </span>
                      </td>
                      <td className="hidden px-3 py-3 text-fg-muted sm:table-cell">
                        {contact.phone ?? "—"}
                      </td>
                      <td className="hidden px-3 py-3 text-right tabular-nums text-fg-muted md:table-cell">
                        {contact._count.jobs}
                      </td>
                      <td className="pr-4 text-right">
                        {contact.phone && (
                          <a
                            href={whatsappLink(
                              `Hola ${contact.name}, te escribimos de ${ctx.org.name}.`,
                              contact.phone.replace(/\D/g, ""),
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Escribir a ${contact.name} por WhatsApp`}
                            className="inline-flex rounded-lg p-1.5 text-fg-subtle transition hover:bg-success-soft hover:text-success"
                          >
                            <MessageCircle className="size-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
