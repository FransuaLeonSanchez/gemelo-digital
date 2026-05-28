# Gemelo Digital Metabólico — POC

Prototipo frontend de una app móvil de prevención del síndrome metabólico. La
app está renderizada dentro de un **marco de teléfono** centrado en la web y
todo está **100 % mockeado**: sin backend, sin cámara real, sin IA real, sin
llamadas de red.

> El corazón del producto es el **gemelo digital**: un avatar animado que cambia
> de expresión, color y postura según el **Índice de Carga Metabólica (ICM)**
> calculado a partir de 5 sub-índices (glucosa, actividad, sueño, estrés,
> nutrición).

---

## Stack

- **Next.js 14 (App Router)** + **React 18** + **TypeScript**
- **Tailwind CSS** con tema oscuro
- **lucide-react** para iconos
- Animaciones con CSS keyframes (sin librerías pesadas)
- Toda la lógica y los datos viven en `lib/mockData.ts` y `lib/icm.ts`

## Cómo correrlo

```bash
npm install
npm run dev
# http://localhost:3000
```

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
