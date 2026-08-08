import type { IndustryPreset } from "../types";
import {
  COMMON_RULES,
  DEFAULT_DOC_TEMPLATES,
  DEFAULT_PAYMENT_METHODS,
  STATUS_COLORS as C,
} from "../shared";

// ═══════════════════════════════════════════════════════════════
// TALLER MECÁNICO
// ═══════════════════════════════════════════════════════════════

export const automotriz: IndustryPreset = {
  key: "automotriz",
  name: "Taller mecánico",
  shortName: "Talleres",
  description:
    "Órdenes de trabajo, historial por vehículo, presupuestos y entrega.",
  icon: "🔧",

  vocabulary: {
    jobSingular: "Orden de trabajo",
    jobPlural: "Órdenes de trabajo",
    assetSingular: "Vehículo",
    assetPlural: "Vehículos",
    useAssets: true,
  },

  statuses: [
    { name: "Recibido", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "En diagnóstico", kind: "IN_PROGRESS", color: C.sky },
    { name: "Presupuestado", kind: "WAITING", color: C.amber },
    { name: "Aprobado", kind: "IN_PROGRESS", color: C.violet },
    { name: "Esperando repuesto", kind: "WAITING", color: C.red },
    { name: "En reparación", kind: "IN_PROGRESS", color: C.blue },
    { name: "Listo para entregar", kind: "IN_PROGRESS", color: C.emerald },
    { name: "Entregado", kind: "DONE", color: C.green },
    { name: "Cancelado", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    { entity: "ASSET", key: "marca", label: "Marca", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "modelo", label: "Modelo", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "anio", label: "Año", type: "NUMBER", showInList: true },
    { entity: "ASSET", key: "placa", label: "Placa", type: "TEXT", required: true, showInList: true },
    { entity: "ASSET", key: "vin", label: "Serial / VIN", type: "TEXT" },
    { entity: "ASSET", key: "color", label: "Color", type: "TEXT" },
    {
      entity: "ASSET",
      key: "combustible",
      label: "Combustible",
      type: "SELECT",
      options: ["Gasolina", "Diésel", "Gas", "Híbrido", "Eléctrico"],
    },
    { entity: "JOB", key: "kilometraje", label: "Kilometraje", type: "NUMBER", showInList: true },
    {
      entity: "JOB",
      key: "nivel_gasolina",
      label: "Nivel de gasolina al ingreso",
      type: "SELECT",
      options: ["Reserva", "1/4", "1/2", "3/4", "Lleno"],
    },
    { entity: "JOB", key: "sintoma", label: "Síntoma reportado", type: "MULTILINE" },
    { entity: "JOB", key: "diagnostico", label: "Diagnóstico", type: "MULTILINE" },
    { entity: "JOB", key: "autoriza_piezas", label: "Autoriza retirar piezas", type: "BOOLEAN" },
  ],

  products: [
    { name: "Cambio de aceite y filtro", kind: "SERVICE", priceCents: 4500 },
    { name: "Alineación y balanceo", kind: "SERVICE", priceCents: 3000 },
    { name: "Diagnóstico computarizado", kind: "SERVICE", priceCents: 2500 },
    { name: "Cambio de pastillas de freno", kind: "SERVICE", priceCents: 5500 },
    { name: "Mano de obra (hora)", kind: "SERVICE", priceCents: 1500 },
    { name: "Revisión de 20 puntos", kind: "SERVICE", priceCents: 2000 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "job.status.done",
      channel: "WHATSAPP",
      offsetMinutes: 0,
      bodyTemplate:
        "¡Hola {{contact.name}}! Tu {{asset.label}} está listo para retirar. " +
        "Orden {{job.code}}. Te esperamos en {{org.address}}.",
    },
  ],

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "CERTIFICATE",
      name: "Acta de entrega",
      title: "Acta de entrega de vehículo",
      footerNote:
        "El cliente retira el vehículo conforme y declara haber verificado los trabajos realizados.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Carlos Mendoza", phone: "+584121234567", email: "carlos@ejemplo.com" },
      { name: "María Rodríguez", phone: "+584241234567" },
      { name: "Transporte Andino C.A.", phone: "+584161234567" },
      { name: "José Pérez", phone: "+584121112233" },
      { name: "Ana Gómez", phone: "+584145556677" },
    ],
    assets: [
      { label: "Toyota Corolla 2018", identifier: "AB123CD", contactIndex: 0 },
      { label: "Chevrolet Aveo 2015", identifier: "XY456ZW", contactIndex: 1 },
      { label: "Ford Cargo 1721", identifier: "TR789PQ", contactIndex: 2 },
    ],
    jobs: [
      {
        title: "Ruido en el tren delantero",
        statusIndex: 1,
        contactIndex: 0,
        assetIndex: 0,
        items: [{ description: "Diagnóstico computarizado", quantity: 1, priceCents: 2500 }],
      },
      {
        title: "Servicio de 10.000 km",
        statusIndex: 3,
        contactIndex: 1,
        assetIndex: 1,
        items: [
          { description: "Cambio de aceite y filtro", quantity: 1, priceCents: 4500 },
          { description: "Revisión de 20 puntos", quantity: 1, priceCents: 2000 },
        ],
      },
      {
        title: "Cambio de pastillas y discos",
        statusIndex: 4,
        contactIndex: 2,
        assetIndex: 2,
        items: [
          { description: "Cambio de pastillas de freno", quantity: 1, priceCents: 5500 },
          { description: "Mano de obra (hora)", quantity: 3, priceCents: 1500 },
        ],
      },
      {
        title: "Alineación y balanceo",
        statusIndex: 6,
        contactIndex: 3,
        items: [{ description: "Alineación y balanceo", quantity: 1, priceCents: 3000 }],
      },
      {
        title: "Revisión de aire acondicionado",
        statusIndex: 0,
        contactIndex: 4,
        items: [{ description: "Mano de obra (hora)", quantity: 2, priceCents: 1500 }],
      },
      {
        title: "Cambio de correa de tiempo",
        statusIndex: 7,
        contactIndex: 0,
        assetIndex: 0,
        items: [{ description: "Mano de obra (hora)", quantity: 6, priceCents: 1500 }],
      },
    ],
  },

  marketing: {
    slug: "talleres-mecanicos",
    metaTitle: "Software para talleres mecánicos | Órdenes de trabajo y presupuestos",
    metaDescription:
      "Sistema de gestión para talleres mecánicos: órdenes de trabajo, historial por vehículo, " +
      "presupuestos que el cliente aprueba desde el celular y avisos por WhatsApp. Prueba gratis 14 días.",
    headline: "El software que ordena tu taller",
    headlineAccent: "sin cambiar cómo trabajás",
    subheadline:
      "Órdenes de trabajo, historial completo de cada vehículo, presupuestos que tu cliente " +
      "aprueba desde el celular y avisos automáticos por WhatsApp. Configurado para talleres en 5 minutos.",
    audience: "talleres mecánicos, servicios automotrices y latoneria",
    painPoints: [
      {
        title: "No encontrás el historial de un vehículo",
        detail:
          "Un cliente vuelve a los seis meses y nadie recuerda qué se le hizo. Buscás en el cuaderno, en el chat, en la cabeza del mecánico.",
      },
      {
        title: "Los presupuestos se pierden en WhatsApp",
        detail:
          "Mandás una foto del presupuesto escrito a mano y después nadie sabe si lo aprobaron, cuándo, ni por cuánto.",
      },
      {
        title: "El cliente llama cada dos horas",
        detail:
          "\"¿Cómo va mi carro?\" es la pregunta que más tiempo te consume al día, y siempre interrumpe.",
      },
      {
        title: "No sabés cuánto te deben",
        detail:
          "Trabajos entregados sin cobrar, abonos parciales anotados en papel. Al cierre del mes las cuentas nunca cuadran.",
      },
    ],
    features: [
      {
        title: "Tablero de órdenes",
        detail:
          "Todas las órdenes en columnas: Recibido, Diagnóstico, Esperando repuesto, En reparación, Listo. Arrastrás y se actualiza.",
        icon: "layout",
      },
      {
        title: "Ficha del vehículo",
        detail:
          "Placa, marca, modelo, kilometraje y todo lo que le hiciste desde siempre. Buscás por placa y aparece todo.",
        icon: "car",
      },
      {
        title: "Presupuestos que se aprueban solos",
        detail:
          "Generás el presupuesto, lo mandás por WhatsApp, el cliente lo abre en el celular y toca Aprobar. Te llega el aviso al instante.",
        icon: "file",
      },
      {
        title: "Avisos automáticos",
        detail:
          "\"Tu vehículo está listo\" se envía solo al cambiar el estado. Dejás de contestar la misma pregunta 20 veces al día.",
        icon: "message",
      },
      {
        title: "Control de cobros",
        detail:
          "Quién te debe, cuánto y desde cuándo. Con recordatorio de cobro por WhatsApp en un clic.",
        icon: "wallet",
      },
      {
        title: "Repuestos y mano de obra",
        detail:
          "Catálogo con tus precios. Armás el presupuesto en 30 segundos y actualizás todos los precios de golpe cuando cambia el dólar.",
        icon: "package",
      },
    ],
    faq: [
      {
        q: "¿Sirve para un taller chico de dos personas?",
        a: "Sí. De hecho es donde más se nota: sin sistema, todo depende de la memoria del dueño. El plan Inicial está pensado exactamente para ese tamaño.",
      },
      {
        q: "¿Mis mecánicos van a poder usarlo?",
        a: "Se usa desde el celular y son tres botones: ver la orden, cambiar el estado, subir una foto. La primera semana te acompañamos para que el equipo lo tome sin fricción.",
      },
      {
        q: "¿Puedo pasar mis clientes desde Excel?",
        a: "Sí, se importan desde un archivo CSV o Excel. En el plan Profesional te ayudamos con la carga inicial nosotros mismos.",
      },
      {
        q: "¿Emite facturas fiscales?",
        a: "No. Emite presupuestos, órdenes de trabajo, notas de entrega y recibos de control interno. La facturación fiscal la seguís haciendo por donde ya la hacés.",
      },
      {
        q: "¿Qué pasa si me quiero ir?",
        a: "Exportás toda tu información en un clic, cuando quieras, sin pedir permiso. Tus datos son tuyos.",
      },
      {
        q: "¿Necesito instalar algo?",
        a: "No. Funciona en el navegador, en la computadora del taller y en el celular. También se puede instalar como aplicación en el teléfono.",
      },
    ],
    keywords: [
      "software para taller mecánico",
      "sistema de órdenes de trabajo taller",
      "programa para talleres automotrices",
      "gestión de taller mecánico online",
      "app para talleres mecánicos",
      "control de órdenes de trabajo mecánica",
      "software taller mecánico Venezuela",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO TÉCNICO
// ═══════════════════════════════════════════════════════════════

export const servicioTecnico: IndustryPreset = {
  key: "servicio_tecnico",
  name: "Servicio técnico",
  shortName: "Servicio técnico",
  description:
    "Reparaciones con equipo, falla, presupuesto, garantía y entrega.",
  icon: "🖥️",

  vocabulary: {
    jobSingular: "Reparación",
    jobPlural: "Reparaciones",
    assetSingular: "Equipo",
    assetPlural: "Equipos",
    useAssets: true,
  },

  statuses: [
    { name: "Recibido", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "En diagnóstico", kind: "IN_PROGRESS", color: C.sky },
    { name: "Presupuestado", kind: "WAITING", color: C.amber },
    { name: "Aprobado", kind: "IN_PROGRESS", color: C.violet },
    { name: "Esperando repuesto", kind: "WAITING", color: C.red },
    { name: "En reparación", kind: "IN_PROGRESS", color: C.blue },
    { name: "Reparado", kind: "IN_PROGRESS", color: C.emerald },
    { name: "Entregado", kind: "DONE", color: C.green },
    { name: "Sin reparación", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    {
      entity: "ASSET",
      key: "tipo_equipo",
      label: "Tipo de equipo",
      type: "SELECT",
      options: ["Laptop", "PC de escritorio", "Celular", "Tablet", "Impresora", "Televisor", "Electrodoméstico", "Otro"],
      showInList: true,
    },
    { entity: "ASSET", key: "marca", label: "Marca", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "modelo", label: "Modelo", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "serie", label: "Número de serie", type: "TEXT", showInList: true },
    { entity: "JOB", key: "falla_reportada", label: "Falla reportada", type: "MULTILINE", required: true },
    { entity: "JOB", key: "diagnostico_tecnico", label: "Diagnóstico técnico", type: "MULTILINE" },
    { entity: "JOB", key: "trabajo_realizado", label: "Trabajo realizado", type: "MULTILINE" },
    { entity: "JOB", key: "accesorios", label: "Accesorios entregados", type: "MULTILINE" },
    { entity: "JOB", key: "clave_equipo", label: "Clave / patrón del equipo", type: "TEXT" },
    { entity: "JOB", key: "garantia_dias", label: "Garantía (días)", type: "NUMBER" },
    { entity: "JOB", key: "en_garantia", label: "¿Entra en garantía?", type: "BOOLEAN" },
  ],

  products: [
    { name: "Revisión y diagnóstico", kind: "SERVICE", priceCents: 1500 },
    { name: "Mantenimiento y limpieza interna", kind: "SERVICE", priceCents: 3000 },
    { name: "Instalación de sistema operativo", kind: "SERVICE", priceCents: 2500 },
    { name: "Cambio de pantalla", kind: "SERVICE", priceCents: 8000 },
    { name: "Recuperación de datos", kind: "SERVICE", priceCents: 6000 },
    { name: "Mano de obra (hora)", kind: "SERVICE", priceCents: 1200 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "job.status.done",
      channel: "WHATSAPP",
      offsetMinutes: 0,
      bodyTemplate:
        "Hola {{contact.name}}, tu {{asset.label}} ya está reparado y listo para retirar. " +
        "Referencia {{job.code}}. Horario: {{org.phone}}.",
    },
  ],

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "CERTIFICATE",
      name: "Certificado de garantía",
      title: "Certificado de garantía",
      footerNote:
        "La garantía cubre exclusivamente el trabajo detallado. No cubre daños por golpes, líquidos ni manipulación de terceros.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Luis Fernández", phone: "+584121234567" },
      { name: "Comercial Delta C.A.", phone: "+584241234567" },
      { name: "Patricia Silva", phone: "+584161234567" },
      { name: "Roberto Díaz", phone: "+584121112233" },
    ],
    assets: [
      { label: "Laptop HP Pavilion 15", identifier: "SN-8842011", contactIndex: 0 },
      { label: "Impresora Epson L3150", identifier: "SN-3391822", contactIndex: 1 },
      { label: "iPhone 12", identifier: "IMEI-3548...", contactIndex: 2 },
    ],
    jobs: [
      {
        title: "No enciende, posible fuente",
        statusIndex: 1,
        contactIndex: 0,
        assetIndex: 0,
        items: [{ description: "Revisión y diagnóstico", quantity: 1, priceCents: 1500 }],
      },
      {
        title: "Atasco de papel y limpieza de cabezal",
        statusIndex: 5,
        contactIndex: 1,
        assetIndex: 1,
        items: [{ description: "Mantenimiento y limpieza interna", quantity: 1, priceCents: 3000 }],
      },
      {
        title: "Pantalla rota",
        statusIndex: 2,
        contactIndex: 2,
        assetIndex: 2,
        items: [{ description: "Cambio de pantalla", quantity: 1, priceCents: 8000 }],
      },
      {
        title: "Instalación de Windows y programas",
        statusIndex: 7,
        contactIndex: 3,
        items: [{ description: "Instalación de sistema operativo", quantity: 1, priceCents: 2500 }],
      },
      {
        title: "Equipo lento, mantenimiento general",
        statusIndex: 0,
        contactIndex: 0,
        items: [{ description: "Mantenimiento y limpieza interna", quantity: 1, priceCents: 3000 }],
      },
    ],
  },

  marketing: {
    slug: "servicio-tecnico",
    metaTitle: "Software para servicio técnico | Control de reparaciones y garantías",
    metaDescription:
      "Sistema para servicios técnicos de electrodomésticos, computación y celulares: control de " +
      "reparaciones, equipos recibidos, presupuestos por WhatsApp y garantías. Prueba gratis 14 días.",
    headline: "Cada equipo que entra,",
    headlineAccent: "con su historia completa",
    subheadline:
      "Controlá qué equipo entró, quién lo trajo, qué accesorios dejó, qué falla tenía y en qué " +
      "estado está. Presupuestos por WhatsApp y garantías que no se pierden.",
    audience: "servicios técnicos de electrodomésticos, computación, celulares y electrónica",
    painPoints: [
      {
        title: "Discusiones en la entrega",
        detail:
          "\"Yo dejé el cargador\". Sin un registro de los accesorios recibidos, la discusión siempre la perdés vos.",
      },
      {
        title: "Equipos que se acumulan sin dueño claro",
        detail:
          "Aparatos en el estante con una cinta y un nombre a medio escribir. Nadie recuerda de quién es ni qué tenía.",
      },
      {
        title: "Presupuestos que nadie contesta",
        detail:
          "Mandás el precio y el cliente desaparece. Sin seguimiento, ese trabajo se pierde y el equipo ocupa lugar durante meses.",
      },
      {
        title: "Garantías imposibles de verificar",
        detail:
          "Vuelve un cliente reclamando garantía y no tenés forma de saber qué se le hizo ni cuándo.",
      },
    ],
    features: [
      {
        title: "Recepción con accesorios",
        detail:
          "Registrás qué entró con el equipo y el cliente lo recibe por escrito. Se acabaron las discusiones.",
        icon: "package",
      },
      {
        title: "Ficha por equipo",
        detail:
          "Marca, modelo, número de serie e historial de todas las reparaciones que pasó por tus manos.",
        icon: "cpu",
      },
      {
        title: "Presupuesto y aprobación remota",
        detail:
          "El cliente aprueba o rechaza desde el celular. Si rechaza, sabés de inmediato que puede pasar a retirarlo.",
        icon: "file",
      },
      {
        title: "Control de garantías",
        detail:
          "Cada reparación guarda sus días de garantía y qué se hizo exactamente. Verificás un reclamo en segundos.",
        icon: "shield",
      },
      {
        title: "Aviso de equipo listo",
        detail:
          "Al marcarlo como reparado, el mensaje sale solo. Menos equipos durmiendo en el estante.",
        icon: "message",
      },
      {
        title: "Cobros y abonos",
        detail:
          "Anticipos, saldos y quién debe qué. Todo cuadrado sin cuaderno.",
        icon: "wallet",
      },
    ],
    faq: [
      {
        q: "¿Sirve para reparación de celulares?",
        a: "Sí. El campo de clave o patrón del equipo, el IMEI y el registro de accesorios están pensados exactamente para eso.",
      },
      {
        q: "¿Puedo imprimir el comprobante de recepción?",
        a: "Sí, se genera en PDF con tu logo y los datos del equipo y los accesorios. Se imprime o se manda por WhatsApp.",
      },
      {
        q: "¿Maneja repuestos e inventario?",
        a: "Sí, el catálogo permite marcar productos con control de stock y te avisa cuando bajan del mínimo.",
      },
      {
        q: "¿Puedo tener varios técnicos con su propio acceso?",
        a: "Sí. Cada uno con su usuario y su rol. Ves quién hizo cada cosa y cuándo.",
      },
    ],
    keywords: [
      "software para servicio técnico",
      "sistema de reparaciones",
      "programa para taller de electrónica",
      "control de reparaciones celulares",
      "software servicio técnico computadoras",
      "gestión de garantías reparaciones",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// SERVICIOS DE CAMPO
// ═══════════════════════════════════════════════════════════════

export const serviciosCampo: IndustryPreset = {
  key: "servicios_campo",
  name: "Servicios de campo",
  shortName: "Servicios de campo",
  description:
    "Fumigación, refrigeración, ascensores, mantenimiento en sitio del cliente.",
  icon: "🛠️",

  vocabulary: {
    jobSingular: "Servicio",
    jobPlural: "Servicios",
    assetSingular: "Instalación",
    assetPlural: "Instalaciones",
    useAssets: true,
  },

  statuses: [
    { name: "Solicitado", kind: "OPEN", color: C.slate, isDefault: true },
    { name: "Programado", kind: "WAITING", color: C.amber },
    { name: "Asignado", kind: "IN_PROGRESS", color: C.violet },
    { name: "En sitio", kind: "IN_PROGRESS", color: C.blue },
    { name: "Completado", kind: "DONE", color: C.green },
    { name: "Requiere seguimiento", kind: "WAITING", color: C.red },
    { name: "Cancelado", kind: "CANCELLED", color: C.gray },
  ],

  customFields: [
    { entity: "ASSET", key: "direccion_sitio", label: "Dirección del sitio", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "tipo_instalacion", label: "Tipo de instalación", type: "TEXT", showInList: true },
    { entity: "ASSET", key: "referencia_acceso", label: "Referencia de acceso", type: "MULTILINE" },
    {
      entity: "JOB",
      key: "tipo_servicio",
      label: "Tipo de servicio",
      type: "SELECT",
      options: ["Mantenimiento preventivo", "Correctivo", "Instalación", "Inspección", "Emergencia"],
      showInList: true,
    },
    { entity: "JOB", key: "trabajo_realizado", label: "Trabajo realizado", type: "MULTILINE" },
    { entity: "JOB", key: "materiales_usados", label: "Materiales utilizados", type: "MULTILINE" },
    { entity: "JOB", key: "recibido_por", label: "Recibido por (nombre)", type: "TEXT" },
    { entity: "JOB", key: "proximo_mantenimiento", label: "Próximo mantenimiento", type: "DATE", showInList: true },
  ],

  products: [
    { name: "Visita técnica", kind: "SERVICE", priceCents: 3000 },
    { name: "Mantenimiento preventivo", kind: "SERVICE", priceCents: 6000 },
    { name: "Servicio de emergencia", kind: "SERVICE", priceCents: 9000 },
    { name: "Mano de obra (hora)", kind: "SERVICE", priceCents: 2000 },
  ],

  paymentMethods: DEFAULT_PAYMENT_METHODS,

  notificationRules: [
    ...COMMON_RULES,
    {
      event: "job.status.done",
      channel: "WHATSAPP",
      offsetMinutes: 0,
      bodyTemplate:
        "Hola {{contact.name}}, completamos el servicio {{job.code}} en {{asset.label}}. " +
        "Te dejamos el informe acá: {{job.publicUrl}}",
    },
    {
      event: "maintenance.due",
      channel: "WHATSAPP",
      offsetMinutes: -10080,
      bodyTemplate:
        "Hola {{contact.name}}, se acerca el mantenimiento programado de {{asset.label}}. " +
        "¿Coordinamos fecha?",
    },
  ],

  documentTemplates: [
    ...DEFAULT_DOC_TEMPLATES,
    {
      kind: "CERTIFICATE",
      name: "Certificado de servicio",
      title: "Certificado de servicio",
      footerNote:
        "Se certifica la ejecución del servicio detallado conforme a las normas vigentes.",
    },
  ],

  showcase: {
    contacts: [
      { name: "Residencias El Parque", phone: "+584121234567" },
      { name: "Supermercado La Cesta", phone: "+584241234567" },
      { name: "Clínica San Rafael", phone: "+584161234567" },
      { name: "Panadería Doña Rosa", phone: "+584121112233" },
    ],
    assets: [
      { label: "Ascensor torre A", identifier: "ASC-01", contactIndex: 0 },
      { label: "Cava de refrigeración principal", identifier: "CAVA-03", contactIndex: 1 },
      { label: "Sistema de aire central", identifier: "AC-CEN-1", contactIndex: 2 },
    ],
    jobs: [
      {
        title: "Mantenimiento mensual programado",
        statusIndex: 1,
        contactIndex: 0,
        assetIndex: 0,
        items: [{ description: "Mantenimiento preventivo", quantity: 1, priceCents: 6000 }],
      },
      {
        title: "Cava no enfría correctamente",
        statusIndex: 3,
        contactIndex: 1,
        assetIndex: 1,
        items: [{ description: "Servicio de emergencia", quantity: 1, priceCents: 9000 }],
      },
      {
        title: "Revisión trimestral de aire central",
        statusIndex: 4,
        contactIndex: 2,
        assetIndex: 2,
        items: [{ description: "Mantenimiento preventivo", quantity: 1, priceCents: 6000 }],
      },
      {
        title: "Control de plagas mensual",
        statusIndex: 0,
        contactIndex: 3,
        items: [{ description: "Visita técnica", quantity: 1, priceCents: 3000 }],
      },
    ],
  },

  marketing: {
    slug: "servicios-de-campo",
    metaTitle: "Software para servicios de campo | Partes de trabajo y mantenimientos",
    metaDescription:
      "Gestión de servicios en sitio: partes de trabajo desde el celular, mantenimientos " +
      "programados que se generan solos, certificados y control de técnicos. Prueba gratis 14 días.",
    headline: "Tus técnicos en la calle,",
    headlineAccent: "vos con todo bajo control",
    subheadline:
      "Partes de trabajo desde el celular, historial por instalación, certificados automáticos y " +
      "mantenimientos programados que te avisan antes de que el cliente los pida.",
    audience:
      "empresas de fumigación, refrigeración, ascensores, aire acondicionado y mantenimiento industrial",
    painPoints: [
      {
        title: "Los partes de trabajo llegan en papel arrugado",
        detail:
          "El técnico vuelve el viernes con seis papeles y hay que pasarlos a mano. La mitad son ilegibles.",
      },
      {
        title: "Los mantenimientos se olvidan",
        detail:
          "El contrato dice trimestral, pero nadie lleva la cuenta. El cliente se da cuenta antes que vos y renegocia a la baja.",
      },
      {
        title: "No sabés qué hizo cada técnico",
        detail:
          "Un cliente reclama y no tenés registro de qué se hizo, cuándo ni quién estuvo en el sitio.",
      },
      {
        title: "Certificados hechos a mano",
        detail:
          "Cada certificado es media hora de Word. Multiplicado por 40 servicios al mes, es una semana de trabajo perdida.",
      },
    ],
    features: [
      {
        title: "Parte de trabajo desde el celular",
        detail:
          "El técnico completa el servicio en el sitio, con fotos y nombre de quien recibe. Llega a la oficina al instante.",
        icon: "smartphone",
      },
      {
        title: "Mantenimientos que se agendan solos",
        detail:
          "Cargás la fecha del próximo mantenimiento y el sistema te avisa una semana antes. Ingreso recurrente asegurado.",
        icon: "calendar",
      },
      {
        title: "Historial por instalación",
        detail:
          "Cada ascensor, cava o equipo con todo lo que se le hizo desde el primer día.",
        icon: "building",
      },
      {
        title: "Certificados automáticos",
        detail:
          "Se generan con tu formato y tu logo al completar el servicio. Se envían por WhatsApp o email.",
        icon: "award",
      },
      {
        title: "Asignación por técnico",
        detail:
          "Ves la carga de cada uno, quién está libre y qué servicios quedaron pendientes.",
        icon: "users",
      },
      {
        title: "Contratos y cobros",
        detail:
          "Qué cliente tiene abono mensual, quién pagó y quién debe. Ordenado por antigüedad.",
        icon: "wallet",
      },
    ],
    faq: [
      {
        q: "¿Funciona sin internet en el sitio?",
        a: "El técnico necesita conexión para enviar el parte. En zonas sin señal puede completarlo al salir; la información no se pierde.",
      },
      {
        q: "¿Puede firmar el cliente en el celular?",
        a: "En esta versión se registra el nombre de quien recibe y se envía el comprobante por WhatsApp. La firma digital está en el plan de desarrollo.",
      },
      {
        q: "¿Sirve para contratos de mantenimiento recurrente?",
        a: "Sí, es uno de los casos centrales. El campo de próximo mantenimiento genera el aviso y podés duplicar el servicio anterior con un clic.",
      },
    ],
    keywords: [
      "software para servicios de campo",
      "sistema de partes de trabajo",
      "programa para empresas de mantenimiento",
      "software fumigación control de plagas",
      "gestión de mantenimientos preventivos",
      "software para refrigeración y aire acondicionado",
    ],
  },
};
