# Carpeta de imágenes — Gemelo Digital Metabólico

Esta carpeta es donde colocas las imágenes reales que la app usará. **La app no se rompe si una imagen falta**: cae automáticamente a un avatar SVG / placeholder elegante.

> Estructura de carpetas:

```
public/images/
├── twin/        ← personaje principal (3 estados + variantes opcionales)
├── meals/       ← fotos de platos para el mock de "detectar comida"
└── avatars/     ← foto/silueta para la pantalla de cámara mock
```

---

## 1) `twin/` — El gemelo digital

El componente `TwinAvatar` admite dos modos:

- **Fallback SVG (por defecto):** la app dibuja un avatar bonito con expresiones y aura sin necesidad de imágenes. Es lo que verás al levantar la app.
- **Imágenes reales (opcional):** apenas coloques estos archivos, edita `components/Twin/TwinAvatar.tsx` y pasa la prop `useImage` en `true` para que la app empiece a usar tus ilustraciones.

Archivos esperados:

| Archivo            | Cuándo se muestra              | Descripción visual sugerida                                  |
|--------------------|--------------------------------|--------------------------------------------------------------|
| `twin/happy.png`   | ICM < 40 (estado **Saludable**) | Personaje sonriente, ojos brillantes, postura erguida.       |
| `twin/neutral.png` | ICM 40–69 (estado **Regular**)  | Cara neutral, hombros levemente caídos.                      |
| `twin/tired.png`   | ICM ≥ 70 (estado **En riesgo**) | Cara cansada, ojeras suaves, postura encorvada.              |

**Especificaciones recomendadas:**
- Formato: PNG con fondo **transparente**.
- Tamaño: 600×600 px (cuadrado), centrado.
- Encuadre: medio cuerpo (cabeza + torso/hombros).
- Estilo: ilustración tipo Memoji / cartoon. Que las 3 versiones se vean claramente "la misma persona" cambiando solo el estado.

**Variantes opcionales** (si quieres que la pantalla de personalización use ilustraciones en vez de cambiar solo el SVG): puedes añadir variantes por tono de piel/peinado con el mismo prefijo, por ejemplo `twin/happy_skin0_largo.png`. No es obligatorio para la POC.

---

## 2) `meals/` — Mock de "detectar comida"

La pantalla **Registrar día → Comida** simula que la IA detecta el plato. Coloca aquí una imagen de plato peruano (idealmente arroz con pollo + ensalada).

| Archivo           | Cuándo se muestra            | Descripción visual sugerida                                 |
|-------------------|------------------------------|-------------------------------------------------------------|
| `meals/plate.jpg` | Tras "Capturar foto" en Log  | Foto cenital de un plato. Si no existe, se muestra un emoji 🍛 sobre fondo dorado. |

**Especificaciones recomendadas:**
- Formato: JPG (también acepta PNG).
- Tamaño: 800×800 px, cuadrado.

---

## 3) `avatars/` — Foto para el mock de cámara

La pantalla **Crear gemelo → Captura** simula la cámara. No abre la cámara real; muestra esta imagen como vista previa.

| Archivo               | Cuándo se muestra                                | Descripción visual sugerida                                |
|-----------------------|--------------------------------------------------|------------------------------------------------------------|
| `avatars/preview.jpg` | Tras tocar "Encender cámara" en Crear gemelo     | Selfie frontal placeholder, o silueta sobre fondo oscuro.  |

**Especificaciones recomendadas:**
- Formato: JPG/PNG.
- Tamaño: 800×800 px, encuadre vertical centrado (rostro arriba).
- Si no existe, la app muestra una silueta degradada bajo la guía facial punteada.

---

## Buenas prácticas

- **Pesos:** mantén cada imagen por debajo de ~200 KB para que la app se sienta ágil.
- **Permisos:** usa imágenes propias o con licencia libre.
- **Sin nombres con espacios:** usa kebab-case si necesitas variantes (ej. `happy-female.png`).

Si quieres añadir una imagen para una pantalla nueva, agrégala en la subcarpeta que tenga más sentido y documéntala aquí.
