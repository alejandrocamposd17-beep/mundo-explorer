# Proceso de Vibe Coding — Mundo Explorer

Este documento registra cómo se construyó la aplicación usando **Claude (Anthropic)** como copiloto de desarrollo. La IA generó código, estructura y estilos a partir de prompts; yo definí la arquitectura, revisé cada entrega, validé que cumpliera los requisitos y pedí correcciones cuando algo no estaba bien.

## 1. Concepción del proyecto

**Idea:** una app para explorar países que combine datos estáticos (población, idiomas, monedas) con datos en vivo (clima de la capital), porque obliga a usar Server Components para lo que casi no cambia y Client Components + Route Handler para lo que se consulta en tiempo real.

**Criterios para elegir las APIs:** gratuitas, sin registro, estables y con HTTPS → inicialmente **REST Countries** y **Open-Meteo** (ver desafío 7: se migró al dataset **mledoze/countries**).

## 2. Prompts principales

### Prompt 1 — Arquitectura inicial
> "Actúa como desarrollador senior de Next.js. Quiero una app en Next.js 16 con App Router, TypeScript y Tailwind CSS v4 llamada *Mundo Explorer*. Debe tener mínimo 4 rutas (inicio, listado de países, detalle dinámico por código ISO, favoritos y acerca de), consumir REST Countries desde Server Components y el clima de Open-Meteo a través de un Route Handler propio. Propón la estructura de carpetas (`app/`, `components/`, `lib/`) y explica qué será Server y qué Client Component."

**Resultado:** estructura de carpetas, separación de servicios en `lib/` y decisión de usar `/api/clima` como proxy.

### Prompt 2 — Configuración base
> "Genera `package.json`, `tsconfig.json` (strict), `postcss.config.mjs` para Tailwind v4 y un `globals.css` con un tema de colores `brand` usando `@theme`. Incluye `.gitignore` que excluya `.env*.local`."

### Prompt 3 — Layout y navegación
> "Crea un layout con navbar sticky responsive: en móvil un botón de menú que despliega los enlaces (useState), y resaltado del enlace activo con usePathname. Footer con créditos de las APIs."

### Prompt 4 — Servicio de países
> "Escribe `lib/countries.ts` con funciones tipadas `getAllCountries`, `getCountryByCode` y `getCountryNames` usando fetch con `revalidate` de 24 h. Valida que el código sea de 3 letras antes de llamar a la API. Muestra los nombres en español usando `translations.spa`."

### Prompt 5 — Listado interactivo
> "Crea un Client Component `CountryExplorer` que reciba los países desde el Server Component y permita buscar por nombre o capital (ignorando tildes), filtrar por región, ordenar por población y paginar con un botón 'Cargar más'. Usa useState, useEffect (debounce de la búsqueda) y useMemo."

### Prompt 6 — Route Handler y clima
> "Crea `app/api/clima/route.ts` con un GET que reciba `lat` y `lon`, valide rangos, llame a Open-Meteo y devuelva un JSON normalizado (temperatura, humedad, viento, código de clima). Maneja errores sin exponer detalles internos. Luego un `WeatherWidget` cliente que consuma ese endpoint con useEffect, con estados loading / error / success y botón de reintentar."

### Prompt 7 — Detalle y favoritos
> "Página dinámica `app/paises/[code]/page.tsx` para Next.js 16 (recuerda que `params` ahora es una Promise). Muestra bandera, datos clave, fronteras como enlaces y el widget de clima. Agrega un botón de favoritos que guarde en localStorage y una página `/favoritos` que se sincronice entre pestañas."

### Prompt 8 — Loading y errores
> "Agrega `loading.tsx` con skeletons para `/paises` y `/paises/[code]`, `error.tsx` con botón 'Intentar de nuevo' (reset) y `not-found.tsx` personalizado."

### Prompt 9 — Revisión de seguridad
> "Revisa todo el código buscando vulnerabilidades: validación de entradas, inyección en URLs, datos no confiables de localStorage, enlaces externos, fuga de errores y cabeceras HTTP. Corrige lo que encuentres."

### Prompt 10 — Migración de la API de países
> "El build en Vercel falla con `.map is not a function`. REST Countries v3.1 ahora responde `{ success: false }` porque fue deprecada y la v5 pide API key. Migra `lib/countries.ts` al dataset público `mledoze/countries` (JSON en GitHub), normaliza los datos a un tipo `Country`, valida que la respuesta sea un arreglo, usa flagcdn.com para las banderas y adapta las páginas (el dataset no incluye población)."

### Prompt 11 — Segunda ronda de mejoras
> "Revisa el proyecto y propón mejoras para la nota, la experiencia de usuario y la calidad técnica. Luego impleméntalas todas: capturas en el README, corregir el fondo gris bajo la bandera, traducir subregiones/idiomas/monedas al español, pronóstico de 7 días, clima de la capital (no del centro del país), comparador de países, mapa interactivo con Leaflet, modo claro/oscuro, pruebas con Vitest, ESLint + CI en GitHub Actions, Content-Security-Policy y medir con Lighthouse."

### Prompt 12 — Documentación
> "Genera un README con instrucciones de instalación, variables de entorno, estructura y enlace al despliegue, y un `.env.example` documentado."

## 3. Iteraciones realizadas

Cada iteración corresponde a uno o más commits del historial.

| # | Iteración | Qué se pidió / ajustó |
|---|-----------|-----------------------|
| 1 | Setup | Config de Next 16 + TS estricto + Tailwind v4 (`@import "tailwindcss"` y `@theme`, sin `tailwind.config.js`). |
| 2 | Layout | Navbar responsive: el menú móvil se cierra al navegar y expone `aria-expanded` / `aria-controls`. |
| 3 | Listado | Búsqueda con *debounce* de 250 ms, normalización de tildes ("Peru" encuentra "Perú") y paginación de 24 en 24. |
| 4 | Payload | El Server Component envía al cliente solo los 7 campos que usa cada tarjeta, no el objeto completo de la API. |
| 5 | Detalle | Ruta dinámica con `const { code } = await params` (en Next 16 `params` es una Promise), también en `generateMetadata`. |
| 6 | Clima | `AbortController` en el `useEffect` para cancelar la petición si el usuario sale de la página, y botón de reintento. |
| 7 | Favoritos | Evento personalizado + evento `storage` para sincronizar la lista entre componentes y pestañas. |
| 8 | Seguridad | Segunda pasada: cabeceras HTTP, enlaces externos solo `https://` con `noopener`, validación de datos de `localStorage`, `server-only`. |
| 9 | Migración de datos | El deploy falló porque REST Countries v3.1 fue dado de baja; se migró a mledoze/countries con un modelo normalizado y validación de la respuesta. |

### Segunda ronda de mejoras

| # | Iteración | Qué se pidió / ajustó |
|---|-----------|-----------------------|
| 10 | Traducciones | `Intl.DisplayNames` traduce idiomas (ISO 639-3) y monedas (ISO 4217) al español, con respaldo al nombre original; las subregiones usan un diccionario. |
| 11 | Clima de la capital | Nuevo servicio `lib/geocoding.ts` (Open-Meteo Geocoding) que busca la capital filtrando por el código del país; si falla, se usa el centro del país. |
| 12 | Pronóstico | `/api/clima` ahora también devuelve 7 días (máx/mín y probabilidad de lluvia); el widget los muestra en una cuadrícula responsive. |
| 13 | Mapa | Componente `CountryMap` con Leaflet importado dinámicamente dentro de `useEffect` (Leaflet usa `window`), en el detalle y en la nueva ruta `/mapa`. |
| 14 | Comparador | Ruta `/comparar` con estado en la URL (`?a=slv&b=gtm`) para poder compartir comparaciones; `searchParams` es una Promise en Next 16. |
| 15 | Tema | Modo claro/oscuro: en Tailwind v4 los colores son variables CSS, así que el modo claro invierte esas variables en lugar de duplicar clases. Un script inline aplica el tema antes de pintar para evitar parpadeo. |
| 16 | Testeabilidad | Se extrajo la lógica pura a `normalize.ts`, `filter.ts` y `validation.ts` para probarla con Vitest sin depender de `server-only`. |
| 17 | Calidad | ESLint (flat config de Next 16), `tsc --noEmit` y GitHub Actions (lint → tipos → tests → build). |
| 18 | Seguridad | Content-Security-Policy, validación del `cca2` antes de armar la URL de la bandera y tooltips del mapa como texto plano. |

## 4. Decisiones técnicas

- **Server Components para datos de países:** se obtienen y cachean en el servidor (ISR de 24 h), lo que mejora el SEO y reduce JavaScript en el cliente.
- **Route Handler como proxy del clima:** oculta la URL del proveedor (configurable por `.env`), valida la entrada, normaliza la respuesta y permite cachear en el edge (`s-maxage=600`).
- **Client Components solo donde hay interacción:** navbar, filtros, clima en vivo y favoritos.
- **`<img>` en lugar de `next/image` para banderas:** son SVG/PNG pequeños de un CDN externo; se evita configurar `remotePatterns` y optimizaciones innecesarias.
- **`localStorage` para favoritos:** no requiere backend ni autenticación para el alcance del proyecto.
- **Modo claro con variables de Tailwind v4:** se redefinen `--color-white` y la escala `slate` bajo `[data-theme="light"]`; las secciones que deben verse siempre oscuras (hero y clima) usan la clase `.force-dark`.
- **Leaflet sin `react-leaflet`:** menos dependencias; el mapa se crea y destruye manualmente en `useEffect` y usa `circleMarker` para no depender de imágenes de íconos.
- **CSP sin nonces:** usar nonces obligaría a renderizar todas las páginas dinámicamente; se eligió una política con `'unsafe-inline'` solo para scripts propios de Next, restringiendo todos los demás orígenes.
- **Sin claves secretas:** las APIs son públicas, pero las URLs se manejan como variables de entorno para poder cambiarlas sin tocar código.

## 5. Desafíos y cómo se resolvieron con la IA

1. **Cambios de Next.js 16 (`params` asíncrono).** Se especificó en el prompt la versión exacta del framework y se verificó que el código generado usara `await params`, ya que muchos ejemplos en internet siguen la API de Next 13/14.
2. **Tailwind v4.** La configuración clásica (`tailwind.config.js`) ya no aplica; se pidió usar `@tailwindcss/postcss` y definir colores con `@theme` en CSS.
3. **Hidratación con `localStorage`.** Leer `localStorage` durante el render provoca diferencias entre servidor y cliente. Se leyó dentro de `useEffect` y se muestra un skeleton mientras tanto.
4. **Nombres en español.** La API devuelve nombres en inglés por defecto; se usó `translations.spa.common` con *fallback* al inglés.
5. **Resiliencia ante caídas de las APIs.** `error.tsx` por segmento, mensajes amigables, timeout de 8 s y botón de reintento en el widget del clima.
6. **Enlaces externos no confiables.** En la revisión de seguridad se detectó que la URL de Google Maps venía directamente de la API; primero se validó que fuera `https://` y, tras la migración de datos, se construye en el servidor a partir de coordenadas numéricas codificadas.
7. **REST Countries v3.1 dejó de funcionar.** El primer deploy en Vercel falló al prerenderizar `/` con `TypeError: ... .map is not a function`. Al revisar la respuesta, la API devolvía `{"success": false, "errors": [...]}`: las versiones v1–v4 fueron dadas de baja y la v5 exige cuenta y API key. Con ayuda de la IA se migró a **mledoze/countries**, el dataset JSON que alimentaba a REST Countries: se creó un modelo `Country` normalizado (`normalizeCountry`), se validó que la respuesta sea un arreglo antes de procesarla, las banderas pasaron a `flagcdn.com` y, como el dataset no trae población, el orden y las estadísticas se basan en el área.
8. **Validación del build.** El build de producción y el chequeo de tipos de TypeScript se validaron en Vercel en cada push a `main`.

9. **Leaflet en Next.js.** Importarlo de forma normal rompe el prerenderizado porque accede a `window`. Se resolvió con `import("leaflet")` dentro de `useEffect` y un manejo de interoperabilidad ESM/CommonJS.
10. **Modo claro sin reescribir todo.** El diseño se hizo pensando en fondo oscuro; en lugar de reescribir cada clase, se aprovechó que Tailwind v4 expone los colores como variables CSS.
11. **Resultado medido.** Lighthouse en producción: 100 rendimiento, 96 accesibilidad, 100 buenas prácticas y 100 SEO.

## 6. Aprendizajes

- La IA acelera mucho la generación de estructura y UI, pero **hay que validar** contra la versión actual del framework: varias sugerencias venían de versiones anteriores.
- Prompts específicos (versión, restricciones, qué es Server/Client) producen código mucho más cercano a lo que se necesita.
- La revisión humana es indispensable en seguridad, rendimiento (tamaño del payload) y accesibilidad.
