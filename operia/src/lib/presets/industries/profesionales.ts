import type { IndustryPreset } from "../types";
import {
  COMMON_RULES,
  DEFAULT_DOC_TEMPLATES,
  DEFAULT_PAYMENT_METHODS,
  GENERIC_STATUSES,
  STATUS_COLORS as C,
} from "../shared";

// ═══════════════════════════════════════════════════════════════
// CONSTRUCCIÓN Y REFORMAS
// ═══════════════════════════════════════════════════════════════

export const construccion: IndustryPreset = {
  key: "construccion",
  name: "Construcción y reformas",
  shortName: "Construcción",
  description: "Obras por etapas, presupuestos grandes y cobro por avance.",
  icon: "🏗️",

  vocabulary: {
    jobSingular: "Obra",
    jobPlural: "Obras",
    assetSingular: "Inmueble",
    assetPlural: "Inmuebles",
    useAssets: true,
  },

  statuses: [
    { name: "Contacto inicial", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "Visita técnica", kind: "IN_PROGRESS", color: C.sky },
    { name: "Presupuestado", kind: "WAITING", color: C.amber },
    { name: "Aprobado", kind: "IN_PROGRESS", color: C.violet },
    { name: "En ejecución", kind: "IN_PROGRESS", color: C.blue },
    { name: "Terminado", kind: "DONE", color: C.green },
    { name: "En garantía", kind: "DONE", color: C.emerald },
    { name: "No prosperó", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    { entity: "ASSET", key: "direccion", label: "Dirección", type: "TEXT", required: true, showInList: true },
    { entity: "ASSET", key: "metros", label: "Metros cuadrados", type: "NUMBER", showInList: true },
    {
      entity: "ASSET",
      key: "tipo_inmueble",
      label: "Tipo de inmueble",
      type: "SELECT",
      options: ["Casa", "Apartamento", "Local comercial", "Oficina", "Galpón", "Terreno"],
      showInList: true,
    },
    {
      entity: "JOB",
      key: "tipo_obra",
      label: "Tipo de obra",
      type: "SELECT",
      options: ["Obra nueva", "Remodelación", "Ampliación", "Mantenimiento", "Instalación"],
      showInList: true,
    },
    { entity: "JOB", key: "avance", label: "% de avance", type: "NUMBER", showInList: true },
    { entity: "JOB", key: "fecha_estimada", label: "Fecha estimada de entrega", type: "DATE", showInList: true },
    { entity: "JOB", key: "responsable_obra", label: "Responsable de obra", type: "TEXT" },
    { entity: "JOB", key: "alcance", label: "Alcance de los trabajos", type: "MULTILINE" },
  ],

  products: [
    { name: "Visita técnica y medición", kind: "SERVICE", priceCents: 5000 },
    { name: "Mano de obra albañilería (día)", kind: "SERVICE", priceCents: 4000 },
    { name: "Instalación eléctrica (punto)", kind: "SERVICE", priceCents: 1500 },
    { name: "Pintura (m²)", kind: "SERVICE", priceCents: 800 },
    { name: "Dirección de obra (%)", kind: "SERVICE", priceCents: 0 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "job.progress",
      channel: "WHATSAPP",
      offsetMinutes: 0,
      bodyTemplate:
        "Hola {{contact.name}}, actualizamos el avance de tu obra {{job.code}}. " +
        "Podés ver el detalle acá: {{job.publicUrl}}",
    },
  ],

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "REPORT",
      name: "Informe de avance",
      title: "Informe de avance de obra",
      footerNote: "Informe de avance emitido por la dirección de obra.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Familia Bermúdez", phone: "+584121234567" },
      { name: "Inversiones Caroní C.A.", phone: "+584241234567" },
      { name: "Condominio Los Robles", phone: "+584161234567" },
    ],
    assets: [
      { label: "Casa Av. Principal 44", identifier: "Casa · 180 m²", contactIndex: 0 },
      { label: "Local centro comercial", identifier: "Local · 60 m²", contactIndex: 1 },
    ],
    jobs: [
      {
        title: "Remodelación integral de cocina y baños",
        statusIndex: 4,
        contactIndex: 0,
        assetIndex: 0,
        items: [
          { description: "Mano de obra albañilería (día)", quantity: 20, priceCents: 4000 },
          { description: "Pintura (m²)", quantity: 120, priceCents: 800 },
        ],
      },
      {
        title: "Adecuación de local comercial",
        statusIndex: 2,
        contactIndex: 1,
        assetIndex: 1,
        items: [
          { description: "Instalación eléctrica (punto)", quantity: 24, priceCents: 1500 },
          { description: "Mano de obra albañilería (día)", quantity: 12, priceCents: 4000 },
        ],
      },
      {
        title: "Impermeabilización de azotea",
        statusIndex: 1,
        contactIndex: 2,
        items: [{ description: "Visita técnica y medición", quantity: 1, priceCents: 5000 }],
      },
    ],
  },

  marketing: {
    slug: "constructoras-y-reformas",
    metaTitle: "Software para constructoras y empresas de reformas | Obras y presupuestos",
    metaDescription:
      "Gestión de obras y reformas: presupuestos detallados, control de avance por etapas, cobro " +
      "por hitos y portal para que el cliente siga su obra. Prueba gratis 14 días.",
    headline: "Cada obra con su presupuesto,",
    headlineAccent: "su avance y su cobro",
    subheadline:
      "Presupuestos detallados que el cliente aprueba desde el celular, control de avance por " +
      "etapas, cobro por hitos y un enlace para que el cliente vea cómo va su obra sin llamarte.",
    audience: "constructoras, empresas de reformas, contratistas y arquitectos",
    painPoints: [
      {
        title: "Presupuestos que tardan días",
        detail:
          "Armar un presupuesto de 40 ítems en Excel lleva horas, y cualquier cambio obliga a rehacerlo todo.",
      },
      {
        title: "El cliente pregunta el avance todos los días",
        detail:
          "Cada llamada te saca de la obra. Y si no contestás rápido, la sensación es de descontrol.",
      },
      {
        title: "Los cobros por etapa se desordenan",
        detail:
          "Anticipo, primer hito, adicionales. Sin un registro claro, siempre falta plata y sobran discusiones.",
      },
      {
        title: "Los adicionales no quedan por escrito",
        detail:
          "Se acuerdan de palabra en la obra y al final del proyecto nadie recuerda qué se aprobó.",
      },
    ],
    features: [
      {
        title: "Presupuestos con muchos ítems",
        detail:
          "Catálogo de partidas con tus precios. Armás un presupuesto de 50 líneas en minutos y lo actualizás de golpe.",
        icon: "file",
      },
      {
        title: "Portal de obra para el cliente",
        detail:
          "Un enlace donde ve el estado, el avance y los documentos. Deja de llamarte para preguntar.",
        icon: "link",
      },
      {
        title: "Control de avance",
        detail:
          "Porcentaje de ejecución, fotos por etapa e informes de avance en PDF con tu membrete.",
        icon: "chart",
      },
      {
        title: "Cobro por hitos",
        detail:
          "Anticipos y pagos parciales registrados contra cada obra. Siempre sabés cuánto falta cobrar.",
        icon: "wallet",
      },
      {
        title: "Ficha por inmueble",
        detail:
          "Dirección, metros, tipo y todas las obras que hiciste ahí. Ideal para trabajo recurrente.",
        icon: "building",
      },
      {
        title: "Adicionales documentados",
        detail:
          "Cada cambio se genera como documento y el cliente lo aprueba desde el celular. Queda registrado.",
        icon: "check",
      },
    ],
    faq: [
      {
        q: "¿Sirve para un contratista independiente?",
        a: "Sí. El plan Inicial cubre perfectamente a un profesional que lleva entre 3 y 10 obras a la vez.",
      },
      {
        q: "¿Puedo cargar fotos del avance?",
        a: "Sí, se adjuntan a cada obra y quedan en el historial. El cliente las ve desde el enlace de su obra.",
      },
      {
        q: "¿Maneja cómputo métrico y análisis de precios unitarios?",
        a: "No en profundidad. Maneja partidas con cantidad y precio, que cubre la mayoría de las obras pequeñas y medianas, pero no reemplaza a un software especializado de presupuestos de obra grande.",
      },
    ],
    keywords: [
      "software para constructoras",
      "programa de presupuestos de obra",
      "gestión de obras y reformas",
      "software para contratistas",
      "control de avance de obra",
      "presupuestos para remodelaciones",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// CONSULTORÍA Y AGENCIAS
// ═══════════════════════════════════════════════════════════════

export const consultoria: IndustryPreset = {
  key: "consultoria",
  name: "Consultoría y agencias",
  shortName: "Consultoría",
  description: "Proyectos de cliente, horas, entregables y honorarios.",
  icon: "📊",

  vocabulary: {
    jobSingular: "Proyecto",
    jobPlural: "Proyectos",
    assetSingular: "Activo",
    assetPlural: "Activos",
    useAssets: false,
  },

  statuses: [
    { name: "Propuesta", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "En negociación", kind: "WAITING", color: C.amber },
    { name: "Activo", kind: "IN_PROGRESS", color: C.blue },
    { name: "En revisión del cliente", kind: "WAITING", color: C.violet },
    { name: "Entregado", kind: "DONE", color: C.green },
    { name: "Cerrado", kind: "DONE", color: C.emerald },
    { name: "No prosperó", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    {
      entity: "JOB",
      key: "tipo_proyecto",
      label: "Tipo de proyecto",
      type: "SELECT",
      options: ["Consultoría", "Diseño", "Desarrollo", "Marketing", "Capacitación", "Auditoría"],
      showInList: true,
    },
    { entity: "JOB", key: "horas_estimadas", label: "Horas estimadas", type: "NUMBER", showInList: true },
    { entity: "JOB", key: "horas_consumidas", label: "Horas consumidas", type: "NUMBER", showInList: true },
    { entity: "JOB", key: "contacto_cliente", label: "Responsable del cliente", type: "TEXT" },
    { entity: "JOB", key: "entregables", label: "Entregables", type: "MULTILINE" },
    { entity: "CONTACT", key: "industria", label: "Industria", type: "TEXT", showInList: true },
  ],

  products: [
    { name: "Hora de consultoría", kind: "SERVICE", priceCents: 4000 },
    { name: "Diagnóstico inicial", kind: "SERVICE", priceCents: 30000 },
    { name: "Abono mensual", kind: "SERVICE", priceCents: 50000 },
    { name: "Taller de capacitación (jornada)", kind: "SERVICE", priceCents: 25000 },
  ],

  paymentMethods: [...DEFAULT_PAYMENT_METHODS, "PayPal", "Wise"],

  notificationRules: COMMON_RULES,

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "REPORT",
      name: "Informe de proyecto",
      title: "Informe de proyecto",
      footerNote: "Documento confidencial de uso exclusivo del cliente.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Grupo Alimentos del Sur", phone: "+584121234567" },
      { name: "Farmacias Vida", phone: "+584241234567" },
      { name: "Textiles Andinos", phone: "+584161234567" },
    ],
    assets: [],
    jobs: [
      {
        title: "Rediseño de identidad de marca",
        statusIndex: 2,
        contactIndex: 0,
        items: [{ description: "Hora de consultoría", quantity: 40, priceCents: 4000 }],
      },
      {
        title: "Diagnóstico de procesos operativos",
        statusIndex: 3,
        contactIndex: 1,
        items: [{ description: "Diagnóstico inicial", quantity: 1, priceCents: 30000 }],
      },
      {
        title: "Abono mensual de marketing",
        statusIndex: 2,
        contactIndex: 2,
        items: [{ description: "Abono mensual", quantity: 1, priceCents: 50000 }],
      },
      {
        title: "Propuesta de capacitación comercial",
        statusIndex: 0,
        contactIndex: 0,
        items: [{ description: "Taller de capacitación (jornada)", quantity: 2, priceCents: 25000 }],
      },
    ],
  },

  marketing: {
    slug: "consultoras-y-agencias",
    metaTitle: "Software para consultoras y agencias | Proyectos, horas y honorarios",
    metaDescription:
      "Gestión de proyectos de cliente para consultoras y agencias: propuestas que se aprueban " +
      "online, control de horas, entregables y cobro de honorarios. Prueba gratis 14 días.",
    headline: "Todos tus proyectos de cliente,",
    headlineAccent: "en un solo tablero",
    subheadline:
      "Propuestas que el cliente aprueba en línea, control de horas contra lo presupuestado, " +
      "entregables por proyecto y seguimiento de honorarios sin planillas.",
    audience: "consultoras, agencias de marketing, estudios de diseño y profesionales independientes",
    painPoints: [
      {
        title: "Propuestas que quedan sin respuesta",
        detail:
          "Mandás el PDF por email y no sabés si lo abrieron. Hacés seguimiento a ciegas y a destiempo.",
      },
      {
        title: "Proyectos que se comen las horas",
        detail:
          "Presupuestaste 40 horas y llevás 70. Te enterás al final, cuando ya no se puede renegociar.",
      },
      {
        title: "No sabés qué cliente deja plata",
        detail:
          "Algunos clientes facturan mucho y consumen más. Sin números por proyecto, no lo ves.",
      },
      {
        title: "Los honorarios se cobran tarde",
        detail:
          "Sin control de qué se facturó y qué se cobró, siempre hay dinero pendiente que nadie reclama.",
      },
    ],
    features: [
      {
        title: "Tablero de proyectos",
        detail:
          "Propuesta, negociación, activo, en revisión, entregado. Ves el estado real de tu cartera de un vistazo.",
        icon: "layout",
      },
      {
        title: "Propuestas con aprobación en línea",
        detail:
          "El cliente abre el enlace, lo lee y aprueba. Vos ves cuándo lo abrió y cuándo respondió.",
        icon: "file",
      },
      {
        title: "Horas estimadas vs. consumidas",
        detail:
          "Cada proyecto muestra la desviación. Detectás el desvío a tiempo, no al final.",
        icon: "clock",
      },
      {
        title: "Honorarios y cobros",
        detail:
          "Abonos mensuales, pagos por hito y saldos por cliente, ordenados por antigüedad.",
        icon: "wallet",
      },
      {
        title: "Rentabilidad por cliente",
        detail:
          "Qué cliente factura más, cuál consume más horas y cuál conviene realmente.",
        icon: "chart",
      },
      {
        title: "Todo el historial del cliente",
        detail:
          "Cada propuesta, proyecto, documento y pago de ese cliente en una sola ficha.",
        icon: "users",
      },
    ],
    faq: [
      {
        q: "¿Es un gestor de tareas tipo Trello?",
        a: "No exactamente. Está centrado en el proyecto de cliente completo: propuesta, aprobación, ejecución, entrega y cobro. La gestión de tareas internas del equipo la seguís haciendo donde ya la hacés.",
      },
      {
        q: "¿Registra horas automáticamente?",
        a: "No hay cronómetro. Se cargan las horas consumidas por proyecto, que es lo que la mayoría de las consultoras necesita para controlar la desviación.",
      },
      {
        q: "¿Sirve para un profesional independiente?",
        a: "Sí, y es de los casos donde más rinde: el plan Inicial cubre a alguien con 10 a 15 proyectos activos.",
      },
    ],
    keywords: [
      "software para consultoras",
      "gestión de proyectos de cliente",
      "software para agencias de marketing",
      "control de horas por proyecto",
      "propuestas comerciales online",
      "software para profesionales independientes",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// ESTUDIO JURÍDICO
// ═══════════════════════════════════════════════════════════════

export const legal: IndustryPreset = {
  key: "legal",
  name: "Estudio jurídico",
  shortName: "Estudios jurídicos",
  description: "Expedientes, audiencias, actuaciones y honorarios.",
  icon: "⚖️",

  vocabulary: {
    jobSingular: "Expediente",
    jobPlural: "Expedientes",
    assetSingular: "Activo",
    assetPlural: "Activos",
    useAssets: false,
  },

  statuses: [
    { name: "Consulta inicial", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "En estudio", kind: "IN_PROGRESS", color: C.sky },
    { name: "Escrito presentado", kind: "IN_PROGRESS", color: C.violet },
    { name: "En trámite", kind: "IN_PROGRESS", color: C.blue },
    { name: "Esperando resolución", kind: "WAITING", color: C.amber },
    { name: "Sentencia", kind: "DONE", color: C.green },
    { name: "Archivado", kind: "DONE", color: C.emerald },
    { name: "Desistido", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    { entity: "JOB", key: "materia", label: "Materia", type: "SELECT", options: ["Civil", "Laboral", "Penal", "Mercantil", "Familia", "Administrativo", "Tributario"], showInList: true },
    { entity: "JOB", key: "juzgado", label: "Juzgado / tribunal", type: "TEXT", showInList: true },
    { entity: "JOB", key: "num_causa", label: "N.º de causa", type: "TEXT", showInList: true },
    { entity: "JOB", key: "contraparte", label: "Contraparte", type: "TEXT" },
    { entity: "JOB", key: "proxima_audiencia", label: "Próxima audiencia", type: "DATE", showInList: true },
    { entity: "JOB", key: "honorarios_pactados", label: "Honorarios pactados", type: "TEXT" },
    { entity: "JOB", key: "actuaciones", label: "Actuaciones", type: "MULTILINE" },
    { entity: "CONTACT", key: "cedula", label: "Cédula / RIF", type: "TEXT", showInList: true },
  ],

  products: [
    { name: "Consulta jurídica", kind: "SERVICE", priceCents: 5000 },
    { name: "Redacción de documento", kind: "SERVICE", priceCents: 15000 },
    { name: "Representación en juicio (cuota)", kind: "SERVICE", priceCents: 40000 },
    { name: "Asesoría mensual", kind: "SERVICE", priceCents: 30000 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "hearing.reminder",
      channel: "WHATSAPP",
      offsetMinutes: -2880,
      bodyTemplate:
        "Recordatorio: audiencia del expediente {{job.code}} el {{job.hearingDate}} " +
        "en {{job.court}}. Cliente: {{contact.name}}.",
    },
  ],

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "REPORT",
      name: "Informe de estado del expediente",
      title: "Informe de estado",
      footerNote:
        "Documento confidencial amparado por el secreto profesional. Uso exclusivo del cliente.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Ramón Escalante", phone: "+584121234567" },
      { name: "Distribuidora Occidente C.A.", phone: "+584241234567" },
      { name: "Marisol Vargas", phone: "+584161234567" },
    ],
    assets: [],
    jobs: [
      {
        title: "Demanda laboral por prestaciones",
        statusIndex: 3,
        contactIndex: 0,
        items: [{ description: "Representación en juicio (cuota)", quantity: 1, priceCents: 40000 }],
      },
      {
        title: "Constitución de compañía",
        statusIndex: 1,
        contactIndex: 1,
        items: [{ description: "Redacción de documento", quantity: 1, priceCents: 15000 }],
      },
      {
        title: "Divorcio de mutuo acuerdo",
        statusIndex: 4,
        contactIndex: 2,
        items: [{ description: "Representación en juicio (cuota)", quantity: 1, priceCents: 40000 }],
      },
      {
        title: "Consulta sobre contrato de arrendamiento",
        statusIndex: 0,
        contactIndex: 1,
        items: [{ description: "Consulta jurídica", quantity: 1, priceCents: 5000 }],
      },
    ],
  },

  marketing: {
    slug: "estudios-juridicos",
    metaTitle: "Software para estudios jurídicos | Expedientes, audiencias y honorarios",
    metaDescription:
      "Sistema de gestión para abogados y estudios jurídicos: control de expedientes, alerta de " +
      "audiencias, actuaciones y honorarios. Ordenado y confidencial. Prueba gratis 14 días.",
    headline: "Ningún expediente,",
    headlineAccent: "ninguna audiencia se te pasa",
    subheadline:
      "Expedientes con su materia, juzgado, causa y contraparte. Alerta de la próxima audiencia, " +
      "registro de actuaciones y control de honorarios pactados y cobrados.",
    audience: "abogados independientes, estudios jurídicos y consultorios legales",
    painPoints: [
      {
        title: "Una audiencia que se pasa es un desastre",
        detail:
          "Un olvido puede costar el caso, el cliente y la reputación. Depender de la memoria no es una estrategia.",
      },
      {
        title: "Expedientes repartidos entre carpetas y la nube",
        detail:
          "Los escritos en una carpeta, los datos en un cuaderno, las conversaciones en WhatsApp. Nada está en un solo lugar.",
      },
      {
        title: "Los honorarios se cobran mal y tarde",
        detail:
          "Cuotas pactadas que nadie sigue, abonos que no se registran, saldos que se descubren meses después.",
      },
      {
        title: "El cliente pregunta \"¿cómo va lo mío?\"",
        detail:
          "Cada consulta implica revisar el expediente y armar la respuesta desde cero.",
      },
    ],
    features: [
      {
        title: "Expediente completo",
        detail:
          "Materia, juzgado, número de causa, contraparte, actuaciones y todos los documentos en un solo lugar.",
        icon: "folder",
      },
      {
        title: "Alerta de audiencias",
        detail:
          "Cargás la fecha y el sistema te avisa 48 horas antes. La función que sola justifica el sistema.",
        icon: "bell",
      },
      {
        title: "Registro de actuaciones",
        detail:
          "Cada movimiento con su fecha y quién lo hizo. Reconstruís el historial del caso en segundos.",
        icon: "clock",
      },
      {
        title: "Honorarios y cuotas",
        detail:
          "Lo pactado, lo cobrado y lo pendiente por cliente y por expediente.",
        icon: "wallet",
      },
      {
        title: "Documentos con tu membrete",
        detail:
          "Informes de estado, recibos de honorarios y presupuestos, generados en PDF.",
        icon: "file",
      },
      {
        title: "Confidencialidad",
        detail:
          "Roles por usuario, registro de auditoría de cada acceso y datos cifrados en tránsito.",
        icon: "shield",
      },
    ],
    faq: [
      {
        q: "¿Es seguro para información confidencial?",
        a: "Los datos viajan cifrados, cada organización está aislada de las demás y todo acceso queda registrado en la auditoría. Podés exportar y eliminar tu información cuando quieras.",
      },
      {
        q: "¿Se integra con el sistema del poder judicial?",
        a: "No. Es un sistema de gestión interna del estudio; la carga de datos de la causa es manual.",
      },
      {
        q: "¿Sirve para un abogado solo?",
        a: "Sí, es el caso más común. El plan Inicial cubre a un profesional con hasta 150 expedientes activos por mes.",
      },
    ],
    keywords: [
      "software para estudios jurídicos",
      "sistema de gestión de expedientes",
      "programa para abogados",
      "control de audiencias abogados",
      "software legal en español",
      "gestión de honorarios abogados",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// GENÉRICO
// ═══════════════════════════════════════════════════════════════

export const generic: IndustryPreset = {
  key: "generic",
  name: "Otro rubro",
  shortName: "General",
  description: "Configuración neutra que podés adaptar a tu medida.",
  icon: "📋",

  vocabulary: {
    jobSingular: "Trabajo",
    jobPlural: "Trabajos",
    assetSingular: "Activo",
    assetPlural: "Activos",
    useAssets: false,
  },

  statuses: GENERIC_STATUSES,
  customFields: [],
  products: [
    { name: "Servicio", kind: "SERVICE", priceCents: 1000 },
    { name: "Hora de trabajo", kind: "SERVICE", priceCents: 1500 },
  ],
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  notificationRules: COMMON_RULES,
  documentTemplates: DEFAULT_DOC_TEMPLATES,

  showcase: {
    contacts: [
      { name: "Cliente de ejemplo 1", phone: "+584121234567" },
      { name: "Cliente de ejemplo 2", phone: "+584241234567" },
    ],
    assets: [],
    jobs: [
      {
        title: "Trabajo de ejemplo",
        statusIndex: 0,
        contactIndex: 0,
        items: [{ description: "Servicio", quantity: 1, priceCents: 1000 }],
      },
      {
        title: "Segundo trabajo de ejemplo",
        statusIndex: 1,
        contactIndex: 1,
        items: [{ description: "Hora de trabajo", quantity: 3, priceCents: 1500 }],
      },
    ],
  },

  marketing: {
    slug: "negocios-de-servicios",
    metaTitle: "Software de gestión para negocios de servicios | Trabajos, presupuestos y cobros",
    metaDescription:
      "Sistema de gestión configurable para cualquier negocio de servicios: trabajos, presupuestos " +
      "aprobados por WhatsApp, cobros y recordatorios. Prueba gratis 14 días, sin tarjeta.",
    headline: "Ordená tu negocio de servicios",
    headlineAccent: "sin cambiar cómo trabajás",
    subheadline:
      "Trabajos, presupuestos que se aprueban desde el celular, control de cobros y recordatorios " +
      "por WhatsApp. Lo configurás a la medida de tu rubro en minutos.",
    audience: "cualquier negocio que ejecute trabajos para clientes",
    painPoints: [
      { title: "Todo vive en WhatsApp y Excel", detail: "La información está repartida y nada se cruza con nada." },
      { title: "No sabés qué está pendiente", detail: "Trabajos que se caen porque nadie los estaba mirando." },
      { title: "Los presupuestos se pierden", detail: "Mandás el precio y no sabés si lo vieron ni si lo aprobaron." },
      { title: "No sabés cuánto te deben", detail: "Cobros parciales anotados en papel que nunca cuadran." },
    ],
    features: [
      { title: "Tablero de trabajos", detail: "Estados a tu medida y arrastre entre columnas.", icon: "layout" },
      { title: "Presupuestos en línea", detail: "El cliente aprueba desde el celular y te llega el aviso.", icon: "file" },
      { title: "Control de cobros", detail: "Quién te debe, cuánto y desde cuándo.", icon: "wallet" },
      { title: "Recordatorios", detail: "Avisos por WhatsApp sin escribir el mensaje cada vez.", icon: "message" },
      { title: "Campos a tu medida", detail: "Agregá los datos que tu rubro necesita, sin programar.", icon: "settings" },
      { title: "Historial completo", detail: "Todo lo que hiciste por cada cliente, siempre disponible.", icon: "clock" },
    ],
    faq: [
      { q: "¿Sirve para mi rubro?", a: "Si tu negocio ejecuta trabajos identificables para clientes identificables, sirve. Configurás los estados, los campos y el vocabulario a tu medida." },
      { q: "¿Cuánto tarda en estar listo?", a: "Elegís tu rubro al registrarte y el sistema queda configurado en menos de cinco minutos, con datos de ejemplo para que veas cómo funciona." },
      { q: "¿Necesito tarjeta para probar?", a: "No. La prueba de 14 días no pide tarjeta ni datos de pago." },
    ],
    keywords: [
      "software de gestión para pymes",
      "sistema de órdenes de trabajo",
      "programa de gestión de servicios",
      "software para negocios de servicios",
      "control de trabajos y presupuestos",
    ],
  },
};
