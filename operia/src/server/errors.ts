/**
 * Errores de dominio.
 *
 * Se usan clases en lugar de strings sueltos para que el borde de la aplicación
 * pueda mapearlos a respuestas consistentes sin adivinar. Nunca se expone un
 * stack trace ni un mensaje de Prisma al usuario final.
 */

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/**
 * Se usa TAMBIÉN cuando el recurso existe pero pertenece a otra organización.
 * Devolver 403 en ese caso confirmaría su existencia a un atacante: 404 no.
 */
export class NotFoundError extends AppError {
  constructor(message = "No encontramos lo que buscabas.") {
    super(message, "not_found", 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tenés permiso para hacer esto.") {
    super(message, "forbidden", 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Necesitás iniciar sesión.") {
    super(message, "unauthorized", 401);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Revisá los datos ingresados.",
    readonly fields?: Record<string, string>,
  ) {
    super(message, "validation", 400);
  }
}

export class LimitExceededError extends AppError {
  constructor(message: string) {
    super(message, "limit_exceeded", 402);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ese registro ya existe.") {
    super(message, "conflict", 409);
  }
}

/** Resultado uniforme de las Server Actions. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; fields?: Record<string, string> };

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ValidationError) {
    return { ok: false, error: error.message, code: error.code, fields: error.fields };
  }
  if (error instanceof AppError) {
    return { ok: false, error: error.message, code: error.code };
  }
  // Un error inesperado se registra completo pero se comunica de forma genérica.
  console.error("[error inesperado]", error);
  return {
    ok: false,
    error: "Algo salió mal de nuestro lado. Probá de nuevo en un momento.",
    code: "internal",
  };
}
