<div align="center">

# 🚜 AgroRent · TractorLink

### Marketplace B2B de alquiler de maquinaria agrícola

*Conectando fundos y agroexportadoras con proveedores verificados de tractores e implementos en La Libertad, Perú.*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4-000000)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

**Autor:** Junior Vergara López

</div>

---

## 📑 Tabla de contenidos

1. [Descripción general](#-descripción-general)
2. [Características](#-características)
3. [Stack tecnológico](#-stack-tecnológico)
4. [Estructura del proyecto](#-estructura-del-proyecto)
5. [Requisitos previos](#-requisitos-previos)
6. [Instalación paso a paso](#-instalación-paso-a-paso)
7. [Scripts disponibles](#-scripts-disponibles)
8. [Variables de entorno](#-variables-de-entorno)
9. [Conexión a base de datos](#-conexión-a-base-de-datos)
10. [Migrar de estado simulado a backend real](#-migrar-de-estado-simulado-a-backend-real)
11. [Despliegue en producción](#-despliegue-en-producción)
12. [Arquitectura y flujo de estado](#-arquitectura-y-flujo-de-estado)
13. [Roadmap](#-roadmap)
14. [Solución de problemas](#-solución-de-problemas)
15. [Licencia y autor](#-licencia-y-autor)

---

## 🌱 Descripción general

**AgroRent · TractorLink** es una plataforma web B2B que centraliza la relación entre dos roles:

| Rol | Marca comercial | Qué hace |
|-----|-----------------|----------|
| **Cliente** | AgroRent | Registra sus campos (fundos), busca maquinaria con filtros avanzados y simula costos de alquiler por día/hectárea. |
| **Proveedor** | TractorLink | Publica y gestiona su flota, monitorea telemetría simulada y recibe alertas de mantenimiento preventivo. |

En esta entrega, **toda la lógica de datos está simulada en el frontend** (estado global + `localStorage`), lo que permite ejecutar la aplicación sin backend. Este README documenta también **cómo conectarla a una base de datos real** cuando quieras llevarla a producción.

---

## ✨ Características

- **Landing de alto impacto:** hero con *mesh gradient* animado, doble CTA, flota flotante y *trust badges* (empresa verificada · RUC validado).
- **Autenticación simulada:** `RequireAuth` con rutas `/cliente` y `/proveedor` **mutuamente excluyentes**, sesión persistida en `localStorage`.
- **Dashboard Proveedor:** CRUD de catálogo con previsualización en vivo, semáforo de estado (🟢 operativo · 🟡 mantenimiento · 🟤 fuera de servicio), panel de **telemetría** (horómetro, combustible, temperatura, mantenimiento) y botón **"Subir Brochure"** que simula análisis por IA para autocompletar especificaciones.
- **Dashboard Cliente:** CRUD visual de "Mis Campos", buscador inteligente con filtros y **simulador de costos dinámico** que interactúa con los campos guardados.
- **Motor de reservas con contrato digital:** el cliente simula el costo, acepta las cláusulas del contrato (checkboxes obligatorios) y envía la solicitud; el proveedor la confirma, inicia el trabajo y la cierra desde la pestaña "Reservas".
- **Estados de reserva:** `borrador → confirmada → en_curso → finalizada` (o `cancelada`), visibles en tiempo real para ambos roles en "Mis reservas" / "Reservas".
- **Notificaciones in-app:** campana con contador de no leídas; se disparan automáticamente en cada cambio de estado de reserva.
- **Chat B2B flotante:** una conversación por reserva entre cliente y proveedor, con botón "Generar resumen del acuerdo con IA" que inyecta un resumen automático del trato en el hilo.
- **Panel de métricas históricas (Proveedor):** ingresos mensuales, utilización de flota y trabajos completados de los últimos 6 meses.
- **Estado reactivo (pub/sub):** un cambio en la flota, campos, reservas, chat o notificaciones se refleja en tiempo real en toda la UI.
- **Diseño Modern B2B SaaS:** glassmorphism, tipografía dual (Montserrat + Inter), micro-interacciones y animaciones en cascada.

---

## 🧰 Stack tecnológico

| Capa | Tecnología | Uso |
|------|------------|-----|
| **Framework UI** | React 18 + TypeScript | Componentes tipados y modulares |
| **Build tool** | Vite 5 | Servidor de desarrollo y bundle de producción |
| **Estilos** | Tailwind CSS 3 | Design system utilitario + config personalizada |
| **Estado global** | Zustand 4 | Store con middleware `persist` (localStorage) |
| **Enrutamiento** | React Router 6 | Rutas protegidas por rol |
| **Iconografía** | lucide-react | Iconos SVG ligeros |
| **Base de datos** | Supabase (PostgreSQL) | Cliente listo en `core/supabase`, esquema versionado en `supabase/migrations` |

---

## 📂 Estructura del proyecto

El proyecto sigue **Screaming Architecture**: la carpeta `src/modules/` revela los dominios de negocio (maquinaria, alquileres, usuarios, proveedores, campos…) en vez de agruparse por tipo técnico (`components/`, `pages/`, `hooks/`). La infraestructura transversal (Supabase, UI kit, utilidades genéricas) vive aislada en `core/`.

```
agrorent/
├── index.html                  # Punto de entrada HTML (fuentes Google + root)
├── package.json                # Dependencias y scripts
├── vite.config.ts              # Configuración de Vite (+ alias @app/@core/@modules/@store)
├── tailwind.config.js          # Design system (colores, animaciones, fuentes)
├── postcss.config.js           # Pipeline de PostCSS + Autoprefixer
├── tsconfig.json               # Configuración estricta de TypeScript (+ path aliases)
├── .env.example                # Plantilla de variables de entorno
│
├── supabase/                   # Infraestructura de base de datos (Supabase CLI)
│   ├── config.toml
│   └── migrations/              # Esquema SQL versionado (no detallado en este README)
│
├── public/
│   └── favicon.svg
│
└── src/
    ├── app/                     # Composition root: bootstrap, rutas, estilos globales
    │   ├── main.tsx             # Bootstrap de React + BrowserRouter
    │   ├── App.tsx              # Rutas + componente RequireAuth (roles)
    │   ├── index.css            # Estilos base, mesh gradients, glassmorphism
    │   └── vite-env.d.ts
    │
    ├── core/                    # Infraestructura transversal (no conoce el dominio)
    │   ├── supabase/client.ts   # Cliente único de conexión a Supabase
    │   ├── ui/index.tsx         # Primitivas: Button, Card, Badge, Gauge, Modal…
    │   ├── utils/format.ts      # Formato (soles), cx, uid
    │   └── constants/districts.ts
    │
    ├── modules/                 # Dominios de negocio (Screaming Architecture)
    │   ├── machinery/           # Maquinaria / flota — types, status, data, MachineCard, TelemetryPanel
    │   ├── rentals/             # Alquileres — reservas, contrato digital, chat B2B
    │   ├── providers/           # Proveedores (ficha comercial TractorLink)
    │   ├── users/               # Usuarios / clientes — auth, Login
    │   ├── fields/               # Campos del cliente (fundos)
    │   ├── notifications/       # Notificaciones in-app
    │   ├── metrics/             # Métricas históricas de proveedor
    │   ├── landing/             # Landing page pública
    │   └── dashboard/           # Paneles por rol (composición de los módulos anteriores)
    │       ├── layout/DashboardShell.tsx
    │       ├── client/ClientDashboard.tsx
    │       └── provider/ProviderDashboard.tsx
    │
    └── store/
        └── useStore.ts          # Estado global Zustand — compone los módulos de arriba
```

---

## ✅ Requisitos previos

Antes de empezar necesitas tener instalado:

- **Node.js** ≥ 18 (recomendado 20 LTS) → [nodejs.org](https://nodejs.org)
- **npm** ≥ 9 (viene con Node) o **pnpm**/**yarn** si prefieres
- **Git** → [git-scm.com](https://git-scm.com)

Verifica las versiones:

```bash
node -v    # v20.x.x
npm -v     # 10.x.x
```

---

## 🚀 Instalación paso a paso

```bash
# 1. Clona el repositorio (o descomprime el .zip)
git clone https://github.com/tu-usuario/agrorent.git
cd agrorent

# 2. Instala las dependencias
npm install

# 3. (Opcional) copia la plantilla de variables de entorno
cp .env.example .env

# 4. Levanta el servidor de desarrollo
npm run dev
```

Vite imprimirá una URL local, normalmente:

```
  ➜  Local:   http://localhost:5173/
```

Ábrela en el navegador. 🎉

### Credenciales de demostración

La autenticación es **simulada** (sin backend real): basta con seleccionar el rol en la pantalla de login para entrar con una cuenta demo. La sesión se guarda en `localStorage`.

Las credenciales completas de las cuentas de prueba **no se incluyen en este repositorio** por seguridad. Si necesitas la lista completa, consúltala en tu copia local del proyecto o pide acceso al autor.

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con *hot reload* |
| `npm run build` | Compila TypeScript y genera el bundle de producción en `dist/` |
| `npm run preview` | Sirve localmente el bundle de `dist/` para probar el build |

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz. Vite **solo** expone al cliente las variables con prefijo `VITE_`.

```env
# .env.example

# URL base de tu API backend (cuando migres del estado simulado)
VITE_API_URL=http://localhost:4000/api

# --- Opción Supabase ---
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

> ⚠️ **Nunca** pongas claves secretas (service_role, contraseñas de BD) en variables `VITE_`: acaban en el bundle público. Esas van solo en el backend.

---

## 🗄️ Conexión a base de datos

El proyecto arranca con datos **en memoria + localStorage** (modo demo, sin backend). Para producción hay dos caminos recomendados:

- **Supabase (PostgreSQL gestionado):** el cliente transversal ya está listo en `src/core/supabase/client.ts` y lee las credenciales desde `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). El esquema de tablas vive versionado en `supabase/migrations/` (no se detalla aquí por seguridad). Ningún módulo de dominio importa `@supabase/supabase-js` directamente: todos pasan por ese cliente único.
- **API propia (Node/Express + Prisma + PostgreSQL):** si prefieres un backend a medida, define tus propios modelos y expón endpoints REST equivalentes a las acciones de `useStore.ts` (`machines`, `fields`, `reservations`, etc.).

> ⚠️ Ni las credenciales de conexión ni el esquema completo de la base de datos se publican en este README. Si necesitas esa información, pídesela al autor del proyecto de forma privada.

---

## 🔄 Migrar de estado simulado a backend real

Todo el acceso a datos está **centralizado en `src/store/useStore.ts`**, así que la migración se hace en un solo lugar. Convierte las acciones síncronas en asíncronas:

```ts
// Antes (mock en memoria)
addMachine: (m) => set((s) => ({ machines: [m, ...s.machines] })),

// Después (API real)
addMachine: async (m) => {
  const { data } = await supabase.from("machines").insert(m).select().single();
  set((s) => ({ machines: [data, ...s.machines] }));
},
```

Pasos concretos:

1. Completa `.env` con tus credenciales (el cliente en `src/core/supabase/client.ts` ya está listo) o crea `src/core/api/client.ts` si usas la Opción B.
2. En `useStore.ts`, reemplaza los datos *seed* (`seedMachines`, `seedFields`) por una acción `fetchAll()` que cargue desde la BD al iniciar sesión, usando el `supabase` de `core/supabase/client.ts`.
3. Convierte `addMachine`, `updateMachine`, `removeMachine`, `addField`, etc. (definidas en `useStore.ts`, pero conceptualmente pertenecientes a `modules/machinery` y `modules/fields`) para que primero llamen a la API y luego actualicen el estado local.
4. Quita el middleware `persist` (o déjalo solo para preferencias de UI, no para datos de negocio).
5. Sustituye el login simulado por Supabase Auth / JWT de tu API.

> El modelo de dominio, repartido en `src/modules/*/types.ts` (uno por dominio: `machinery`, `fields`, `users`, `providers`, `rentals`, `notifications`, `metrics`), ya coincide con el esquema SQL de `supabase/migrations/`, por lo que el tipado se mantiene de punta a punta.

---

## 🌐 Despliegue en producción

El frontend es un sitio estático (SPA), fácil de desplegar.

### Vercel (recomendado)

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. Vercel detecta Vite automáticamente:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Añade tus variables `VITE_*` en **Settings → Environment Variables**.
5. **Deploy**. Cada `git push` redepliega solo.

### Netlify

- **Build command:** `npm run build` · **Publish directory:** `dist`
- Para que el enrutado SPA funcione, crea `public/_redirects` con:

  ```
  /*    /index.html   200
  ```

### Build manual / hosting propio (Nginx, S3, etc.)

```bash
npm run build      # genera dist/
```

Sube el contenido de `dist/` a tu hosting. En Nginx, redirige todas las rutas a `index.html`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Docker (opcional)

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
docker build -t agrorent .
docker run -p 8080:80 agrorent
```

---

## 🏗️ Arquitectura y flujo de estado

```
┌──────────────┐     acciones      ┌───────────────────┐
│   Componentes│ ────────────────▶ │  useStore (Zustand)│
│ (modules/*)  │ ◀──────────────── │  + persist(localStg)│
└──────────────┘   suscripción      └─────────┬─────────┘
       ▲             (pub/sub)                 │
       │                                       │ (futuro)
       │                                       ▼
       │                              ┌──────────────────┐
       └────────  RequireAuth  ◀───── │  Supabase / API   │
                  (roles)             │   PostgreSQL      │
                                      └──────────────────┘
```

- **Fuente única de verdad:** `useStore`. Ningún componente inventa datos.
- **Reactividad:** los componentes se suscriben con selectores; al cambiar el estado, se re-renderizan automáticamente (patrón *pub/sub*).
- **Protección por rol:** `RequireAuth` en `src/app/App.tsx` bloquea rutas y evita que un proveedor entre al panel de cliente y viceversa.
- **Screaming Architecture:** cada carpeta bajo `src/modules/` es un dominio de negocio autocontenido (tipos, datos semilla, componentes); `src/core/` aloja lo transversal (Supabase, UI kit, formato) sin conocer las reglas de negocio.

---

## 🗺️ Roadmap

- [x] Motor de reservas con **contrato digital** (checkboxes obligatorios).
- [x] Notificaciones y estados de reserva (`borrador → confirmada → en_curso → finalizada` / `cancelada`).
- [x] **Chat B2B** flotante con "IA Asistente" que inyecta un resumen del acuerdo.
- [x] Panel de métricas históricas por proveedor (ingresos, utilización, trabajos por mes).
- [x] Reorganización en **Screaming Architecture** por dominios de negocio (`src/modules/*`).
- [x] Carpeta `supabase/` con configuración y migración inicial versionadas.
- [ ] Backend real conectado (Supabase o API propia) — ver secciones anteriores.
- [ ] Notificaciones push / email cuando cambia el estado de una reserva.
- [ ] Firma electrónica real del contrato (integración con proveedor externo).

---

## 🛠️ Solución de problemas

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| `command not found: vite` | Dependencias no instaladas | Ejecuta `npm install` |
| Pantalla en blanco al recargar en `/cliente` | Falta redirección SPA en el hosting | Añade el `_redirects` (Netlify) o `try_files` (Nginx) |
| Los datos no se actualizan tras cerrar el navegador | Estado en `localStorage` | Es lo esperado en modo demo; se limpia al cerrar sesión |
| Las variables `VITE_` salen como `undefined` | No tienen el prefijo `VITE_` o falta reiniciar Vite | Renómbralas y reinicia `npm run dev` |
| Error de tipos al compilar | Modo estricto de TS | Revisa que los imports y props coincidan con los tipos de `src/modules/*/types.ts` |

---

## 📄 Licencia y autor

Distribuido bajo licencia **MIT**. Uso libre para fines educativos y comerciales.

<div align="center">

**Desarrollado por Junior Vergara López**

*AgroRent · TractorLink — Prototipo B2B para el agro peruano*
Moche · Virú · Laredo · Salaverry

</div>
