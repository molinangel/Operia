import type { IndustryPreset } from "../types";
import {
  COMMON_RULES,
  DEFAULT_DOC_TEMPLATES,
  DEFAULT_PAYMENT_METHODS,
  STATUS_COLORS as C,
} from "../shared";

// ═══════════════════════════════════════════════════════════════
// VETERINARIA
// ═══════════════════════════════════════════════════════════════

export const veterinaria: IndustryPreset = {
  key: "veterinaria",
  name: "Veterinaria",
  shortName: "Veterinarias",
  description: "Historia clínica por paciente, vacunas y controles.",
  icon: "🐾",

  vocabulary: {
    jobSingular: "Consulta",
    jobPlural: "Consultas",
    assetSingular: "Paciente",
    assetPlural: "Pacientes",
    useAssets: true,
  },

  statuses: [
    { name: "Agendada", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "En espera", kind: "WAITING", color: C.amber },
    { name: "En consulta", kind: "IN_PROGRESS", color: C.blue },
    { name: "En tratamiento", kind: "IN_PROGRESS", color: C.violet },
    { name: "Internado", kind: "IN_PROGRESS", color: C.red },
    { name: "Alta", kind: "DONE", color: C.green },
    { name: "No asistió", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    {
      entity: "ASSET",
      key: "especie",
      label: "Especie",
      type: "SELECT",
      options: ["Perro", "Gato", "Ave", "Conejo", "Roedor", "Reptil", "Equino", "Otro"],
      required: true,
      showInList: true,
    },
    { entity: "ASSET", key: "raza", label: "Raza", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "sexo", label: "Sexo", type: "SELECT", options: ["Macho", "Hembra"], showInList: true },
    { entity: "ASSET", key: "nacimiento", label: "Fecha de nacimiento", type: "DATE" },
    { entity: "ASSET", key: "castrado", label: "Castrado / esterilizado", type: "BOOLEAN" },
    { entity: "ASSET", key: "chip", label: "N.º de microchip", type: "TEXT" },
    { entity: "ASSET", key: "alergias", label: "Alergias y antecedentes", type: "MULTILINE" },
    { entity: "JOB", key: "motivo", label: "Motivo de consulta", type: "MULTILINE", required: true },
    { entity: "JOB", key: "peso", label: "Peso (kg)", type: "NUMBER", showInList: true },
    { entity: "JOB", key: "temperatura", label: "Temperatura (°C)", type: "NUMBER" },
    { entity: "JOB", key: "diagnostico", label: "Diagnóstico", type: "MULTILINE" },
    { entity: "JOB", key: "tratamiento", label: "Tratamiento indicado", type: "MULTILINE" },
    { entity: "JOB", key: "proximo_control", label: "Próximo control", type: "DATE", showInList: true },
  ],

  products: [
    { name: "Consulta general", kind: "SERVICE", priceCents: 2000 },
    { name: "Vacuna múltiple", kind: "SERVICE", priceCents: 2500 },
    { name: "Vacuna antirrábica", kind: "SERVICE", priceCents: 1800 },
    { name: "Desparasitación", kind: "SERVICE", priceCents: 1200 },
    { name: "Baño y corte", kind: "SERVICE", priceCents: 1500 },
    { name: "Cirugía de esterilización", kind: "SERVICE", priceCents: 12000 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "job.followup",
      channel: "WHATSAPP",
      offsetMinutes: -1440,
      bodyTemplate:
        "Hola {{contact.name}}, mañana toca el control de {{asset.label}} en {{org.name}}. " +
        "¿Confirmás la hora?",
    },
  ],

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "CERTIFICATE",
      name: "Certificado de salud",
      title: "Certificado de salud animal",
      footerNote:
        "Se certifica que el animal descrito fue examinado en la fecha indicada y se encuentra en el estado consignado.",
    },
    {
      kind: "REPORT",
      name: "Informe clínico",
      title: "Informe clínico",
      footerNote: "Informe emitido por el profesional actuante.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Gabriela Torres", phone: "+584121234567" },
      { name: "Andrés Molina", phone: "+584241234567" },
      { name: "Lucía Herrera", phone: "+584161234567" },
      { name: "Pedro Castillo", phone: "+584121112233" },
    ],
    assets: [
      { label: "Firulais", identifier: "Perro · Labrador", contactIndex: 0 },
      { label: "Mishi", identifier: "Gato · Siamés", contactIndex: 1 },
      { label: "Rocky", identifier: "Perro · Pitbull", contactIndex: 2 },
    ],
    jobs: [
      {
        title: "Control anual y vacunas",
        statusIndex: 0,
        contactIndex: 0,
        assetIndex: 0,
        items: [
          { description: "Consulta general", quantity: 1, priceCents: 2000 },
          { description: "Vacuna múltiple", quantity: 1, priceCents: 2500 },
        ],
      },
      {
        title: "Vómitos y decaimiento",
        statusIndex: 2,
        contactIndex: 1,
        assetIndex: 1,
        items: [{ description: "Consulta general", quantity: 1, priceCents: 2000 }],
      },
      {
        title: "Post operatorio esterilización",
        statusIndex: 3,
        contactIndex: 2,
        assetIndex: 2,
        items: [{ description: "Cirugía de esterilización", quantity: 1, priceCents: 12000 }],
      },
      {
        title: "Baño y desparasitación",
        statusIndex: 5,
        contactIndex: 3,
        items: [
          { description: "Baño y corte", quantity: 1, priceCents: 1500 },
          { description: "Desparasitación", quantity: 1, priceCents: 1200 },
        ],
      },
    ],
  },

  marketing: {
    slug: "veterinarias",
    metaTitle: "Software para veterinarias | Historia clínica y recordatorios de vacunas",
    metaDescription:
      "Sistema de gestión para clínicas veterinarias: historia clínica por paciente, control de " +
      "vacunas, recordatorios automáticos por WhatsApp y cobros. Prueba gratis 14 días.",
    headline: "La historia clínica de cada paciente,",
    headlineAccent: "siempre a mano",
    subheadline:
      "Ficha completa por mascota, control de vacunas y desparasitaciones, recordatorio automático " +
      "del próximo control por WhatsApp. Los clientes vuelven porque se lo recordás vos.",
    audience: "clínicas veterinarias, consultorios y peluquerías caninas",
    painPoints: [
      {
        title: "La historia clínica está en fichas de papel",
        detail:
          "Buscar el antecedente de un paciente lleva cinco minutos y a veces la ficha simplemente no aparece.",
      },
      {
        title: "Los clientes no vuelven al control",
        detail:
          "Nadie lleva la cuenta de cuándo toca la próxima vacuna. Cada control perdido es dinero que se fue a otra veterinaria.",
      },
      {
        title: "Ausentismo en los turnos",
        detail:
          "Uno de cada cinco turnos no se presenta. Sin recordatorio, ese espacio queda vacío y no se recupera.",
      },
      {
        title: "No sabés qué te deja cada servicio",
        detail:
          "Consultas, vacunas, cirugías, peluquería. Sin números, las decisiones de precio son a puro instinto.",
      },
    ],
    features: [
      {
        title: "Ficha del paciente",
        detail:
          "Especie, raza, peso, chip, alergias e historial completo de consultas, tratamientos y vacunas.",
        icon: "heart",
      },
      {
        title: "Recordatorio del próximo control",
        detail:
          "Cargás la fecha y el mensaje sale solo por WhatsApp. Es la función que más clientes recupera.",
        icon: "bell",
      },
      {
        title: "Agenda de turnos",
        detail:
          "Vista diaria y semanal por profesional, con confirmación y aviso 24 horas antes.",
        icon: "calendar",
      },
      {
        title: "Certificados e informes",
        detail:
          "Certificado de salud e informe clínico con tu membrete, listos en PDF.",
        icon: "file",
      },
      {
        title: "Varios profesionales",
        detail:
          "Cada veterinario con su usuario y su agenda. Sabés quién atendió qué.",
        icon: "users",
      },
      {
        title: "Cobros y cuenta corriente",
        detail:
          "Pagos parciales, saldos por cliente y reporte de ingresos por tipo de servicio.",
        icon: "wallet",
      },
    ],
    faq: [
      {
        q: "¿Puedo registrar varias mascotas por dueño?",
        a: "Sí, sin límite. Cada paciente tiene su ficha propia y su historial independiente, todos vinculados al mismo responsable.",
      },
      {
        q: "¿Sirve para peluquería canina además de clínica?",
        a: "Sí. Podés tener servicios de consulta y de estética en el mismo catálogo, y adaptar los estados a tu flujo.",
      },
      {
        q: "¿Los recordatorios se mandan solos?",
        a: "El sistema prepara el mensaje con los datos ya completados y lo enviás con un toque desde tu WhatsApp. En el plan Profesional se envía de forma totalmente automática.",
      },
      {
        q: "¿Puedo adjuntar radiografías o análisis?",
        a: "Sí, se adjuntan archivos e imágenes a cada consulta y quedan en el historial del paciente.",
      },
    ],
    keywords: [
      "software para veterinarias",
      "sistema de historia clínica veterinaria",
      "programa para clínica veterinaria",
      "gestión de veterinaria online",
      "recordatorio de vacunas veterinaria",
      "software veterinario en español",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// ESTÉTICA Y BIENESTAR
// ═══════════════════════════════════════════════════════════════

export const estetica: IndustryPreset = {
  key: "estetica",
  name: "Estética y bienestar",
  shortName: "Estética",
  description: "Sesiones, paquetes, agenda y recordatorios.",
  icon: "✨",

  vocabulary: {
    jobSingular: "Sesión",
    jobPlural: "Sesiones",
    assetSingular: "Activo",
    assetPlural: "Activos",
    useAssets: false,
  },

  statuses: [
    { name: "Agendada", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "Confirmada", kind: "WAITING", color: C.sky },
    { name: "En atención", kind: "IN_PROGRESS", color: C.pink },
    { name: "Completada", kind: "DONE", color: C.green },
    { name: "No asistió", kind: "CANCELLED", color: C.amber },
    { name: "Cancelada", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    { entity: "JOB", key: "tratamiento", label: "Tratamiento", type: "TEXT", showInList: true },
    { entity: "JOB", key: "profesional", label: "Profesional", type: "TEXT", showInList: true },
    { entity: "JOB", key: "sesion_numero", label: "Sesión n.º del paquete", type: "NUMBER", showInList: true },
    { entity: "JOB", key: "sesiones_totales", label: "Sesiones del paquete", type: "NUMBER" },
    { entity: "JOB", key: "observaciones", label: "Observaciones", type: "MULTILINE" },
    { entity: "JOB", key: "consentimiento", label: "Consentimiento firmado", type: "BOOLEAN" },
    { entity: "CONTACT", key: "tipo_piel", label: "Tipo de piel", type: "SELECT", options: ["Normal", "Seca", "Grasa", "Mixta", "Sensible"] },
    { entity: "CONTACT", key: "alergias", label: "Alergias / contraindicaciones", type: "MULTILINE" },
  ],

  products: [
    { name: "Limpieza facial profunda", kind: "SERVICE", priceCents: 3500 },
    { name: "Masaje descontracturante", kind: "SERVICE", priceCents: 3000 },
    { name: "Depilación láser (zona)", kind: "SERVICE", priceCents: 4000 },
    { name: "Manicura y pedicura", kind: "SERVICE", priceCents: 2000 },
    { name: "Paquete 6 sesiones", kind: "SERVICE", priceCents: 18000 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "appointment.confirm",
      channel: "WHATSAPP",
      offsetMinutes: -120,
      bodyTemplate:
        "Hola {{contact.name}}, te esperamos hoy a las {{appointment.time}} en {{org.name}}. " +
        "Si no podés venir, avisanos así liberamos el espacio.",
    },
  ],

  documentTemplates: DEFAULT_DOC_TEMPLATES,

  showcase: {
    contacts: [
      { name: "Valentina Ríos", phone: "+584121234567" },
      { name: "Camila Suárez", phone: "+584241234567" },
      { name: "Daniela Ortega", phone: "+584161234567" },
      { name: "Sofía Delgado", phone: "+584121112233" },
    ],
    assets: [],
    jobs: [
      {
        title: "Limpieza facial — sesión 2 de 6",
        statusIndex: 1,
        contactIndex: 0,
        items: [{ description: "Limpieza facial profunda", quantity: 1, priceCents: 3500 }],
      },
      {
        title: "Depilación láser piernas",
        statusIndex: 0,
        contactIndex: 1,
        items: [{ description: "Depilación láser (zona)", quantity: 2, priceCents: 4000 }],
      },
      {
        title: "Masaje descontracturante",
        statusIndex: 2,
        contactIndex: 2,
        items: [{ description: "Masaje descontracturante", quantity: 1, priceCents: 3000 }],
      },
      {
        title: "Manicura y pedicura",
        statusIndex: 3,
        contactIndex: 3,
        items: [{ description: "Manicura y pedicura", quantity: 1, priceCents: 2000 }],
      },
    ],
  },

  marketing: {
    slug: "centros-de-estetica",
    metaTitle: "Software para centros de estética | Agenda, paquetes y recordatorios",
    metaDescription:
      "Sistema para centros de estética y spa: agenda por profesional, control de paquetes de " +
      "sesiones, recordatorios por WhatsApp que reducen el ausentismo y control de cobros.",
    headline: "Menos ausencias,",
    headlineAccent: "más agenda llena",
    subheadline:
      "Agenda por profesional, control de paquetes de sesiones, ficha con antecedentes de cada " +
      "cliente y recordatorio automático por WhatsApp que baja el ausentismo drásticamente.",
    audience: "centros de estética, spa, peluquerías y consultorios de bienestar",
    painPoints: [
      {
        title: "Uno de cada cinco turnos no se presenta",
        detail:
          "Cada ausencia es un espacio que ya no se puede vender. Un recordatorio bien hecho recupera la mayoría.",
      },
      {
        title: "Nadie sabe cuántas sesiones quedan del paquete",
        detail:
          "El cliente dice que le quedan tres, vos creés que dos. Sin registro, siempre pierde el negocio.",
      },
      {
        title: "La agenda vive en un cuaderno",
        detail:
          "Si la recepcionista no vino, nadie sabe quién viene hoy ni con qué profesional.",
      },
      {
        title: "No sabés qué tratamiento deja más",
        detail:
          "Sin números por servicio, no sabés cuál promocionar ni cuál conviene subir de precio.",
      },
    ],
    features: [
      {
        title: "Agenda por profesional",
        detail:
          "Vista diaria y semanal, con aviso de superposición de horarios y filtro por persona.",
        icon: "calendar",
      },
      {
        title: "Control de paquetes",
        detail:
          "Sesión 3 de 6, siempre visible. El cliente lo ve y vos también. Se acabaron las discusiones.",
        icon: "layers",
      },
      {
        title: "Recordatorio que reduce ausencias",
        detail:
          "Mensaje 24 horas y 2 horas antes por WhatsApp. Es lo que más impacto tiene sobre la facturación.",
        icon: "bell",
      },
      {
        title: "Ficha de cliente",
        detail:
          "Tipo de piel, alergias, contraindicaciones y todo lo que se le hizo antes.",
        icon: "heart",
      },
      {
        title: "Cobros y abonos",
        detail:
          "Paquetes pagados por adelantado, saldos y quién debe. Ordenado y al día.",
        icon: "wallet",
      },
      {
        title: "Reportes por tratamiento",
        detail:
          "Qué servicio se vende más, cuál deja mejor margen y cómo evoluciona mes a mes.",
        icon: "chart",
      },
    ],
    faq: [
      {
        q: "¿Puedo tener varias profesionales con agendas distintas?",
        a: "Sí. Cada una con su usuario, su agenda y sus servicios asignados. La vista general muestra todo junto.",
      },
      {
        q: "¿El cliente puede reservar solo?",
        a: "En esta versión la reserva la carga el negocio. La reserva online por parte del cliente está en el plan de desarrollo.",
      },
      {
        q: "¿Cómo se manejan los paquetes de sesiones?",
        a: "Se registra la sesión número y el total del paquete. En cada visita ves cuántas quedan, y el cobro se puede registrar completo por adelantado o por sesión.",
      },
    ],
    keywords: [
      "software para centros de estética",
      "sistema de turnos estética",
      "programa para spa y belleza",
      "agenda online centro de estética",
      "control de paquetes de sesiones",
      "software para peluquería y estética",
    ],
  },
};
