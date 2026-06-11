# GEMA — Tu gemelo metabólico (MVP)

**GEMA** (GEmelo MetAbólico — "tu salud es una gema") es un MVP de app móvil de
prevención del síndrome metabólico, renderizada dentro de un **marco de
teléfono** en la web.

> El corazón del producto es el **gemelo digital**: un avatar animado que cambia
> de expresión, color y postura según el **Índice de Carga Metabólica (ICM)**
> calculado a partir de 5 sub-índices (glucosa, actividad, sueño, estrés,
> nutrición).

## Qué es real y qué es simulado (estado actual del MVP)

| Funcionalidad | Estado |
|---|---|
| Cámara (selfie del gemelo y foto del plato) | **Real** (getUserMedia) |
| Análisis del plato con IA | **Real** — Gemini 2.0 Flash vía `/api/analyze-meal`; fallback local si la API no responde |
| ICM recalculado al registrar comidas | **Real** (lógica local en `lib/icm.ts`) |
| Simulador what-if | **Real** (modelo fisiológico local con fuentes) |
| Modelo predictivo (Random Forest + GBM) | **Real y entrenado** — ver `modelo-predictivo/` |
| Login Google, smartwatch BLE, sensor CGM | Simulados (mock visual) |

## Artefactos del proyecto

- **App** — este repo (Next.js 14).
- **Flujograma del sistema** — [docs/flujograma-gema.svg](docs/flujograma-gema.svg)
  y [docs/flujograma-gema.png](docs/flujograma-gema.png) (regenerable con
  `python3 docs/generar_flujograma.py`).
- **Modelo predictivo** — [modelo-predictivo/](modelo-predictivo/): notebook
  Colab, scripts de entrenamiento, modelos `.joblib` entrenados y
  `DESCRIPCION_MODELO.txt` con inputs/outputs/resultados/referencias.

## Análisis de comida con Gemini

La clave vive en `.env.local` (`GEMINI_API_KEY`). La clave actual es válida
pero su proyecto **agotó los créditos** (error 429): mientras tanto la app usa
la estimación local automáticamente. Para activar el análisis real, genera una
clave con free tier en <https://aistudio.google.com/apikey>, reemplázala en
`.env.local` y reinicia el dev server. Sin cambios de código.

---

## Stack

- **Next.js 14 (App Router)** + **React 18** + **TypeScript**
- **Tailwind CSS** con tema oscuro
- **lucide-react** para iconos
- Animaciones con CSS keyframes (sin librerías pesadas)
- Toda la lógica y los datos viven en `lib/mockData.ts` y `lib/icm.ts`

## Sistema de diseño

- **Tipografía:** Plus Jakarta Sans (Google Fonts), números tabulares en métricas.
- **Superficies (4 niveles):** `page #04060C` → `bg #090D17` → `card #131A2C` → `card2 #1A2336`, con bordes sutiles `white/6-8%` en lugar de líneas duras.
- **Color primario:** azul `#60A5FA`, con gradiente de marca `#3D7BF6 → #7C5CF6` para CTAs, FAB y estados activos.
- **Colores semánticos (riesgo):** verde-teal `#2DD4BF` (bajo) · ámbar `#FBBF24` (moderado) · rosa `#FB7185` (alto). Solo se usan con significado, no como decoración.
- **Colores de datos:** glucosa `#38BDF8` · actividad `#4ADE80` · sueño `#A78BFA` · estrés `#FB7185` · nutrición `#2DD4BF` (definidos en `lib/mockData.ts`).
- **Componentes:** botones pill (`rounded-full`) con gradiente y glow, tarjetas `rounded-[20px]` con sombra suave, TabBar flotante con blur y FAB central, marco de teléfono con dynamic island y glows ambientales.

## Cómo correrlo (local)

```bash
npm install
npm run dev
# http://localhost:3000
```

> Si alternaste antes entre `npm run build` y `npm run dev`, borra `.next/` para
> evitar caché mixto: `rm -rf .next`.

## Deploy en Vercel

La app está pensada para desplegarse en Vercel sin configuración adicional.
Si ves un **404 NOT_FOUND** o un HTML con solo `<div class="container">`, el
problema es de configuración del proyecto en Vercel:

1. **Root Directory.** Settings → General → **Root Directory** debe apuntar a la
   carpeta donde vive `package.json`. Si subiste `gemelo-digital/` como
   subcarpeta de un repo, escribe `gemelo-digital` aquí.
   Si subiste el contenido de `gemelo-digital/` como raíz del repo, déjalo
   vacío.
2. **Framework Preset.** Debe ser **Next.js** (se autodetecta cuando hay
   `next` en `package.json`).
3. **Build Command / Output Directory.** Déjalos vacíos (Vercel usa
   `next build` y `.next` por defecto).
4. **Node version.** El `engines.node` del `package.json` exige Node ≥ 18.18.
   Vercel usa Node 20 por defecto: compatible.

Después de cambiar la Root Directory, dispara un **Redeploy** sin caché.

> No incluimos `vercel.json` a propósito: Vercel autodetecta todo. Añadir uno
> con valores incorrectos es la causa más común de despliegues vacíos.

## Estructura

```
gemelo-digital/
├── app/                # layout, página raíz (router de pantallas)
├── components/
│   ├── PhoneFrame.tsx
│   ├── TabBar.tsx
│   ├── Twin/           # avatar del gemelo (imagen o fallback SVG)
│   ├── charts/         # ScoreRing, Sparkline, BarsWeek, DualLine
│   └── ui/             # Card, Button, Slider, Pill, ProgressBar, etc.
├── screens/            # 14 pantallas (una por archivo)
├── lib/                # mockData, icm, types
└── public/images/      # carpeta lista para que arrastres tus imágenes
```

## Las 14 pantallas

| # | Pantalla | Archivo |
|---|---|---|
| 1 | Splash / Bienvenida | `SplashScreen` |
| 2 | Crear gemelo (cámara mock) | `CreateTwinCameraScreen` |
| 3 | Personalizar gemelo | `CustomizeTwinScreen` |
| 4 | Procesando | `ProcessingScreen` |
| 5 | Home / Dashboard | `HomeScreen` |
| 6 | Mi gemelo + simulador "¿Qué pasaría si…?" ⭐ | `TwinScreen` |
| 7 | Registro diario (Comida · Sueño · Estrés) | `LogInputScreen` |
| 8 | Progreso / historial | `ProgressScreen` |
| 8b | Proyección a 5 años | `Projection5yScreen` |
| 9 | Recomendaciones | `RecommendationsScreen` |
| 10 | Alertas | `AlertsScreen` |
| 11 | Detalle de sub-índice | `SubIndexDetailScreen` |
| 12 | Reporte para el médico | `DoctorReportScreen` |
| 13 | Perfil | `ProfileScreen` |

La **pantalla 6** es la estrella: al mover los sliders, el ICM proyectado se
recalcula con `lib/icm.ts → projectICM()` y el gemelo cambia de color y
expresión con una transición suave.

## El gemelo

`components/Twin/TwinAvatar.tsx` admite dos modos:

1. **Fallback SVG (por defecto):** dibuja un avatar bonito (cara + torso +
   aura pulsante + puntos de telemetría). 3 expresiones: `happy`, `neutral`,
   `tired`. Funciona sin imágenes.
2. **Imágenes reales (opcional):** apenas coloques
   `public/images/twin/{happy,neutral,tired}.png` (fondo transparente,
   ~600×600), edita el componente y pasa `useImage={true}` para que la app use
   tus ilustraciones.

Ver `public/images/README.md` para el listado completo de imágenes que la app
puede usar y cómo deben llamarse.

## Mock determinista

Toda la "IA" se simula con `setTimeout` + valores fijos:

- "Detectar plato" → 1.2 s de loader y devuelve `mockData.detectedMeal`.
- "Calibrar gemelo" en onboarding → 4 pasos con check, ~3.5 s total.
- "Descargar PDF" en reporte → toast de confirmación, no archivo real.

La fórmula del ICM:

```ts
ICM = round(glucosa·0.35 + actividad·0.20 + sueño·0.20 + estrés·0.15 + nutrición·0.10)
// 0–39 verde · 40–69 ámbar · 70–100 rojo
```

## Checklist de la POC

- [x] Next.js 14 + TS + Tailwind levantando con `npm run dev`
- [x] Marco de celular con notch y barra de estado
- [x] 14 pantallas navegables
- [x] TabBar con botón **+** central; oculta en onboarding (1–4)
- [x] Gemelo animado con 3 estados (respiración, flotar, aura, parpadeo)
- [x] Simulador "¿Qué pasaría si…?" recalcula ICM y cambia el gemelo en vivo
- [x] Mock de detección de plato + predicción glucémica
- [x] Proyección a 5 años con 2 escenarios
- [x] Reporte médico con botón "descargar" simulado
- [x] `public/images/` con subcarpetas y README documentado
- [x] Sin red, sin cámara real, sin APIs
- [x] Español peruano, tono cercano

## Notas finales

- Si una imagen falta, **la app no se rompe**: usa fallback SVG o placeholder.
- Los datos clave (ICM 59, pico 162 mg/dL, riesgo 23 %) son consistentes en
  todas las pantallas porque vienen de `lib/mockData.ts`.
