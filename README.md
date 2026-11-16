# 🌎 Mundo Explorer

Aplicación web construida con **Next.js 16 (App Router)**, **TypeScript** y **Tailwind CSS v4** para explorar los países del mundo, consultar sus datos clave y ver su **clima actual** en tiempo real. Desarrollada con la metodología **Vibe Coding** (IA como copiloto de desarrollo).

- **Demo en producción:** https://mundo-explorer.vercel.app
- **Autor:** Alejandro Campos — Kodigo Academy (FSJ35)
- **Proceso de Vibe Coding:** ver [`VIBE_CODING.md`](./VIBE_CODING.md)

## ✨ Funcionalidades

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Server Component | Inicio con estadísticas globales y destinos destacados |
| `/paises` | Server + Client | Listado de 250 países con búsqueda (con *debounce*), filtro por región, orden por área y paginación |
| `/paises/[code]` | Server + Client | Detalle dinámico del país, fronteras, favoritos y widget de clima |
| `/favoritos` | Client Component | Favoritos guardados en `localStorage`, sincronizados entre pestañas |
| `/acerca` | Server Component | Información del proyecto y stack |
| `/api/clima` | Route Handler | Proxy validado hacia Open-Meteo, con caché de 10 min |

**Requisitos cubiertos**

- ✅ 5 páginas + 1 Route Handler con App Router
- ✅ Consumo de APIs externas: dataset de países mledoze/countries (desde Server Components) y Open-Meteo (vía Route Handler `/api/clima`)
- ✅ Server Components y Client Components combinados
- ✅ Hooks `useState`, `useEffect` y `useMemo`
- ✅ Diseño responsive (mobile-first, menú hamburguesa)
- ✅ `loading.tsx` (skeletons) y `error.tsx` (con botón de reintento) + `not-found.tsx`
- ✅ Variables de entorno con `.env.local` / `.env.example`

## 🧱 Estructura

```
app/
├── api/clima/route.ts      # Route Handler (GET /api/clima?lat=&lon=)
├── paises/
│   ├── [code]/page.tsx     # Detalle dinámico + loading.tsx
│   ├── page.tsx            # Listado
│   ├── loading.tsx
│   └── error.tsx
├── favoritos/page.tsx
├── acerca/page.tsx
├── layout.tsx · page.tsx · loading.tsx · error.tsx · not-found.tsx
components/                 # Navbar, CountryCard, CountryExplorer, WeatherWidget, FavoriteButton
lib/                        # Servicios de datos (countries.ts, weather.ts, favorites.ts)
```

## 🚀 Instalación y uso local

Requisitos: **Node.js 20.9+** y npm.

```bash
git clone https://github.com/alejandrocamposd17-beep/mundo-explorer.git
cd mundo-explorer
npm install
cp .env.example .env.local   # ajusta los valores si lo necesitas
npm run dev                  # http://localhost:3000
```

Build de producción:

```bash
npm run build
npm start
```

## 🔐 Variables de entorno

| Variable | Ámbito | Descripción |
|----------|--------|-------------|
| `NEXT_PUBLIC_APP_NAME` | Cliente/Servidor | Nombre visible de la aplicación |
| `COUNTRIES_API_URL` | Solo servidor | URL del dataset JSON de países (mledoze/countries) |
| `WEATHER_API_URL` | Solo servidor | Endpoint de Open-Meteo (`https://api.open-meteo.com/v1/forecast`) |

`.env.local` está en `.gitignore`, nunca se sube al repositorio.

## 🛡️ Seguridad

- Validación estricta de parámetros en `/api/clima` (rangos de lat/lon) y del código de país (`^[A-Za-z]{3}$`) antes de llamar a la API.
- URLs construidas con `URL`/`searchParams` (sin concatenar entrada del usuario).
- Los errores internos no se exponen al cliente; timeout de 8 s en llamadas externas.
- Datos de `localStorage` validados al leerse (no se confía en el navegador).
- Cabeceras HTTP de seguridad (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, HSTS, `Permissions-Policy`) y sin cabecera `X-Powered-By`.
- Enlaces externos construidos en el servidor, solo `https://` y con `rel="noopener noreferrer"`.
- La respuesta del dataset de países se valida (debe ser un arreglo) antes de procesarse.
- `server-only` evita que el código de servicios del servidor llegue al bundle del cliente.

## ☁️ Despliegue

Desplegado en **Vercel** con integración continua desde la rama `main` de GitHub. Para desplegar tu propia copia: importa el repositorio en Vercel, agrega las variables de `.env.example` en *Settings → Environment Variables* y despliega.

## 📄 Créditos de datos

- [mledoze/countries](https://github.com/mledoze/countries) — datos de países (fuente original de REST Countries)
- [Flagpedia / flagcdn](https://flagcdn.com) — banderas
- [Open-Meteo](https://open-meteo.com) — datos meteorológicos
