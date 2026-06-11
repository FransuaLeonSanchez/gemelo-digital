#!/usr/bin/env python3
"""Genera docs/flujograma-gema.svg — flujograma optimizado de la app GEMA.

Refleja EXACTAMENTE lo que hace el código (app/page.tsx, lib/icm.ts,
app/api/analyze-meal/route.ts, screens/*, modelo-predictivo/):

  - 4 fases: onboarding (una vez) → loop diario (el corazón) →
    simulación y proyección → reporte médico.
  - Swimlanes: Usuario / App GEMA / Motor IA & Servicios.
  - Borde punteado = funcionalidad simulada (mock) · sólido = real.
  - Solo decisiones reales del código: cómo crear el gemelo y si
    Gemini responde (con fallback local). El resto son procesos.

Convenciones: óvalo = inicio/fin · rectángulo = proceso · rombo = decisión ·
paralelogramo = entrada/salida · cilindro = almacenamiento ·
doble borde = subproceso.
"""

W, H = 1560, 2400
LANES = [
    ("USUARIO", 40, 420, "#1FD0A3"),
    ("APP GEMA (frontend)", 420, 980, "#4DA3FF"),
    ("MOTOR IA & SERVICIOS", 980, 1520, "#A78BFA"),
]
PHASES = [
    ("FASE 1 · ONBOARDING (una sola vez)", 150),
    ("FASE 2 · LOOP DIARIO (el corazón del producto)", 1150),
    ("FASE 3 · SIMULACIÓN Y PROYECCIÓN (desde la TabBar)", 1850),
    ("FASE 4 · REPORTE MÉDICO", 2140),
]

BG = "#0B0E14"; CARD = "#161B27"; LINE = "#3A4358"; TXT = "#EAF0FA"; SUB = "#8A95AC"
GREEN = "#1FD0A3"; BLUE = "#4DA3FF"; PURPLE = "#A78BFA"; AMBER = "#FFB23E"; RED = "#FF5E6C"
DASH = "6 4"   # borde de nodo simulado

svg = []
defs = f"""
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{SUB}"/>
  </marker>
  <marker id="arrowG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{GREEN}"/>
  </marker>
  <marker id="arrowR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{RED}"/>
  </marker>
  <marker id="arrowP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{PURPLE}"/>
  </marker>
</defs>"""

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def wrap_text(x, y, lines, size=12.5, fill=TXT, weight="600", anchor="middle", lh=15):
    out = []
    y0 = y - (len(lines) - 1) * lh / 2
    for i, ln in enumerate(lines):
        out.append(f'<text x="{x}" y="{y0 + i*lh:.0f}" font-size="{size}" fill="{fill}" '
                   f'font-weight="{weight}" text-anchor="{anchor}" '
                   f'font-family="DM Sans, Segoe UI, sans-serif">{esc(ln)}</text>')
    return "\n".join(out)

def terminator(x, y, w, h, lines, color=GREEN):
    return (f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="{h/2}" '
            f'fill="{color}" fill-opacity="0.13" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+4, lines, fill=color, weight="800"))

def process(x, y, w, h, lines, color=BLUE, sub=False, dash=False, emph=False):
    d = f' stroke-dasharray="{DASH}"' if dash else ""
    sw = 3 if emph else 2
    extra = ""
    if sub:
        extra = (f'<rect x="{x-w/2+5}" y="{y-h/2+5}" width="{w-10}" height="{h-10}" rx="8" '
                 f'fill="none" stroke="{color}" stroke-opacity="0.4" stroke-width="1.4"{d}/>')
    if emph:
        extra += (f'<rect x="{x-w/2-5}" y="{y-h/2-5}" width="{w+10}" height="{h+10}" rx="14" '
                  f'fill="none" stroke="{color}" stroke-opacity="0.25" stroke-width="2"/>')
    return (f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="10" '
            f'fill="{CARD}" stroke="{color}" stroke-width="{sw}"{d}/>' + extra +
            wrap_text(x, y+4, lines))

def decision(x, y, w, h, lines, color=AMBER):
    pts = f"{x},{y-h/2} {x+w/2},{y} {x},{y+h/2} {x-w/2},{y}"
    return (f'<polygon points="{pts}" fill="{color}" fill-opacity="0.10" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+4, lines, size=11.5))

def io_shape(x, y, w, h, lines, color=GREEN, dash=False):
    d = f' stroke-dasharray="{DASH}"' if dash else ""
    sk = 18
    pts = f"{x-w/2+sk},{y-h/2} {x+w/2},{y-h/2} {x+w/2-sk},{y+h/2} {x-w/2},{y+h/2}"
    return (f'<polygon points="{pts}" fill="{CARD}" stroke="{color}" stroke-width="2"{d}/>' +
            wrap_text(x, y+4, lines))

def datastore(x, y, w, h, lines, color=PURPLE):
    ry = 10
    return (f'<path d="M {x-w/2} {y-h/2+ry} A {w/2} {ry} 0 0 1 {x+w/2} {y-h/2+ry} '
            f'L {x+w/2} {y+h/2-ry} A {w/2} {ry} 0 0 1 {x-w/2} {y+h/2-ry} Z" '
            f'fill="{CARD}" stroke="{color}" stroke-width="2"/>' +
            f'<ellipse cx="{x}" cy="{y-h/2+ry}" rx="{w/2}" ry="{ry}" fill="{CARD}" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+10, lines))

def arrow(x1, y1, x2, y2, label="", color=SUB, marker="arrow", dash="", lx=None, ly=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    if lx is None: lx, ly = (x1+x2)/2, (y1+y2)/2 - 6
    lbl = (f'<text x="{lx}" y="{ly}" font-size="11.5" fill="{color}" font-weight="800" '
           f'text-anchor="middle" font-family="DM Sans, sans-serif">{esc(label)}</text>') if label else ""
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="2" marker-end="url(#{marker})"{d}/>' + lbl)

def elbow(points, label="", color=SUB, marker="arrow", dash="", lx=None, ly=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    pts = " ".join(f"{p[0]},{p[1]}" for p in points)
    lbl = ""
    if label:
        if lx is None: lx, ly = points[1][0], points[1][1] - 8
        lbl = (f'<text x="{lx}" y="{ly}" font-size="11.5" fill="{color}" font-weight="800" '
               f'text-anchor="middle" font-family="DM Sans, sans-serif">{esc(label)}</text>')
    return (f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="2" '
            f'marker-end="url(#{marker})"{d}/>' + lbl)

# ── Canvas ───────────────────────────────────────────────────────────────────
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
svg.append(defs)
svg.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

svg.append(wrap_text(W/2, 46, ["GEMA — Flujograma del sistema"], size=26, weight="800"))
svg.append(wrap_text(W/2, 74, ["Gemelo digital metabólico · MVP Next.js + Gemini · prevención del síndrome metabólico (Lima, Perú)"],
                     size=13, fill=SUB, weight="600"))

# Lanes
for name, x0, x1, color in LANES:
    svg.append(f'<rect x="{x0}" y="100" width="{x1-x0}" height="{H-160}" fill="{color}" fill-opacity="0.04" '
               f'stroke="{LINE}" stroke-width="1"/>')
    svg.append(f'<rect x="{x0}" y="100" width="{x1-x0}" height="34" fill="{color}" fill-opacity="0.15" stroke="{LINE}"/>')
    svg.append(wrap_text((x0+x1)/2, 122, [name], size=13, fill=color, weight="800"))

# Phase bands
for name, y0 in PHASES:
    svg.append(f'<line x1="40" y1="{y0}" x2="1520" y2="{y0}" stroke="{LINE}" stroke-width="1" stroke-dasharray="6 5"/>')
    svg.append(f'<text x="52" y="{y0+22}" font-size="12" fill="{SUB}" font-weight="800" '
               f'font-family="DM Sans, sans-serif" letter-spacing="2">{esc(name)}</text>')

LU, LA, LI = 230, 700, 1250   # centros de carril

# ── FASE 1 · ONBOARDING ──────────────────────────────────────────────────────
svg.append(terminator(LU, 210, 240, 50, ["INICIO · abre GEMA"]))
svg.append(arrow(LU, 235, LU, 267))
svg.append(process(LU, 295, 290, 56, ["Inicia sesión:", "Google o email (simulado)"], dash=True))
svg.append(arrow(375, 295, 527, 295))
svg.append(process(LA, 295, 340, 72, ["Carrusel educativo: 73 % de peruanos",
                                      "no saludables → el gemelo como solución",
                                      "→ evidencia Twin Health (71 % remisión)"]))
svg.append(elbow([(700, 331), (700, 385), (230, 385), (230, 414)]))
svg.append(decision(LU, 465, 240, 96, ["¿Cómo crea", "su gemelo?"]))

svg.append(arrow(350, 465, 462, 465, label="Foto", lx=406, ly=459))
svg.append(process(590, 465, 250, 56, ["Cámara real (getUserMedia):", "captura una selfie"]))
svg.append(elbow([(230, 513), (230, 565), (462, 565)], label="Galería", lx=330, ly=557))
svg.append(process(590, 565, 250, 52, ["Galería simulada:", "elige una imagen"], dash=True))
svg.append(elbow([(110, 465), (110, 655), (532, 655)], label="Sin foto", lx=300, ly=647))

svg.append(elbow([(715, 465), (890, 465), (890, 500), (1057, 500)]))
svg.append(elbow([(715, 565), (890, 565), (890, 530), (1057, 530)]))
svg.append(process(LI, 515, 380, 68, ["GENERACIÓN DEL AVATAR (simulada):",
                                      "3 estados — happy · neutral · tired (.png)"],
                   color=PURPLE, sub=True, dash=True))
svg.append(elbow([(1250, 549), (1250, 655), (868, 655)]))

svg.append(process(LA, 655, 330, 60, ["Personaliza el gemelo: piel,", "peinado, accesorios, presentación"]))
svg.append(elbow([(700, 685), (700, 740), (230, 740), (230, 767)]))
svg.append(io_shape(LU, 805, 340, 70, ["Formulario de salud: edad, sexo, talla,",
                                       "peso, cintura, ciudad, antecedentes",
                                       "(con autorrelleno de demo)"]))
svg.append(arrow(LU, 840, LU, 868))
svg.append(process(LU, 900, 330, 58, ["Empareja el smartwatch (BLE simulado):",
                                      "buscar → detectar → nombrar · opcional"], dash=True))
svg.append(arrow(395, 900, 1062, 900))
svg.append(process(LI, 900, 370, 58, ["Señales del wearable (simuladas):",
                                      "HRV · pasos · sueño · presión arterial"], color=PURPLE, dash=True))
svg.append(arrow(LI, 929, LI, 956))
svg.append(process(LI, 995, 380, 72, ["Calibra el ICM inicial con pesos fijos:",
                                      "glucosa 35 % · actividad 20 % · sueño 20 %",
                                      "estrés 15 % · nutrición 10 %"], color=PURPLE))
svg.append(arrow(LI, 1031, LI, 1053))
svg.append(datastore(LI, 1090, 330, 68, ["Estado en memoria (React):",
                                         "perfil · gemelo · comidas · dispositivo"]))
svg.append(elbow([(1085, 1090), (700, 1090), (700, 1192)]))

# ── FASE 2 · LOOP DIARIO ─────────────────────────────────────────────────────
svg.append(process(LA, 1225, 340, 60, ["HOME · panel del día: ICM, gemelo,",
                                       "5 sub-índices, glucosa y comidas"], emph=True))
svg.append(elbow([(620, 1255), (620, 1290), (403, 1290)]))
svg.append(io_shape(LU, 1290, 340, 70, ["Registra comida (desayuno · almuerzo ·",
                                        "cena · snack): foto real o galería"]))
svg.append(elbow([(230, 1325), (230, 1350), (537, 1350)]))
svg.append(process(LA, 1350, 320, 56, ["POST /api/analyze-meal", "(imagen base64 + tipo de comida)"]))
svg.append(elbow([(860, 1350), (1250, 1350), (1250, 1375)]))
svg.append(decision(LI, 1425, 230, 94, ["¿Gemini", "responde?"]))

svg.append(elbow([(1365, 1425), (1425, 1425), (1425, 1487)], label="Sí", color=GREEN, marker="arrowG", lx=1398, ly=1417))
svg.append(process(1425, 1545, 175, 110, ["Gemini 2.5 Flash", "(o Flash-Lite):", "plato, carbos,",
                                          "kcal, carga,", "pico a 60 min"], color=GREEN))
svg.append(elbow([(1135, 1425), (1080, 1425), (1080, 1487)], label="No (sin red / créditos)",
                 color=RED, marker="arrowR", lx=1050, ly=1407))
svg.append(process(1080, 1545, 180, 110, ["Fallback local:", "estimación por", "tipo de comida",
                                          "(platos peruanos", "de referencia)"], color=RED, dash=True))

svg.append(elbow([(1425, 1600), (1425, 1652), (883, 1652)]))
svg.append(elbow([(1080, 1600), (1080, 1628), (883, 1628)]))
svg.append(io_shape(LA, 1640, 360, 64, ["Ficha nutricional: carga, carbos, kcal", "+ pico de glucosa previsto a 60 min"]))
svg.append(elbow([(700, 1672), (700, 1700), (1250, 1700), (1250, 1712)],
                 label="el usuario confirma «Registrar»", lx=975, ly=1692))
svg.append(process(LI, 1745, 380, 60, ["Recalcula sub-índices Nutrición y Glucosa",
                                       "→ ICM del día en vivo (liveICM)"], color=PURPLE))
svg.append(arrow(1060, 1745, 408, 1745))
svg.append(process(240, 1745, 330, 60, ["El gemelo cambia expresión y color:",
                                        "<40 verde · 40–69 ámbar · ≥70 rojo"], color=GREEN))
svg.append(elbow([(75, 1745), (50, 1745), (50, 1225), (527, 1225)],
                 label="LOOP DIARIO · cada registro actualiza el gemelo",
                 color=GREEN, marker="arrowG", lx=288, ly=1211))

# ── FASE 3 · SIMULACIÓN Y PROYECCIÓN ─────────────────────────────────────────
svg.append(arrow(240, 1775, 240, 1896))
svg.append(process(240, 1935, 350, 72, ["Simulador what-if (pestaña Gemelo):",
                                        "caminar 0–60 min · dormir 4–9 h",
                                        "· carbos de la cena 20–80 %"]))
svg.append(arrow(415, 1920, 1057, 1920))
svg.append(process(LI, 1935, 380, 72, ["Modelo fisiológico projectICM():",
                                       "caminar −14 · sueño +14/−5 · carbos ±8 pts",
                                       "(Reynolds 2016 · Spiegel 1999 · Hall 2019)"], color=PURPLE))
svg.append(arrow(1060, 1952, 418, 1952, label="ICM proyectado: el gemelo cambia en vivo",
                 color=GREEN, marker="arrowG", dash="5 4", lx=737, ly=1970))
svg.append(elbow([(240, 1971), (240, 2065), (522, 2065)]))
svg.append(process(LA, 2065, 350, 60, ["Proyección a 5 años (Progreso):",
                                       "riesgo 23 % → 48 % sin plan · → 11 % con plan"]))
svg.append(arrow(LI, 1971, LI, 2026, label="evolución a producción", color=PURPLE,
                 marker="arrowP", dash="5 4", lx=1370, ly=2002))
svg.append(process(LI, 2065, 380, 78, ["Modelos entrenados offline (scikit-learn):",
                                       "riesgo → Random Forest (acc 88.5 %)",
                                       "pico glucémico → Gradient Boosting"], color=PURPLE))

# ── FASE 4 · REPORTE MÉDICO ──────────────────────────────────────────────────
svg.append(arrow(LA, 2095, LA, 2171))
svg.append(io_shape(LA, 2205, 400, 64, ["REPORTE MÉDICO: 5 criterios NCEP-ATP III,",
                                        "TyG, HbA1c, curva de glucosa, riesgo a 5 años"]))
svg.append(arrow(500, 2205, 418, 2205))
svg.append(process(240, 2205, 350, 56, ["Descarga / comparte el reporte (simulado)",
                                        "→ lo lleva a su cita médica"], dash=True))
svg.append(arrow(240, 2233, 240, 2273))
svg.append(terminator(240, 2297, 340, 48, ["FIN · el ciclo se repite cada día"], color=AMBER))

# Footnote
svg.append(wrap_text(W/2, H-28, ["Omitido por claridad: vistas estáticas secundarias (alertas, detalle de sub-índice, perfil)."],
                     size=11.5, fill=SUB))

# ── Legend ───────────────────────────────────────────────────────────────────
lx0, ly0 = 1120, 160
svg.append(f'<rect x="{lx0}" y="{ly0}" width="390" height="200" rx="12" fill="{CARD}" stroke="{LINE}"/>')
svg.append(wrap_text(lx0+195, ly0+22, ["LEYENDA"], size=12, fill=SUB, weight="800"))

c1s, c1t = lx0+20, lx0+74          # columna 1: forma, texto
rows1 = [
    (f'<rect x="{c1s}" y="{{y}}" width="44" height="18" rx="9" fill="{GREEN}" fill-opacity="0.13" stroke="{GREEN}" stroke-width="1.6"/>', "Inicio / fin"),
    (f'<rect x="{c1s}" y="{{y}}" width="44" height="18" rx="5" fill="{CARD}" stroke="{BLUE}" stroke-width="1.6"/>', "Proceso"),
    (f'<polygon points="{c1s+22},{{y}} {c1s+44},{{ym}} {c1s+22},{{yb}} {c1s},{{ym}}" fill="{AMBER}" fill-opacity="0.10" stroke="{AMBER}" stroke-width="1.6"/>', "Decisión"),
    (f'<polygon points="{c1s+8},{{y}} {c1s+44},{{y}} {c1s+36},{{yb}} {c1s},{{yb}}" fill="{CARD}" stroke="{GREEN}" stroke-width="1.6"/>', "Entrada / salida"),
    (f'<rect x="{c1s}" y="{{y}}" width="44" height="18" rx="8" fill="{CARD}" stroke="{PURPLE}" stroke-width="1.6"/>', "Almacenamiento"),
]
for i, (shape, label) in enumerate(rows1):
    y = ly0 + 40 + i * 30
    svg.append(shape.format(y=y, ym=y+9, yb=y+18))
    svg.append(wrap_text(c1t, y+13, [label], size=11.5, anchor="start"))

c2s, c2t = lx0+210, lx0+264        # columna 2
svg.append(f'<rect x="{c2s}" y="{ly0+40}" width="44" height="18" rx="5" fill="{CARD}" stroke="{SUB}" stroke-width="1.6" stroke-dasharray="{DASH}"/>')
svg.append(wrap_text(c2t, ly0+53, ["Simulado (mock)"], size=11.5, anchor="start"))
svg.append(f'<rect x="{c2s}" y="{ly0+70}" width="44" height="18" rx="5" fill="{CARD}" stroke="{SUB}" stroke-width="1.6"/>')
svg.append(wrap_text(c2t, ly0+83, ["Real en el MVP"], size=11.5, anchor="start"))
svg.append(f'<line x1="{c2s}" y1="{ly0+109}" x2="{c2s+44}" y2="{ly0+109}" stroke="{SUB}" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrow)"/>')
svg.append(wrap_text(c2t, ly0+113, ["Feedback / futuro"], size=11.5, anchor="start"))
svg.append(f'<line x1="{c2s}" y1="{ly0+139}" x2="{c2s+44}" y2="{ly0+139}" stroke="{GREEN}" stroke-width="2" marker-end="url(#arrowG)"/>')
svg.append(wrap_text(c2t, ly0+143, ["Sí / loop diario"], size=11.5, anchor="start"))
svg.append(f'<line x1="{c2s}" y1="{ly0+169}" x2="{c2s+44}" y2="{ly0+169}" stroke="{RED}" stroke-width="2" marker-end="url(#arrowR)"/>')
svg.append(wrap_text(c2t, ly0+173, ["No / fallback"], size=11.5, anchor="start"))

svg.append("</svg>")

out = "\n".join(svg)
with open("/home/siesta/gemelo-digital/docs/flujograma-gema.svg", "w") as f:
    f.write(out)
print(f"SVG escrito: {len(out)} bytes")
