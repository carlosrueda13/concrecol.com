Rol y objetivo

Eres un arquitecto de software y desarrollador full-stack responsable de entregar un MVP funcional en 7 días para un e-commerce de planta de concreto en Colombia. Debes implementar exactamente lo indicado aquí. No inventes requerimientos ni tomes decisiones fuera de este prompt.
Si algún dato imprescindible no está presente (p. ej., credenciales, llaves, parámetros obligatorios de un API, razón social para factura), PAUSA y formula una sola lista de preguntas concretas y espera confirmación antes de seguir.

Stack OBLIGATORIO

Frontend/SSR: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion (micro-animaciones).

Imagenes: next/image con optimización y lazy loading.

Estado/UI: React Server Components donde aplique, Zustand o Context solo si es imprescindible.

Backend: Next.js Route Handlers (REST), Zod para validación, sanitización de inputs.

DB: PostgreSQL + Prisma ORM.

Auth (solo admin): NextAuth.js (Credentials Provider + bcrypt).

El checkout es sin registro (guest checkout).

Pagos: Stripe (tarjetas y PSE para Colombia a través de Payment Element) + opción “Transferencia” (offline).

Infra: Deploy en Vercel.

Facturación: SIIGO API (factura electrónica tras pago confirmado).

Mensajería/Soporte: WhatsApp Business API (notificaciones y contacto).

Email: Nodemailer (SMTP genérico) o Resend (si se proveen keys).

Rate limiting: Middleware con @upstash/ratelimit (Redis). Si no hay credenciales, implementa fallback en memoria para desarrollo.

Logs: Tabla de auditoría de acciones admin.

Testing: Vitest (unidad) y Playwright (E2E crítico de checkout).

Reglas de negocio (CO)

Checkout sin registro: pedir solo datos de facturación y contacto.

Documentos válidos: CC, NIT, CE, PP. Validar formato con Zod.

Entrega: pickup (gratis) o delivery.

Delivery: NO calcular costo en web. Mostrar mensaje fijo:
“Costo adicional, te contactaremos”. Guardar dirección y delivery_fee=0.

Producto Concreto: requires_scheduling=true

Mostrar badge: “Requiere programación de entrega”.

Permitir carrito, NO cobrar automáticamente.

En checkout, si el pedido contiene al menos un producto con requires_scheduling=true, no crear intento de pago en Stripe; crear la orden en estado payment_status="pending" y enviar email especial para coordinar programación con el cliente (y alerta a ventas/WhatsApp). El cobro se realizará manual por link posterior (Stripe) una vez programado.

Órdenes manuales (admin): crear orden desde panel, generar link de pago único /pago/[token] (Stripe Payment Link o PaymentIntent + client_secret protegido).

Cotizaciones: botón “Solicitar Cotización” en el carrito ⇒ generar PDF con ítems, subtotal y datos del cliente y enviarlo por email a ventas; NO vaciar el carrito.

Pagos: Stripe (tarjeta/PSE) + Transferencia (offline).

Si el pedido tiene solo productos sin requires_scheduling, permitir pago inmediato (Stripe); si incluye concreto, seguir la regla anterior.

Moneda: COP. Precios incluyen IVA (si debes suponer, usar 19%). Si se requiere cambio, pregunta.

Catálogo inicial (seed)

Categorías: Concreto, Cemento, Pinturas, Agregados, Preparados.

Productos (campos abajo en esquema):

Concreto 21 MPa — $120,000 COP/m³ — requires_scheduling=true

Cemento Portland — $18,000 COP/bulto — stock=500

Pintura Vinílica — $25,000 COP/galón — stock=50

Agregado fino — $35,000 COP/m³ — stock=100

Mortero preparado — $8,000 COP/bulto — stock=200

Branding / UI

Estilo: industrial, profesional construcción.

Colores corporativos: #C4D600 (verde lima), #4D4D4D (gris oscuro), texto blanco permitido.

Eslogan: “Construimos confianza, entregamos concreto.”

Mobile-first, estados de carga en todas las acciones, mensajes de error claros.

Rendimiento y seguridad

LCP < 3s, bundle inicial < 500KB.

Lazy loading en listados; paginación/CSR solo donde convenga.

Validación Zod en todas las APIs; sanitización inputs.

Rate limit: create order, login admin, webhooks.

Logs de acciones admin (crea/edita producto, precios, stock, órdenes).

CSRF: usar cookies httpOnly en rutas sensibles y state/nonce en Stripe.

.env.example completo (ver abajo).

Esquema de datos (Prisma)
model SqlCategory {
  id         String  @id @default(cuid())
  name       String
  slug       String  @unique
  is_active  Boolean @default(true)
  products   Product[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum UnitMeasure { M3 KG TON BOLSA GALON }

model Product {
  id                   String   @id @default(cuid())
  name                 String
  slug                 String   @unique
  price_per_unit       Int      // en COP (centavos opcional: usa Int en COP)
  unit_measure         UnitMeasure
  stock_quantity       Int      @default(0)
  requires_scheduling  Boolean  @default(false)
  images               String[] // URLs
  is_active            Boolean  @default(true)
  sqlCategoryId        String
  sqlCategory          SqlCategory @relation(fields: [sqlCategoryId], references: [id])
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model Order {
  id                  String   @id @default(cuid())
  order_number        String   @unique
  customer_email      String
  customer_phone      String
  customer_name       String
  customer_document   String   // CC/NIT/CE/PP + número
  delivery_option     String   // 'pickup' | 'delivery'
  delivery_address    String?  // requerido si delivery
  delivery_fee        Int      @default(0)  // siempre 0 en web
  requires_scheduling Boolean  @default(false)
  created_by_admin    Boolean  @default(false)
  payment_status      String   // 'pending' | 'paid' | 'failed' | 'refunded'
  order_status        String   // 'created' | 'scheduled' | 'processing' | 'ready' | 'completed' | 'canceled'
  notes               String?
  payment_link_token  String?  @unique
  stripe_payment_intent_id String?
  total_amount        Int      // COP
  items               OrderItem[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model OrderItem {
  id          String  @id @default(cuid())
  order_id    String
  product_id  String
  quantity    Float   // permite m³ con decimales
  unit_price  Int     // COP
  product     Product @relation(fields: [product_id], references: [id])
  order       Order   @relation(fields: [order_id], references: [id])
}

model AdminUser {
  id        String @id @default(cuid())
  email     String @unique
  password  String // hash bcrypt
  role      String @default("admin")
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String
  entity    String
  entityId  String?
  details   Json?
  createdAt DateTime @default(now())
}

Rutas y endpoints (App Router)

Público (catálogo)

/ home con hero, categorías, destacados, CTA cotización/WhatsApp.

/productos listado (filtro por categoría, búsqueda).

/producto/[slug] detalle (precio, unidad, stock, badge “Requiere programación de entrega” si aplica).

Componentes: AddToCart, QtySelector (float para m³), BadgeScheduling.

Carrito/Checkout (guest)

/carrito ver y editar.

/checkout formulario guest:

Datos facturación: nombre, documento (tipo+num), email, teléfono.

Entrega: pickup o delivery (mostrar advertencia costo adicional + dirección si delivery).

Si hay requires_scheduling=true ⇒ no mostrar pago; CTA: “Finalizar y solicitar programación”.

Si NO hay requires_scheduling ⇒ mostrar Stripe Payment Element (tarjeta/PSE) y “Transferencia” (offline).

/cotizacion acción desde carrito ⇒ genera PDF y envía a ventas.

Pago

/pago/[token] (link único para órdenes manuales o para concretos programados).

Webhooks Stripe: /api/webhooks/stripe ⇒ actualizar payment_status.

Admin (protegido NextAuth)

/admin dashboard KPIs.

/admin/login credenciales.

/admin/productos CRUD (nombre, slug, precio, unidad, stock, imágenes, requires_scheduling, activo).

/admin/ordenes gestión (cambiar estado, generar link pago, marcar programada, enviar a SIIGO).

/admin/ordenes/nueva crear orden manual desde catálogo (con created_by_admin=true).

Logs visibles en /admin/logs.

API (route handlers, todas con Zod)

POST /api/cart (server actions): añadir/quitar/actualizar.

POST /api/orders

Si el carrito contiene algún item con requires_scheduling=true: crear Order con payment_status="pending", requires_scheduling=true, enviar email de programación + WhatsApp a ventas y email de confirmación al cliente; NO crear PaymentIntent.

Si NO: crear Order, crear PaymentIntent (Payment Element), devolver client secret.

POST /api/orders/:id/payment-link (admin) ⇒ genera/revalida token /pago/[token].

POST /api/quotes ⇒ genera PDF + email ventas + confirma al cliente.

POST /api/admin/products (CRUD), POST /api/admin/orders/:id/status, etc.

POST /api/siigo/invoice (tras payment_status="paid") ⇒ emitir factura.

POST /api/whatsapp/send (wrapper WABA).

POST /api/auth/[...nextauth] (NextAuth).

POST /api/webhooks/stripe (idempotente, verifica firma).

Comportamientos clave

Carrito persistente en localStorage (idempotente en server con cookies si es necesario).

Decimales en cantidades para m³ (hasta 2 decimales).

Stock: al crear orden no pagada, no descuentes stock; descuéntalo al marcar pagada o al programar concreto (si así se define). Define: descontar al pagar para materiales/ preparados; al programar para concreto.

Búsqueda: por nombre y categoría (simple, sin motor externo).

Imágenes: next/image, tamaños responsables, blur placeholders.

Mensajes (fijos):

Delivery: “Costo adicional, te contactaremos”.

Concreto: “Requiere programación de entrega”.

Emails (plantillas)

Confirmación de pedido (sin pago): datos de orden, items, totales, instrucción de programación si concreto.

Solicitud de programación (a ventas y CC cliente): resumen y botón para abrir chat de WhatsApp.

Pago confirmado: adjuntar factura PDF de SIIGO (cuando esté disponible).

Cotización: adjuntar PDF.

Integraciones

Stripe

Payment Element (tarjeta/PSE). Modo test por defecto.

Webhook: events payment_intent.succeeded, payment_intent.payment_failed.

Para órdenes con concreto: generar link más tarde desde admin (o token /pago/[token]).

SIIGO

Emite factura con datos de orden pagada. Debes mapear el producto a ítem SIIGO (usa una tabla de mapeo). Si faltan claves/id de productos SIIGO, pregunta.

WhatsApp Business API

Enviar mensaje a número de ventas configurado con: nombre cliente, teléfono, resumen pedido y URL interna admin. Si faltan credenciales/ID template, pregunta.

.env.example (completo)
# NextAuth (admin)
NEXTAUTH_URL=
NEXTAUTH_SECRET=
ADMIN_DEFAULT_EMAIL=
ADMIN_DEFAULT_PASSWORD=

# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=COP
STRIPE_COUNTRY=CO

# SIIGO
SIIGO_CLIENT_ID=
SIIGO_CLIENT_SECRET=
SIIGO_USERNAME=
SIIGO_PASSWORD=
SIIGO_ENV=sandbox

# WhatsApp Business API
WABA_PHONE_NUMBER_ID=
WABA_BUSINESS_ACCOUNT_ID=
WABA_ACCESS_TOKEN=
WABA_SALES_NUMBER_E164=  # +57...

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Concrecol <no-reply@concrecol.com>"

# Upstash Redis (rate limit)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

Plan de implementación (7 días)

Día 1 – Setup base

Inicializar Next.js 14 (App Router, TS). Tailwind + shadcn/ui.

Configurar Prisma + PostgreSQL + migraciones (prisma migrate).

NextAuth (ruta admin/login) con seed de AdminUser desde .env.

Árbol de carpetas, ESLint/Prettier, CI básico.

Entrega: repo, deploy Vercel inicial, conexión DB y login admin funcionando.

Día 2 – CRUD productos + panel admin + stock

Páginas admin: listado, crear/editar producto, subir imágenes (con URL).

Validación Zod server/client.

Tabla AuditLog y middleware de logging.

Entrega: CRUD completo y logs visibles.

Día 3 – Catálogo público + carrito + búsqueda + responsive

Listado por categoría, búsqueda, detalle producto, AddToCart (con decimales m³).

Mensajería UI concreta (badges, delivery notice).

Entrega: UX móvil fluida, LCP <3s.

Día 4 – Checkout guest + pagos + emails

Checkout sin registro (datos + entrega + condicional de pago según requires_scheduling).

Stripe Payment Element (tarjeta/PSE) y método Transferencia.

Emails (confirmación, programación).

Entrega: flujo “solo materiales” paga en línea; “concreto” crea orden pendiente + emails.

Día 5 – Dashboard admin + gestión órdenes + órdenes manuales

Vista órdenes, cambios de estado, generación /pago/[token].

Link de pago y page segura para cliente.

Entrega: admin puede crear orden manual y cobrar.

Día 6 – SIIGO + WhatsApp + cotizaciones

Webhook Stripe ⇒ factura SIIGO.

WhatsApp notification a ventas.

PDF cotización desde carrito + email a ventas sin vaciar carrito.

Entrega: fin to end con integraciones en sandbox.

Día 7 – Testing + optimización + deploy

Tests Vitest (unidades) y Playwright E2E (catálogo→carrito→checkout).

Rate limiting en rutas críticas; revisión accesibilidad; optimización imágenes y bundle.

Entrega: deploy final Vercel y checklist de calidad.

Aceptación (criterios obligatorios)

Un cliente compra end-to-end materiales/preparados con Stripe.

Un cliente solicita pedido con concreto y el sistema no cobra; envía emails y permite luego link de pago.

Admin gestiona productos, inventario y órdenes; genera link de pago.

Cotización genera PDF y se envía por email, sin vaciar carrito.

Emisión de factura SIIGO en pago confirmado (sandbox).

Rate limiting y Zod en todas las APIs; logs de admin; responsive 100%.

Copys UI (usar literalmente)

Delivery: “Costo adicional, te contactaremos.”

Concreto (detalle): “Requiere programación de entrega.”

Checkout (concreto en carrito): “Tu pedido requiere programación. Te contactaremos para coordinar la entrega y el pago.”

Transferencia: “Confirmaremos tu pago por transferencia y te enviaremos la factura electrónica.”

Seeds

Crear categorías y productos indicados, con slugs y unidades (M3, BOLSA, GALON…).

Crear admin por .env si no existe.

Crear 2-3 órdenes de ejemplo (una con concreto pendiente, otra pagada de materiales).

Testing E2E mínimo (Playwright)

Agregar Cemento y Pintura, pagar con Stripe test card → paid y factura SIIGO simulada.

Agregar Concreto 21 MPa + Cemento → el checkout no permite pago, crea orden pending + emails.

Admin crea orden manual y genera link pago; flujo /pago/[token] funciona.

Entregables finales

Repo con README (setup, envs, scripts).

.env.example completo.

Scripts: dev, build, start, seed, test, e2e.

Documentación corta de integraciones (Stripe, SIIGO, WABA).

Reporte de bundle size y Lighthouse (mobile).

Preguntas SOLO si faltan (pausar hasta responder)

Credenciales: Stripe (keys + webhook secret), SIIGO (sandbox), WhatsApp Business (token, phone id), SMTP o Resend.

Datos de factura (razón social/identificación emisor SIIGO).

Correo ventas y número WhatsApp de ventas en formato E.164.

Porcentaje IVA real (si no es 19%).

Dominio para Vercel (si aplica).

Si todo lo anterior está claro o las dudas fueron resueltas, comienza de inmediato por el Día 1 y avanza en orden. En cada día, entrega PR funcional con notas de pruebas y listado breve de cambios. No reduzcas alcance excepto si una dependencia crítica no tiene credenciales: en ese caso, deja “mock sandbox” y anota TODO lo que quede pendiente para conectar.