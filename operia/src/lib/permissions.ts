import type { Role } from "@prisma/client";

/**
 * Matriz de permisos.
 *
 * Un único lugar donde vive la verdad sobre quién puede qué. La alternativa
 * —condicionales de rol repartidos por el código— garantiza que tarde o temprano
 * uno quede desactualizado y se abra un agujero.
 */

export const PERMISSIONS = [
  "job:read", "job:write", "job:delete",
  "contact:read", "contact:write", "contact:delete",
  "asset:read", "asset:write", "asset:delete",
  "product:read", "product:write", "product:delete",
  "doc:read", "doc:write", "doc:delete",
  "payment:read", "payment:write", "payment:delete",
  "appointment:read", "appointment:write", "appointment:delete",
  "report:read",
  "config:read", "config:write",
  "member:read", "member:write",
  "billing:read", "billing:write",
  "org:delete",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const READ_ONLY: Permission[] = [
  "job:read", "contact:read", "asset:read", "product:read",
  "doc:read", "payment:read", "appointment:read", "report:read",
];

const OPERATOR: Permission[] = [
  ...READ_ONLY,
  "job:write", "contact:write", "asset:write", "product:write",
  "doc:write", "payment:write", "appointment:write",
];

const MANAGER: Permission[] = [
  ...OPERATOR,
  "job:delete", "contact:delete", "asset:delete", "product:delete",
  "doc:delete", "payment:delete", "appointment:delete",
  "config:read", "config:write", "member:read", "member:write",
];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: [...MANAGER, "billing:read", "billing:write", "org:delete"],
  ADMIN: [...MANAGER, "billing:read"],
  MEMBER: OPERATOR,
  VIEWER: READ_ONLY,
};

export function permissionsFor(role: Role): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[role]);
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Dueño",
  ADMIN: "Administrador",
  MEMBER: "Colaborador",
  VIEWER: "Solo lectura",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: "Control total, incluida la suscripción y el cierre de la cuenta.",
  ADMIN: "Todo lo operativo y la configuración. No toca la suscripción.",
  MEMBER: "Carga y edita trabajos, contactos, documentos y pagos.",
  VIEWER: "Solo puede mirar. Ideal para tu contador o un socio.",
};
