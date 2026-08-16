# AGENTS.md — concrecol.com

Contexto para agentes de código que trabajan en este repositorio.

## Qué es este proyecto

Sitio web y e-commerce de Concretos Premezclados Concrecol. Catálogo de
productos de concreto, cotizaciones, carrito, pedidos, pagos y panel
administrativo.

**Es código en producción.** No es un banco de pruebas. Cualquier cambio debe
ser mínimo, verificado y limitado a lo pedido.

## Stack

- Next.js con App Router, React, TypeScript
- Tailwind CSS y shadcn/ui para la interfaz
- Prisma 5.22 sobre PostgreSQL (Supabase en desarrollo)
- NextAuth para autenticación del área administrativa
- Zod para validación
- Stripe para pagos, más transferencias offline
- SIIGO para facturación
- Nodemailer para correo
- Playwright para pruebas end-to-end

## Estructura

```
app/              Rutas y páginas (App Router). Server Components por defecto.
app/admin/        Panel administrativo, protegido con NextAuth y middleware.ts
app/api/          Route Handlers: auth, órdenes, pagos, webhooks, integraciones
components/       Componentes React reutilizables, formularios, cotizaciones
components/ui/    Componentes visuales de shadcn/ui
components/admin/ Componentes del panel administrativo
lib/              Lógica de negocio: Prisma, auth, correo, validación, rate limiting
lib/siigo/        Integración con SIIGO
contexts/         Estado global de React (carrito, indicadores de carga)
hooks/            Hooks personalizados
types/            Tipos TypeScript compartidos
prisma/           schema.prisma y seed.ts
scripts/          Scripts operativos de administración y despliegue
e2e/              Pruebas end-to-end con Playwright
docs/             Documentación técnica (SIIGO, Supabase, seguridad)
public/           Imágenes, logos, videos, fuentes
```

No modificar: `node_modules/`, `.next/`.

Punto de entrada de la interfaz: `app/layout.tsx` → `app/page.tsx`.

## Comandos

Scripts que existen realmente en `package.json`:

```
npm run dev            Servidor de desarrollo en localhost:3000
npm run build          prisma generate + next build
npm run start          Servidor de producción
npm run lint           ESLint
npm run seed           Carga datos iniciales
npm run admin:create   Crear usuario administrador
npm run admin:list     Listar administradores
```

Playwright no tiene script en `package.json`; se invoca directamente:

```
npx playwright test --list   Lista las pruebas sin ejecutarlas
npx playwright test          Ejecuta la suite
```

**El README menciona `npm run test` y `npm run e2e`. Esos scripts NO existen.**
No los invoques.

## Verificación

Antes de dar por terminada cualquier tarea:

1. `npm run lint` — sin errores nuevos
2. `npm run build` — debe compilar sin errores de TypeScript
3. `npx playwright test` — 4 pruebas E2E del panel administrativo

Las pruebas E2E requieren el servidor corriendo (`npm run dev`) y un archivo
`.env.test`.

**Cobertura real: solo `app/admin/`.** Las 4 pruebas cubren el dashboard, la
gestión de productos y la validación de campos. Un cambio en el catálogo, el
carrito, el checkout, los pagos o la integración con SIIGO **no está cubierto
por ninguna prueba**. Si tu cambio toca esas áreas, dilo explícitamente en la
respuesta para que se verifique a mano en `localhost:3000`.

## Zonas prohibidas

No modificar ni ejecutar sin autorización explícita en la tarea:

- **`.env`, `.env.local`, `.env.test` y cualquier archivo de entorno.**
  Contienen credenciales de base de datos y claves de API. No leerlos, no
  imprimirlos, no copiar su contenido a ningún archivo ni a la respuesta.
- **`prisma/schema.prisma`.** Un cambio aquí altera el modelo de datos. Si una
  tarea parece requerirlo, detente y dilo en vez de editarlo.
- **`npx prisma db push` y `npx prisma migrate`.** Escriben en la base de datos
  real. No ejecutarlos.
- **`scripts/*admin*.js`.** Gestionan cuentas administrativas.
- **`middleware.ts` y la configuración de NextAuth en `lib/`.** Tocan el control
  de acceso al panel.
- **`lib/siigo/`.** Integración de facturación con efectos fiscales.
- **`package.json`.** No añadir ni actualizar dependencias sin declararlo
  explícitamente en la respuesta.

## Convenciones

- TypeScript en todo el código nuevo
- Server Components por defecto; `"use client"` solo cuando haga falta
  interactividad
- El cliente de Prisma se importa desde `lib/`, no se instancia por archivo
- La validación de entradas se hace con Zod, no a mano
- Los componentes visuales salen de `components/ui/` (shadcn/ui); no crear
  equivalentes propios de botones, inputs o diálogos
- Textos de interfaz en español

## Notas del esquema

El modelo usa `String[]`, `Json` y enums de PostgreSQL. El proyecto **no es
compatible con SQLite**. No proponer cambios de motor de base de datos.

## Alcance

Haz lo pedido y nada más. No refactorices código ajeno a la tarea, no
reformatees archivos completos, no actualices dependencias, no hagas commit.
