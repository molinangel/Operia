# 10 — Checklist de cuentas, credenciales y pasos manuales

> **Este documento lista lo único que no puedo hacer yo.** Todo lo demás — el código, la configuración,
> las plantillas, la landing — se construye sin que tengas que intervenir.

---

## ⚠️ Regla de seguridad sobre las credenciales

**Nunca pegues una credencial en el chat.** Ni acá, ni en ninguna conversación con una IA, ni en un
correo, ni en un mensaje.

El procedimiento correcto es siempre el mismo:

1. Creás la cuenta y copiás la credencial.
2. La pegás **vos** en el archivo `.env.local` del proyecto.
3. Me decís *"ya está la de Neon"* — con eso me alcanza para continuar.

`.env.local` está en `.gitignore`, así que nunca sale de tu máquina. Para producción, las mismas
variables se cargan en el panel de Vercel.

Si alguna credencial se filtró alguna vez en algún lado: **rotala inmediatamente**. Todas las
plataformas de esta lista permiten regenerar claves en un clic.

---

## FASE A — Imprescindibles para que el proyecto arranque

Sin estas tres, no hay aplicación. Tiempo total: **~25 minutos.**

### A1 · Base de datos — Neon

| | |
|---|---|
| **Para qué** | La base de datos PostgreSQL donde vive todo |
| **Costo** | Gratis (0.5 GB, suficiente para los primeros ~15 clientes) |
| **Registro** | https://neon.tech — con GitHub o Google |

**Pasos:**
1. Crear cuenta.
2. **Create project** → nombre `operia`, región **US East (Ohio)** (la más cercana con mejor latencia
   a Latinoamérica).
3. Copiar la cadena de conexión que aparece (empieza con `postgresql://`).
4. Pegarla en `.env.local` como `DATABASE_URL`.
5. Copiar también la variante **pooled** si la ofrece → `DATABASE_URL_UNPOOLED` para migraciones.

---

### A2 · Secreto de sesión — generado localmente

| | |
|---|---|
| **Para qué** | Firmar las cookies de sesión |
| **Costo** | — |

Ejecutá en la terminal del proyecto y pegá el resultado en `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### A3 · Repositorio — GitHub

| | |
|---|---|
| **Para qué** | Guardar el código, desplegar desde ahí, no perderlo nunca |
| **Costo** | Gratis |
| **Registro** | https://github.com |

**Pasos:**
1. Crear cuenta si no la tenés.
2. **Activar 2FA** (obligatorio, no lo dejes para después).
3. Crear un repositorio **privado** llamado `operia`.
4. Decime la URL y yo configuro el remoto y el primer push.

---

## FASE B — Para publicar en internet (semana 1–2)

### B1 · Hosting — Vercel

| | |
|---|---|
| **Para qué** | Que la aplicación esté online con HTTPS y despliegue automático |
| **Costo** | Gratis para empezar. USD 20/mes cuando tengas clientes |
| **Registro** | https://vercel.com — **entrá con GitHub** |

**Pasos:**
1. Cuenta con GitHub.
2. **Add New → Project** → importar `operia`.
3. En **Environment Variables**, pegar todas las de `.env.local`.
4. Deploy.
5. Anotar la URL que te da (`operia.vercel.app`) → va a `NEXT_PUBLIC_APP_URL`.

---

### B2 · Dominio

| | |
|---|---|
| **Para qué** | Credibilidad y SEO. Nadie le paga a un `.vercel.app` |
| **Costo** | USD 10–15/año |
| **Dónde** | Namecheap, Porkbun o Cloudflare Registrar (el más barato) |

**Pasos:**
1. Elegir el nombre (verificá que el `.com` esté libre antes de decidir la marca).
2. Comprarlo.
3. En Vercel: **Settings → Domains** → agregar el dominio.
4. Copiar los registros DNS que indica Vercel al panel del proveedor.
5. Esperar la propagación (5 min a 2 h).

> **Si el pago internacional es un obstáculo:** Porkbun y Cloudflare aceptan PayPal. Como alternativa,
> se puede empezar con el subdominio de Vercel y comprar el dominio con el primer cobro. No es ideal
> para SEO, pero no bloquea nada.

---

### B3 · Almacenamiento de archivos — Cloudflare R2

| | |
|---|---|
| **Para qué** | Logos, adjuntos de trabajos, PDF, comprobantes de pago |
| **Costo** | 10 GB gratis, sin costo de salida de datos |
| **Registro** | https://dash.cloudflare.com |

**Pasos:**
1. Cuenta en Cloudflare.
2. **R2 → Create bucket** → nombre `operia-files`.
3. **Manage R2 API Tokens → Create API Token** con permiso *Object Read & Write*.
4. Copiar y pegar en `.env.local`:
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - Account ID → `R2_ACCOUNT_ID`
   - Nombre del bucket → `R2_BUCKET`

> Requiere una tarjeta para verificación aunque el uso sea gratuito. **Alternativa si no tenés
> tarjeta:** Supabase Storage (1 GB gratis, sin tarjeta). Decime cuál usás y ajusto el adaptador —
> el código de almacenamiento está aislado detrás de una interfaz justamente por esto.

---

### B4 · Correo transaccional — Resend

| | |
|---|---|
| **Para qué** | Verificación de email, recuperación de contraseña, avisos de vencimiento |
| **Costo** | 3.000 emails/mes gratis |
| **Registro** | https://resend.com |

**Pasos:**
1. Crear cuenta.
2. **API Keys → Create** → copiar a `RESEND_API_KEY`.
3. **Domains → Add Domain** → tu dominio → agregar los registros DNS (SPF, DKIM) donde compraste el
   dominio.
4. Esperar la verificación.
5. `EMAIL_FROM` = `Operia <hola@tudominio.com>`

> Sin dominio verificado, Resend solo envía a tu propia dirección. Suficiente para desarrollo.

---

## FASE C — Para vender (semana 6+)

### C1 · Cobros

No requiere ninguna integración técnica en Fase 1 (ver documento 07). Lo que sí necesitás tener listo:

- [ ] Wallet de USDT (TRC-20). Binance sirve.
- [ ] Cuenta de Binance verificada y P2P probado con un monto chico.
- [ ] Datos de pago móvil / transferencia local.
- [ ] Esos datos cargados en la variable `PAYMENT_INSTRUCTIONS` (texto libre, se muestra al cliente).

### C2 · WhatsApp Business

- [ ] Número dedicado al negocio (no tu personal).
- [ ] WhatsApp Business instalado, con perfil, catálogo y respuestas rápidas.
- [ ] Número en `NEXT_PUBLIC_SUPPORT_WHATSAPP` (formato E.164, sin `+`).

> La WhatsApp Cloud API (envío automático) es de Fase 2 y requiere verificación de empresa con Meta.
> Se documenta cuando llegue el momento; **no la necesitás para lanzar.**

### C3 · Analítica y SEO

| Servicio | Para qué | Costo |
|---|---|---|
| **Google Search Console** | Ver qué búsquedas te encuentran. **Imprescindible para el SEO** | Gratis |
| **Plausible** o **Umami** | Analítica sin cookies (sin banner molesto) | Umami autoalojado: gratis |

**Search Console:** https://search.google.com/search-console → agregar propiedad → verificar por DNS →
enviar el sitemap (`tudominio.com/sitemap.xml`, generado automáticamente).

### C4 · Monitoreo

| Servicio | Para qué | Costo |
|---|---|---|
| **UptimeRobot** | Avisarte si el sitio se cae | Gratis |
| **Sentry** | Ver los errores que sufren tus usuarios | Gratis hasta 5.000/mes |

---

## Resumen: qué hacer y cuándo

| Cuándo | Qué | Tiempo |
|---|---|---|
| **Ahora** | Neon (A1), secreto (A2), GitHub (A3) | 25 min |
| Semana 1 | Vercel (B1) | 10 min |
| Semana 2 | Dominio (B2), R2 (B3), Resend (B4) | 45 min |
| Semana 6 | Cobros (C1), WhatsApp (C2) | 1 h |
| Semana 8 | Search Console, analítica, monitoreo (C3, C4) | 30 min |

**Total de intervención manual en todo el proyecto: unas 3 horas.** Todo lo demás lo construimos.

---

## Plantilla de `.env.local`

El archivo `.env.example` del proyecto tiene esto con todos los comentarios. Copialo a `.env.local` y
completá lo que vayas consiguiendo:

```bash
# ── A1 · Base de datos (Neon) ──────────────────────────────
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# ── A2 · Sesiones ──────────────────────────────────────────
AUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# ── B1 · Aplicación ────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Operia"

# ── B3 · Almacenamiento (Cloudflare R2) ────────────────────
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="operia-files"
R2_PUBLIC_URL=""

# ── B4 · Email (Resend) ────────────────────────────────────
RESEND_API_KEY=""
EMAIL_FROM="Operia <hola@tudominio.com>"

# ── C1 · Cobros ────────────────────────────────────────────
PAYMENT_INSTRUCTIONS=""

# ── C2 · Soporte ───────────────────────────────────────────
NEXT_PUBLIC_SUPPORT_WHATSAPP="58412..."

# ── Administración ─────────────────────────────────────────
ADMIN_EMAILS="tucorreo@ejemplo.com"
CRON_SECRET=""
```

---

## Si algo te bloquea

| Problema | Alternativa |
|---|---|
| Neon rechaza el registro | Supabase (Postgres gratis, sin tarjeta) |
| No podés pagar el dominio | Empezar con el subdominio de Vercel, comprarlo con el primer cobro |
| R2 pide tarjeta | Supabase Storage |
| Vercel te limita | Railway, Render o VPS (documento 09, Fase 2) |

**Ninguno de estos bloqueos detiene el proyecto.** Todos tienen alternativa gratuita, y el código está
diseñado con adaptadores para que cambiar de proveedor sea cuestión de una variable de entorno.
