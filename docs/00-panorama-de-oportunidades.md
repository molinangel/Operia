# Paneo global de oportunidades — Plataformas vendibles con ingreso recurrente

> Documento 00 de la serie. Objetivo: elegir **qué construir** antes de escribir una línea de código.
> Fecha de análisis: agosto 2026.

---

## 1. La pregunta correcta

No es "¿qué software puedo hacer?" sino:

> **¿Qué problema le duele tanto a un negocio que paga todos los meses por resolverlo, y que yo puedo vender sin presupuesto de marketing?**

Todo lo que sigue está filtrado por esa pregunta. Un solo desarrollador, sin capital, sin audiencia,
compitiendo contra SaaS globales con 50 ingenieros, **no gana por producto**. Gana por:

1. **Nicho angosto** — tan angosto que a los grandes no les conviene entrar.
2. **Localidad** — integración con la realidad fiscal/legal/cultural de un país concreto.
3. **Venta directa** — le vendés al dueño mirándolo a la cara, no con ads.
4. **Compra forzada** — el cliente compra porque *tiene que*, no porque le gusta.

---

## 2. Criterios de evaluación

Cada candidato se puntúa 1–5 en seis ejes:

| Eje | Qué mide |
|---|---|
| **Dolor** | ¿Cuánto sufre el cliente hoy? ¿Pierde plata / tiempo / se come una multa? |
| **Recurrencia** | ¿Justifica un abono mensual o es una compra única? |
| **Foso** | ¿Qué tan difícil es que otro me copie o que el cliente se vaya? |
| **Esfuerzo** | Inverso: 5 = MVP vendible en poco tiempo. |
| **Venta** | ¿Puedo cerrar clientes sin marketing pago? |
| **Techo** | ¿Hasta dónde escala el ingreso sin romperme? |

Umbral de decisión: **score total ≥ 22/30** y **Dolor ≥ 4**.

---

## 3. Los candidatos

### C1 — Facturación electrónica + gestión para PyMEs

**Qué es:** núcleo de facturación integrado con la autoridad fiscal (ARCA/AFIP en AR, SII en CL,
SAT en MX, Verifactu/TicketBAI en ES, DIAN en CO, SUNAT en PE) más clientes, productos, stock básico,
cuenta corriente y reportes.

- **Cliente:** comercio, servicios, profesionales independientes, distribuidores chicos.
- **Por qué ahora:** la obligatoriedad de facturación electrónica y de sistemas de facturación
  verificables se está cerrando en casi todos los mercados hispanos. En España, el reglamento
  antifraude / Verifactu empuja a todo el tejido de autónomos y PyMEs a cambiar de software **por ley**.
  Eso es demanda forzada, no demanda que hay que crear.
- **Ticket:** USD 15–60/mes por empresa. 100 clientes = USD 2.500–4.000/mes.
- **Foso:** ALTO. La integración fiscal (certificados, homologación, casos borde, notas de crédito,
  percepciones, regímenes especiales) es un pantano que nadie quiere cruzar dos veces. Y una vez que
  el cliente tiene dos años de comprobantes adentro, no se va.
- **Riesgo:** los cambios normativos te obligan a mantener para siempre. Es una hipoteca técnica.
- **Score:** Dolor 5 · Recurrencia 5 · Foso 5 · Esfuerzo 2 · Venta 4 · Techo 4 = **25/30**

---

### C2 — Vertical SaaS de gestión operativa para un rubro específico

**Qué es:** un sistema de gestión hecho a medida de **un solo rubro**. Ejemplos con dolor real:

| Rubro | Dolor concreto hoy |
|---|---|
| Talleres mecánicos | Órdenes de trabajo en papel, historial del vehículo perdido, presupuestos por WhatsApp sin registro |
| Veterinarias | Historia clínica, vacunatorio con vencimientos, recordatorios |
| Estudios contables | Vencimientos por cliente, pedido de documentación, seguimiento |
| Administradores de consorcios | Expensas, liquidaciones, reclamos, proveedores |
| Academias / escuelas de idiomas | Cursada, asistencia, cobro de cuotas, morosidad |
| Servicios de campo (plagas, refrigeración, ascensores) | Rutas, partes de trabajo, certificados, mantenimientos programados |
| Distribuidoras con reparto | Hoja de ruta, pedidos, cuenta corriente del cliente |

- **Ticket:** USD 25–120/mes según rubro.
- **Foso:** MEDIO-ALTO. El foso no es técnico, es de **conocimiento del rubro**. Cuando tu software
  habla el idioma exacto del taller mecánico, Excel y los genéricos pierden.
- **Riesgo:** elegir mal el rubro. Mitigación: validar con 5 entrevistas antes de codear.
- **Score:** Dolor 4 · Recurrencia 5 · Foso 4 · Esfuerzo 4 · Venta 5 · Techo 3 = **25/30**

---

### C3 — Agente de WhatsApp con IA (captación + atención + agenda)

**Qué es:** el número de WhatsApp del negocio atendido por un agente que responde consultas, califica
leads, agenda turnos y escala a un humano cuando corresponde. Vertical: inmobiliarias, clínicas,
concesionarias, gimnasios.

- **Ticket:** USD 60–300/mes (alto valor percibido: "reemplaza media recepcionista").
- **Foso:** BAJO-MEDIO. Técnicamente hoy lo arma cualquiera. El foso real es la **integración con el
  sistema del cliente** (su agenda, su stock, su CRM) y el conocimiento del vertical.
- **Riesgo:** mercado saturándose rápido; costos variables (WhatsApp Cloud API + tokens de LLM) que se
  comen el margen si no los controlás; dependencia de las políticas de Meta.
- **Score:** Dolor 4 · Recurrencia 5 · Foso 2 · Esfuerzo 4 · Venta 5 · Techo 4 = **24/30**

---

### C4 — Turnos + recordatorios automáticos

**Qué es:** agenda online, reserva desde link público, recordatorio por WhatsApp/SMS, cobro de seña.
Clientes: peluquerías, estética, consultorios, canchas, estudios de tatuajes.

- **Ticket:** USD 10–35/mes. Volumen alto, ticket bajo.
- **Foso:** BAJO. Hay decenas de competidores globales gratuitos o muy baratos.
- **Realidad:** es el producto que **todos** los devs eligen primero, y por eso está quemado.
- **Score:** Dolor 3 · Recurrencia 5 · Foso 1 · Esfuerzo 5 · Venta 4 · Techo 2 = **20/30** ❌

---

### C5 — Plataforma de cumplimiento documental (contratistas / RRHH / seguridad e higiene)

**Qué es:** una empresa grande contrata proveedores; por ley debe verificar que cada uno tenga seguros,
cobertura de riesgos de trabajo, aportes, habilitaciones y certificados al día. Hoy eso se hace con
carpetas compartidas y mails. La plataforma centraliza: el proveedor sube, el sistema valida
vencimientos, alerta y bloquea el ingreso del personal no habilitado.

- **Cliente:** industrias, obras, logística, plantas, shoppings, hospitales, mineras.
- **Ticket:** USD 200–1.500/mes por empresa contratante (paga la grande, la usan sus 80 proveedores).
- **Foso:** ALTO. Una vez que 80 proveedores están adentro, migrar es impensable. Además es un producto
  **aburrido** — nadie lo hace por hobby, hay poca competencia local.
- **Riesgo:** ciclo de venta largo (2–6 meses); necesitás un cliente ancla creíble.
- **Score:** Dolor 5 · Recurrencia 5 · Foso 5 · Esfuerzo 3 · Venta 3 · Techo 5 = **26/30** ⭐

---

### C6 — Portal para inmobiliarias (multiportal + CRM + alquileres)

**Qué es:** cargás una propiedad una vez y se publica en todos los portales; CRM de interesados;
gestión de contratos de alquiler con ajustes por índice; recibos y liquidación al propietario.

- **Ticket:** USD 40–150/mes.
- **Foso:** MEDIO. Pesan las integraciones con portales y el módulo de ajuste de alquileres.
- **Riesgo:** competidores locales ya consolidados en cada país.
- **Score:** Dolor 4 · Recurrencia 5 · Foso 3 · Esfuerzo 3 · Venta 4 · Techo 4 = **23/30**

---

### C7 — POS + stock para gastronomía / retail

- **Ticket:** USD 30–80/mes.
- **Realidad:** mercado muy competido, requiere hardware y soporte prácticamente 24/7: si se cae el POS
  el cliente no factura. Carga de soporte brutal para una persona sola.
- **Score:** Dolor 4 · Recurrencia 5 · Foso 3 · Esfuerzo 2 · Venta 3 · Techo 4 = **21/30** ❌

---

### C8 — Micro-SaaS global (dev tools / infra / nicho técnico)

- **Ticket:** USD 9–49/mes, mercado mundial, sin soporte presencial.
- **Realidad:** el producto es la parte fácil; la **distribución** es el problema. Sin audiencia previa
  la tasa de fracaso es altísima.
- **Score:** Dolor 3 · Recurrencia 5 · Foso 2 · Esfuerzo 4 · Venta 1 · Techo 5 = **20/30** ❌

---

### C9 — Modelo white-label / licencia por instalación

**Qué es:** no es un producto, es un **modelo de monetización** aplicable a C1/C2/C5/C6. Construís un
core multi-tenant y lo licenciás con la marca del revendedor (contadores, consultoras, agencias) que te
traen clientes a cambio de comisión.

- **Efecto:** multiplica la venta sin multiplicar tu esfuerzo comercial. Un contador con 120 clientes
  PyME es un canal, no un cliente.
- **Score:** aplicable como capa sobre cualquier candidato. **Recomendado adoptarlo desde el día uno.**

---

### C10 — Servicios a medida (desarrollo por proyecto)

- **Realidad:** paga rápido pero **no es ingreso fijo**: cuando dejás de trabajar, deja de entrar plata.
- **Uso correcto:** como **financiamiento puente** del producto, no como destino. Regla: todo proyecto a
  medida debe dejar un módulo reutilizable del producto principal.

---

## 4. Tabla comparativa

| # | Candidato | Dolor | Recur. | Foso | Esf. | Venta | Techo | **Total** |
|---|---|---|---|---|---|---|---|---|
| C5 | Cumplimiento documental | 5 | 5 | 5 | 3 | 3 | 5 | **26** ⭐ |
| C1 | Facturación + gestión PyME | 5 | 5 | 5 | 2 | 4 | 4 | **25** ⭐ |
| C2 | Vertical SaaS de un rubro | 4 | 5 | 4 | 4 | 5 | 3 | **25** ⭐ |
| C3 | Agente WhatsApp con IA | 4 | 5 | 2 | 4 | 5 | 4 | **24** |
| C6 | Portal inmobiliario | 4 | 5 | 3 | 3 | 4 | 4 | **23** |
| C7 | POS gastronomía | 4 | 5 | 3 | 2 | 3 | 4 | 21 |
| C4 | Turnos + recordatorios | 3 | 5 | 1 | 5 | 4 | 2 | 20 |
| C8 | Micro-SaaS global | 3 | 5 | 2 | 4 | 1 | 5 | 20 |

---

## 5. Recomendación

**La jugada de mayor expectativa no es elegir uno de los tres primeros — es combinarlos en una sola
arquitectura.**

```
        ┌─────────────────────────────────────────────┐
        │   NÚCLEO MULTI-TENANT (una sola base)       │
        │   auth · organizaciones · roles · billing   │
        │   clientes · documentos · notificaciones    │
        │   auditoría · reportes · API                │
        └──────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬───────────────┐
        ▼              ▼              ▼               ▼
   MÓDULO FISCAL   MÓDULO VERTICAL  MÓDULO WA      MÓDULO
   (facturación)   (rubro elegido)  (agente IA)   CUMPLIMIENTO
        C1              C2              C3             C5
```

**Por qué así:**

- Se construye **un solo producto** y se venden **cuatro propuestas de valor** distintas.
- Cada módulo nuevo sube el ticket del cliente que ya tenés (expansión = ingreso sin venta nueva).
- Si un vertical falla, el núcleo se recicla — no perdés el trabajo hecho.
- El módulo WhatsApp+IA es el **anzuelo comercial** (se demuestra en tres minutos y vende solo); el
  módulo fiscal/cumplimiento es el **ancla de retención** (nadie se va).

**Secuencia sugerida:**

| Fase | Qué se construye | Objetivo |
|---|---|---|
| 0 | Validación: 5–8 entrevistas con clientes reales del rubro | Confirmar dolor y precio |
| 1 | Núcleo multi-tenant + módulo vertical mínimo | 3 clientes pagando |
| 2 | Módulo WhatsApp/IA + facturación | Subir ticket, bajar churn |
| 3 | Canal (contadores / consultoras) + white-label | Escalar sin vender uno a uno |
| 4 | Segundo vertical sobre el mismo núcleo | Duplicar mercado con costo marginal bajo |

---

## 6. Economía unitaria — cuánto hace falta para "ingreso fijo"

Suponiendo un objetivo de **USD 2.000/mes netos**:

| Escenario | Ticket medio | Clientes necesarios | Dificultad |
|---|---|---|---|
| Turnos genérico (C4) | USD 15 | **133** | Muy alta |
| Vertical SaaS (C2) | USD 50 | **40** | Media |
| Vertical + fiscal + WhatsApp (combo) | USD 90 | **22** | Media |
| Cumplimiento documental (C5) | USD 500 | **4** | Alta por venta, baja por volumen |
| Mixto realista (2 de C5 + 20 combo) | — | 22 | **Recomendado** |

Costos fijos estimados del stack: USD 40–120/mes (hosting, base de datos, dominio, WhatsApp API, tokens
de IA) hasta unos 50 clientes. Margen bruto por encima del 90%.

**Conclusión numérica:** 20–25 clientes bien elegidos alcanzan el objetivo. No hacen falta 500. Eso
cambia por completo la estrategia: **venta artesanal, producto profundo, cero marketing masivo.**

---

## 7. Riesgos y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| Construir algo que nadie compra | Fase 0 obligatoria: cobrar antes de terminar (preventa / precio early adopter) |
| El soporte te consume la vida | Onboarding autoservicio, documentación, horario de atención, SLA escrito |
| Cambios normativos (módulo fiscal) | Aislar la integración fiscal detrás de una interfaz; presupuestar mantenimiento |
| Costos variables de IA / WhatsApp | Cuotas por plan, caché, modelos chicos para tareas simples |
| Dependencia de una sola persona | Documentación operativa (esta serie), infraestructura reproducible, backups automáticos |
| Cliente que no paga | Cobro por adelantado, débito automático, suspensión automática por mora |

---

## 8. Qué falta decidir

1. **Mercado / país** → define el módulo fiscal, la pasarela de pago y el marco legal.
2. **Vertical concreto** → define el módulo C2 y a quién le vendés primero.
3. **Modelo de ingreso** → SaaS mensual puro / licencia por instalación / híbrido con canal.
4. **Dedicación disponible** → define el tamaño del alcance de la Fase 1.

Respondidas esas cuatro, el resto de la serie (01 a 09) se genera completa: arquitectura, modelo de
datos, stack, plan de construcción por sprints, guion de ventas, contratos, precios, despliegue y
manual de operación.
