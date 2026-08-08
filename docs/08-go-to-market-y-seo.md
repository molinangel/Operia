# 08 — Go-to-market: landing, SEO, venta y soporte

> El producto no es el problema. **Conseguir los primeros 20 clientes es el problema.** Este documento
> es tan importante como todos los técnicos juntos.

---

## PARTE A — La landing y el SEO

## 1. Estrategia: SEO programático por rubro y por país

La jugada central es simple y muy potente:

> **Una plantilla de landing × 8 rubros × 6 países = 48 páginas indexables**, cada una apuntando a una
> búsqueda concreta que hace gente que ya está buscando comprar.

Nadie busca "software de gestión configurable multi-tenant". Buscan:

- `software para taller mecánico`
- `programa para veterinarias Venezuela`
- `sistema de órdenes de trabajo para servicio técnico`
- `app para gestionar reparaciones`

Son búsquedas de **poco volumen y muchísima intención**. 200 búsquedas al mes con intención de compra
valen más que 50.000 búsquedas informativas. Y compiten contra páginas viejas, mal hechas y sin foco.

### Estructura de URLs

```
/                                      Landing principal
/software-para-talleres-mecanicos      Landing de rubro (la que posiciona)
/software-para-veterinarias
/software-para-servicio-tecnico
/software-para-constructoras
/software-para-consultoras
/software-para-centros-de-estetica
/software-para-estudios-juridicos
/software-para-servicios-de-campo

/ve/software-para-talleres-mecanicos   Variante por país (fase 2)
/co/software-para-talleres-mecanicos
/mx/... /ar/... /cl/... /pe/...

/precios
/blog/[slug]                           Contenido de apoyo
/comparar/[competidor]                 Páginas de comparación (fase 2)
```

**Regla:** cada landing de rubro se genera desde `preset.marketing` (documento 06). Agregar un rubro
nuevo = agregar un preset = una landing nueva indexable. **Sin escribir HTML.**

---

## 2. Anatomía de la landing de rubro

Orden de secciones, pensado para conversión, no para lucirse:

| # | Sección | Contenido | Por qué ahí |
|---|---|---|---|
| 1 | **Titular** | `preset.marketing.headline` + subtítulo + CTA "Probar gratis 14 días" + "sin tarjeta" | 3 segundos para decir de qué se trata |
| 2 | **Captura del producto** | El Kanban con datos reales del rubro | Vale más que cualquier texto |
| 3 | **Dolores** | Los 4 `painPoints` del preset, en primera persona | El visitante piensa "esto me pasa a mí" |
| 4 | **Cómo funciona** | 3 pasos con capturas | Baja la percepción de esfuerzo |
| 5 | **Funciones** | 6 tarjetas con icono, específicas del rubro | Sustancia |
| 6 | **Demostración** | Vídeo de 90 segundos o GIF del flujo completo | Convierte a los indecisos |
| 7 | **Prueba social** | Testimonios; si no hay, "Hecho junto a talleres de Caracas" | Honesto y suficiente al principio |
| 8 | **Precios** | Los 3 planes con el Profesional destacado | Sin sorpresas, sin "consultar" |
| 9 | **Preguntas frecuentes** | 8 preguntas reales, con marcado FAQPage | SEO + elimina objeciones |
| 10 | **Cierre** | CTA repetido + WhatsApp directo | El botón de WhatsApp convierte más que el formulario |

### Reglas de diseño (calidad de presentación)

- **Modo claro y oscuro** desde el inicio, respetando la preferencia del sistema.
- **Tipografía con carácter.** Nada de la fuente por defecto: eso grita "plantilla".
- **Movimiento sobrio:** aparición al hacer scroll, transiciones de 150–250 ms. Nada que rebote.
- **Móvil primero.** El 70% del tráfico de la región es móvil y muchos prospectos van a abrir el enlace
  desde WhatsApp.
- **Capturas reales del producto**, nunca ilustraciones genéricas de gente sonriendo.
- **Botón flotante de WhatsApp** en toda la landing.

---

## 3. SEO técnico (no negociable)

| Elemento | Implementación |
|---|---|
| **Metadatos** | `generateMetadata` por página: título único de menos de 60 caracteres, descripción de 150–160 |
| **Canónicas** | Una por página, absoluta |
| **Open Graph / Twitter** | Imagen generada dinámicamente por rubro con `next/og` |
| **Datos estructurados** | `SoftwareApplication` + `Organization` + `FAQPage` + `BreadcrumbList` en JSON-LD |
| **Sitemap** | `sitemap.ts` generado desde los presets. Automático al agregar rubros |
| **robots.txt** | `robots.ts`, bloqueando `/admin`, `/[org]`, `/p/` |
| **Rendimiento** | Componentes de servidor, imágenes en AVIF/WebP con `next/image`, fuentes con `next/font`. Objetivo: LCP < 2 s |
| **Core Web Vitals** | Sin desplazamientos de diseño: reservar altura de imágenes y de la captura principal |
| **hreflang** | Al lanzar las variantes por país |
| **Encabezados** | Un solo `h1` por página, jerarquía real |
| **Texto alternativo** | Descriptivo en todas las imágenes; también es accesibilidad |
| **Enlazado interno** | Cada landing de rubro enlaza a 3 relacionadas y al blog |

**Herramientas a conectar (documento 10):** Google Search Console y una analítica sin cookies
(Plausible o Umami — evitan el banner de cookies y son más rápidas que Google Analytics).

---

## 4. Contenido que trae tráfico

Un artículo por semana, cada uno respondiendo una pregunta que **tu cliente ya se hace**:

| Tipo | Ejemplos |
|---|---|
| Cómo hacer | "Cómo llevar el control de órdenes de trabajo en un taller (con plantilla gratis)" |
| Plantillas | "Plantilla de presupuesto para taller mecánico en Excel" ← **imán de captación** |
| Comparación | "Excel vs. software de gestión: cuándo conviene cambiar" |
| Del rubro | "Cuánto cobrar la hora de mano de obra en un taller" |
| Errores | "5 razones por las que un taller pierde plata sin darse cuenta" |

**La táctica de mayor retorno:** ofrecer la plantilla de Excel gratis a cambio del email. Quien la
descarga es exactamente tu cliente, y tenés su contacto. En tres meses le escribís mostrándole que el
sistema hace eso mismo pero sin Excel.

---

## PARTE B — La venta

## 5. Las primeras 20 conversaciones (semana 4 en adelante)

**No esperes a tener el producto listo.** El objetivo de estas conversaciones no es vender: es
**aprender el rubro y conseguir pilotos**.

**Cómo conseguirlas:**
1. Google Maps: buscá "taller mecánico" en tu ciudad. Hay 200. Anotá 40.
2. Visita presencial o WhatsApp. Presencial convierte mucho mejor.
3. Grupos de Facebook y WhatsApp del rubro (pedí permiso al administrador; no spamees).
4. Tu red personal: alguien conoce a alguien con un negocio de servicios. Siempre.

**Guion de la primera conversación (10 minutos, no vendas nada):**

> "Hola, soy [nombre]. Estoy desarrollando un sistema para talleres y necesito entender bien cómo
> trabajan antes de terminarlo. ¿Me regalás 10 minutos? No te vengo a vender nada.
>
> 1. ¿Cómo anotás hoy los trabajos que entran?
> 2. ¿Qué pasa cuando un cliente llama preguntando cómo va lo suyo?
> 3. ¿Cómo hacés los presupuestos? ¿Cuántos se te caen sin respuesta?
> 4. ¿Sabés en este momento cuánto te deben en total?
> 5. Si pudieras arreglar una sola de estas cosas mañana, ¿cuál sería?
> 6. ¿Probaste algún sistema antes? ¿Qué pasó?"

**Escuchá y anotá literal.** Las palabras exactas que usan son el texto de tu landing. Nadie escribe
mejor tu copy que tu cliente.

**Cierre de la conversación:**
> "Te lo dejo probar gratis tres meses y yo mismo te cargo tus datos. Solo te pido que me digas todo lo
> que no te sirva. Si a los tres meses te resulta útil, hablamos de precio."

---

## 6. La demostración que vende

Doce minutos, en este orden exacto. **Con los datos reales de ese cliente cargados de antemano.** Ese
es el detalle que cierra la venta.

| Min | Qué mostrás | Qué decís |
|---|---|---|
| 0–1 | El tablero con **sus** trabajos | "Esto es tu taller de esta semana" |
| 1–3 | Arrastrar un trabajo entre estados | "Así se mueve el trabajo. Nadie tiene que preguntar nada" |
| 3–5 | Buscar un vehículo y ver su historial | "Todo lo que le hiciste a este carro, desde siempre" |
| 5–8 | Crear un presupuesto y mandarlo por WhatsApp **a su propio celular** | "Mirá tu teléfono" ← **acá se cierra la venta** |
| 8–9 | Aprobar desde el móvil y ver el aviso en el sistema | "Y vos te enterás al instante" |
| 9–10 | La pantalla de deudores | "Esto es lo que te deben, ordenado por antigüedad" |
| 10–12 | Precio y siguiente paso | Silencio después de decir el precio. **Esperá a que hable.** |

---

## 7. Objeciones y respuestas

| Objeción | Respuesta |
|---|---|
| "Es caro" | "¿Cuánto perdiste el mes pasado en trabajos que no cobraste o presupuestos que se cayeron? Esto cuesta menos que un cambio de aceite al mes." |
| "Mis empleados no saben usar computadoras" | "Se usa desde el celular y son tres botones. Yo se los enseño la primera semana. Si en dos semanas no lo usan, te devuelvo la plata." |
| "Ya tengo mi Excel" | "Perfecto, lo importamos y no perdés nada. La diferencia es que tu cliente va a poder aprobar el presupuesto desde el celular y vos vas a saber quién te debe sin sumar a mano." |
| "Lo voy a pensar" | "Dale. ¿Qué te falta saber para decidir? Prefiero que me digas que no antes que dejarte con la duda." |
| "¿Y si desaparecés?" | "Justa. Podés exportar toda tu información cuando quieras, en un clic, y llevártela. Nunca te voy a tener secuestrado." |
| "¿Es seguro?" | "Tus datos están en servidores profesionales con copia de seguridad diaria. Están más seguros que en la computadora del taller." |
| "Mándame información" | "Te mando, pero se entiende mucho mejor en 10 minutos de pantalla compartida. ¿Mañana a las 9 o a las 4?" |

---

## 8. Onboarding: donde se gana o se pierde el cliente

**El 80% de las bajas ocurre en las dos primeras semanas.** El plan de arranque no es opcional:

| Momento | Acción |
|---|---|
| Día 0 | Registro → preset aplicado → datos de ejemplo cargados. Ve un sistema vivo. |
| Día 0 | Email de bienvenida con un vídeo de 3 minutos. |
| Día 1 | **Mensaje personal tuyo por WhatsApp.** No automatizado. "¿Pudiste entrar? ¿Te ayudo a cargar tus clientes?" |
| Día 2 | Sesión de 30 min por videollamada: cargás sus datos con él mirando. |
| Día 5 | "¿Cómo va? ¿Algo que no encontrás?" |
| Día 10 | Si no creó 10 trabajos → llamada. **Es la señal de baja más confiable que existe.** |
| Día 12 | "Se te vence la prueba en 2 días. ¿Seguimos?" |
| Día 14 | Conversación de cierre. |

**La métrica que predice todo: trabajos creados en los primeros 14 días.**
Menos de 5 → se va. Más de 15 → se queda un año.

---

## 9. Soporte sostenible para una persona sola

| Regla | Detalle |
|---|---|
| **Horario publicado** | Lunes a viernes 9–18. Publicado en la web y en el contrato. Fuera de eso, se responde cuando se puede. |
| **Un solo canal** | WhatsApp Business. No dividas la atención en cinco lugares. |
| **Respuestas guardadas** | Las 20 preguntas más frecuentes, respondidas de antemano. |
| **Documentación primero** | Cada pregunta nueva se responde **y** se convierte en artículo de ayuda. La segunda vez, mandás el enlace. |
| **Emergencias reales** | Solo "el sistema no carga". Todo lo demás espera al día siguiente. |
| **Bloque diario** | 30 minutos fijos para soporte. No se atiende todo el día: destruye la capacidad de construir. |

---

## 10. Programa de canal (desde el mes 6)

El multiplicador de la venta. Un contador con 120 clientes PyME es un canal, no un cliente.

**A quién reclutar:** contadores, consultores de PyMEs, técnicos que instalan sistemas, agencias
digitales locales, proveedores del rubro (distribuidores de repuestos, laboratorios veterinarios).

**Oferta:**

| Nivel | Requisito | Comisión |
|---|---|---|
| Referidor | Manda un contacto | 20% del primer año |
| Socio | Vende y hace el onboarding | 30% recurrente mientras el cliente pague |
| Marca blanca | Vende con su marca | 40% recurrente + cuota fija de plataforma |

**Lo que necesitás darles:** cuenta de demostración propia, presentación en PDF, guion de venta,
enlace de referido con seguimiento, y pago puntual todos los meses. **Pagales antes de que pregunten.**
Un canal que desconfía del pago deja de vender.

---

## 11. Calendario de los primeros 6 meses

| Mes | Producto | Venta |
|---|---|---|
| 1 | Sprints 1–4 | 20 conversaciones de descubrimiento |
| 2 | Sprints 5–6, MVP listo | 3 pilotos gratis funcionando |
| 3 | Correcciones del piloto + landing | Convertir pilotos → primeros 3 pagos |
| 4 | 3 rubros más + blog | 10 conversaciones/semana. Objetivo: 8 clientes |
| 5 | WhatsApp API | Objetivo: 14 clientes. Primeros artículos posicionando |
| 6 | Estabilización + programa de canal | Objetivo: 20 clientes. 2 socios reclutados |

---

## Siguiente paso

Documento 09: despliegue, operación diaria, respaldos y continuidad.
