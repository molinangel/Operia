# 09 — Despliegue, operación y continuidad

> Objetivo: que el sistema funcione solo el 99% del tiempo y que el 1% restante sea manejable por una
> sola persona desde el celular.

---

## 1. Entornos

| Entorno | Dónde | Base de datos | Para qué |
|---|---|---|---|
| **Local** | Tu máquina | Neon (rama de desarrollo) | Desarrollo diario |
| **Vista previa** | Vercel (por rama) | Neon (rama de vista previa) | Probar antes de publicar |
| **Producción** | Vercel | Neon (rama principal) | Clientes reales |

Neon tiene ramas de base de datos: se crea una copia instantánea de producción para probar migraciones
sin riesgo. Es la razón principal para elegirlo sobre alternativas.

---

## 2. Despliegue Fase 1 — Vercel + Neon

**Por qué:** cero administración de servidores mientras validás. Tu tiempo vale más que los USD 20/mes
que ahorrarías con un VPS, y un servidor caído a las 3 AM en la semana 8 puede terminar el proyecto.

| Servicio | Plan | Costo |
|---|---|---|
| Vercel | Hobby → Pro al tener clientes | USD 0 → 20/mes |
| Neon | Free → Launch | USD 0 → 19/mes |
| Cloudflare R2 | 10 GB gratis | USD 0 → ~5/mes |
| Resend | 3.000 emails/mes gratis | USD 0 → 20/mes |
| Dominio | .com | ~USD 12/año |
| **Total inicial** | | **~USD 1/mes** |
| **Con 30 clientes** | | **~USD 65/mes** |

### Pasos

1. Repositorio en GitHub (privado).
2. Importar el proyecto en Vercel.
3. Cargar las variables de entorno (documento 10).
4. Configurar el dominio y el DNS.
5. Activar el cron de Vercel apuntando a `/api/cron/tick` cada 5 minutos.
6. Comando de construcción: `prisma generate && prisma migrate deploy && next build`.

### Regla de despliegue

**Nunca desplegar a producción un viernes ni después de las 18 h.** Si algo se rompe, se rompe cuando
tenés tiempo y cabeza para arreglarlo.

---

## 3. Despliegue Fase 2 — VPS (cuando el costo lo justifique)

A partir de ~USD 80/mes en servicios gestionados, un VPS de USD 15/mes hace lo mismo. Preparado desde
el día uno para que la migración sea de un día, no de un mes.

```yaml
# docker/docker-compose.yml
services:
  app:
    build: ..
    restart: unless-stopped
    env_file: ../.env.production
    depends_on: [db]

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: operia
    volumes:
      - pgdata:/var/lib/postgresql/data

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  backup:
    image: postgres:17-alpine
    restart: unless-stopped
    entrypoint: /bin/sh -c "while true; do /backup.sh; sleep 86400; done"
    volumes:
      - ./backup.sh:/backup.sh:ro

volumes: { pgdata: , caddy_data: }
```

Caddy resuelve HTTPS con certificados automáticos sin configuración. Proveedores recomendados: Hetzner
(el mejor precio/rendimiento) o Contabo. **Verificá que acepten tu método de pago antes de planificar
la migración.**

---

## 4. Respaldos: la parte que no se puede improvisar

> **Un respaldo que nunca se restauró no es un respaldo. Es una esperanza.**

| Nivel | Qué | Frecuencia | Retención |
|---|---|---|---|
| 1 | Respaldo automático de Neon (point-in-time) | Continuo | 7–30 días según plan |
| 2 | `pg_dump` completo a R2, cifrado | Diario, 3 AM | 30 días |
| 3 | Copia semanal a un disco tuyo, fuera de la nube | Semanal | 6 meses |
| 4 | Archivos de R2 con versionado activado | Continuo | 30 días |

### Prueba de restauración — obligatoria

**El primer día de cada mes**, sin excepción:

1. Crear una rama nueva en Neon desde el respaldo.
2. Levantar la aplicación apuntando a esa rama.
3. Entrar, verificar que los datos están completos.
4. Anotar en `OPERACIONES.md`: fecha, resultado, tiempo que tomó.
5. Borrar la rama.

Toma 20 minutos y es lo único que separa un incidente de una catástrofe.

---

## 5. Monitoreo mínimo

| Qué | Herramienta | Alerta |
|---|---|---|
| ¿El sitio está arriba? | UptimeRobot (gratis) | Email + push si cae 2 min |
| Errores de la aplicación | Sentry (capa gratuita) | Email en error nuevo |
| Cola trabada | Consulta propia en `/admin` | Aviso si hay trabajos con más de 3 intentos |
| Espacio y límites | Panel de Neon y R2 | Revisión semanal |
| Certificado del dominio | Automático (Vercel/Caddy) | — |

**Endpoint de salud** `/api/health`: verifica base de datos, almacenamiento y cola. Es lo que consulta
UptimeRobot.

---

## 6. Rutina de operación

### Diaria (10 minutos)
- [ ] Revisar `/admin`: pagos pendientes de confirmar
- [ ] Errores nuevos en Sentry
- [ ] Mensajes fallidos en la cola
- [ ] WhatsApp de soporte

### Semanal (30 minutos)
- [ ] Métricas: MRR, altas, bajas, activación
- [ ] Clientes con poca actividad → contactar **antes** de que se den de baja
- [ ] Revisar el backlog y planificar el sprint
- [ ] `npm audit`

### Mensual (2 horas)
- [ ] **Prueba de restauración de respaldo**
- [ ] Actualizar dependencias
- [ ] Revisar costos de infraestructura
- [ ] Cerrar el mes: MRR, churn, comisiones de canal
- [ ] Escribir a los 5 clientes más activos y a los 5 menos activos

---

## 7. Plan de incidentes

| Severidad | Ejemplo | Respuesta |
|---|---|---|
| **S1 — Caído** | Nadie puede entrar | Inmediata. Avisar por WhatsApp a todos antes de que pregunten |
| **S2 — Función crítica rota** | No se generan documentos | Mismo día |
| **S3 — Función secundaria** | Un reporte da mal | 48 h |
| **S4 — Cosmético** | Un texto mal alineado | Próximo sprint |

**Protocolo S1:**
1. Confirmar el alcance (¿todos o uno?).
2. **Avisar antes de arreglar.** Un mensaje honesto de "estamos trabajando en esto" vale más que
   arreglarlo callado. El cliente perdona la caída; no perdona el silencio.
3. Arreglar. Si es una publicación reciente que rompió algo: revertir primero, investigar después.
4. Avisar que está resuelto.
5. Escribir qué pasó y qué se hizo para que no se repita.

**Contenido del mensaje de incidente:** qué pasó, a quién afecta, qué estás haciendo, cuándo volvés a
informar. Nada de tecnicismos, nada de excusas.

---

## 8. Continuidad: el riesgo de estar solo

Este es el riesgo estructural del proyecto y hay que tratarlo como tal.

| Riesgo | Mitigación |
|---|---|
| Te enfermás una semana | Sistema autónomo, avisos automáticos, mensaje de ausencia publicado |
| Perdés tu computadora | Todo en GitHub y en la nube. **Nada crítico solo en local.** Probado, no supuesto |
| Perdés acceso a una cuenta | Gestor de contraseñas + códigos de recuperación de 2FA impresos y guardados físicamente |
| Te querés retirar | Documentación completa (esta serie) = el negocio es vendible. Un SaaS con 40 clientes y documentación se vende entre 20 y 40 meses de MRR |
| Alguien tiene que continuarlo | `docs/` + `README` + `OPERACIONES.md` permiten que otro desarrollador tome el proyecto |

**`OPERACIONES.md`** — archivo vivo con:
- Inventario de todos los servicios y qué hace cada uno
- Dónde está cada credencial (no la credencial, el **dónde**)
- Fechas de renovación de dominio y servicios
- Registro de incidentes y sus resoluciones
- Registro de pruebas de restauración
- Contactos: proveedores, contador, abogado

---

## 9. Seguridad operativa

- [ ] 2FA en **todas** las cuentas: GitHub, Vercel, Neon, dominio, correo, banco
- [ ] Gestor de contraseñas (Bitwarden gratis), contraseñas únicas
- [ ] Códigos de recuperación impresos, guardados fuera de la computadora
- [ ] `.env` nunca en el repositorio — verificar `.gitignore` antes del primer commit
- [ ] Rotación de secretos cada 6 meses
- [ ] Acceso a producción solo desde tu máquina, nunca desde una computadora ajena
- [ ] Revisar `npm audit` antes de cada publicación
- [ ] Registro de auditoría activo y consultable

---

## 10. Cuándo escalar, y cómo

Señales concretas y qué hacer con cada una:

| Señal | Acción |
|---|---|
| Consultas de más de 500 ms | Revisar índices, agregar los que falten |
| Base de datos > 5 GB | Plan pago de Neon o migrar a VPS |
| Cron tardando más de 60 s | Separar el procesamiento de la cola a un worker propio |
| Más de 20 clientes | Contratar a alguien 10 h/semana para soporte de primer nivel |
| Más de 50 clientes | Segunda persona para desarrollo |
| Más de 100 clientes | Réplica de lectura y caché |

**No optimices antes de que aparezca la señal.** Cada optimización prematura es tiempo que no dedicaste
a conseguir clientes, que es lo único que importa en el primer año.

---

## Siguiente paso

Documento 10: el checklist de cuentas, credenciales y pasos manuales — lo único que no puedo hacer yo.
