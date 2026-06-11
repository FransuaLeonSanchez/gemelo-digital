#!/usr/bin/env python3
"""Genera docs/flujograma-gema.svg — flujograma completo de la app GEMA.

Convenciones (buenas prácticas de diagramación):
  - Óvalo            → inicio / fin (terminator)
  - Rectángulo       → proceso
  - Rombo            → decisión (salidas etiquetadas Sí/No o por rama)
  - Paralelogramo    → entrada/salida de datos
  - Cilindro         → almacenamiento de datos
  - Doble borde      → subproceso (detallado en otra parte)
  - Swimlanes        → responsable de cada paso (Usuario / App / IA & Servicios)
"""

W, H = 1560, 2680
LANES = [
    ("USUARIO", 40, 420, "#1FD0A3"),
    ("APP GEMA (frontend)", 420, 980, "#4DA3FF"),
    ("MOTOR IA & SERVICIOS", 980, 1520, "#A78BFA"),
]
PHASES = [
    ("FASE 1 · ACCESO", 120, 420),
    ("FASE 2 · CREACIÓN DEL GEMELO", 420, 940),
    ("FASE 3 · PERFIL Y DISPOSITIVOS", 940, 1430),
    ("FASE 4 · USO DIARIO (LOOP)", 1430, 2110),
    ("FASE 5 · INTELIGENCIA PREDICTIVA", 2110, 2440),
    ("FASE 6 · CONEXIÓN MÉDICA", 2440, 2640),
]

BG = "#0B0E14"; CARD = "#161B27"; LINE = "#3A4358"; TXT = "#EAF0FA"; SUB = "#8A95AC"

svg = []
defs = f"""
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{SUB}"/>
  </marker>
  <marker id="arrowG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#1FD0A3"/>
  </marker>
  <marker id="arrowR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF5E6C"/>
  </marker>
</defs>"""

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def wrap_text(x, y, lines, size=12.5, fill=TXT, weight="600", anchor="middle", lh=15):
    out = []
    total = len(lines)
    y0 = y - (total - 1) * lh / 2
    for i, ln in enumerate(lines):
        out.append(f'<text x="{x}" y="{y0 + i*lh:.0f}" font-size="{size}" fill="{fill}" '
                   f'font-weight="{weight}" text-anchor="{anchor}" '
                   f'font-family="DM Sans, Segoe UI, sans-serif">{esc(ln)}</text>')
    return "\n".join(out)

def terminator(x, y, w, h, lines, color="#1FD0A3"):
    return (f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="{h/2}" '
            f'fill="{color}" fill-opacity="0.13" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+4, lines, fill=color, weight="800"))

def process(x, y, w, h, lines, color="#4DA3FF", sub=False):
    extra = (f'<rect x="{x-w/2+5}" y="{y-h/2+5}" width="{w-10}" height="{h-10}" rx="8" '
             f'fill="none" stroke="{color}" stroke-opacity="0.4" stroke-width="1.4"/>') if sub else ""
    return (f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="10" '
            f'fill="{CARD}" stroke="{color}" stroke-width="2"/>' + extra +
            wrap_text(x, y+4, lines))

def decision(x, y, w, h, lines, color="#FFB23E"):
    pts = f"{x},{y-h/2} {x+w/2},{y} {x},{y+h/2} {x-w/2},{y}"
    return (f'<polygon points="{pts}" fill="{color}" fill-opacity="0.10" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+4, lines, size=11.5))

def io_shape(x, y, w, h, lines, color="#1FD0A3"):
    sk = 18
    pts = f"{x-w/2+sk},{y-h/2} {x+w/2},{y-h/2} {x+w/2-sk},{y+h/2} {x-w/2},{y+h/2}"
    return (f'<polygon points="{pts}" fill="{CARD}" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+4, lines))

def datastore(x, y, w, h, lines, color="#A78BFA"):
    ry = 10
    return (f'<path d="M {x-w/2} {y-h/2+ry} A {w/2} {ry} 0 0 1 {x+w/2} {y-h/2+ry} '
            f'L {x+w/2} {y+h/2-ry} A {w/2} {ry} 0 0 1 {x-w/2} {y+h/2-ry} Z" '
            f'fill="{CARD}" stroke="{color}" stroke-width="2"/>' +
            f'<ellipse cx="{x}" cy="{y-h/2+ry}" rx="{w/2}" ry="{ry}" fill="{CARD}" stroke="{color}" stroke-width="2"/>' +
            wrap_text(x, y+10, lines))

def arrow(x1, y1, x2, y2, label="", color=SUB, marker="arrow", dash="", label_dx=0, label_dy=-6):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    mx, my = (x1+x2)/2, (y1+y2)/2
    lbl = (f'<text x="{mx+label_dx}" y="{my+label_dy}" font-size="11.5" fill="{color}" font-weight="800" '
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

# Title
svg.append(wrap_text(W/2, 46, ["GEMA — Flujograma general del sistema"], size=26, weight="800"))
svg.append(wrap_text(W/2, 74, ["Gemelo digital metabólico · MVP · prevención del síndrome metabólico (Lima, Perú)"],
                     size=13, fill=SUB, weight="600"))

# Lanes
for name, x0, x1, color in LANES:
    svg.append(f'<rect x="{x0}" y="100" width="{x1-x0}" height="{H-140}" fill="{color}" fill-opacity="0.04" '
               f'stroke="{LINE}" stroke-width="1"/>')
    svg.append(f'<rect x="{x0}" y="100" width="{x1-x0}" height="34" fill="{color}" fill-opacity="0.15" stroke="{LINE}"/>')
    svg.append(wrap_text((x0+x1)/2, 122, [name], size=13, fill=color, weight="800"))

# Phase bands
for name, y0, y1 in PHASES:
    svg.append(f'<line x1="40" y1="{y0}" x2="1520" y2="{y0}" stroke="{LINE}" stroke-width="1" stroke-dasharray="6 5"/>')
    svg.append(f'<text x="52" y="{y0+22}" font-size="12" fill="{SUB}" font-weight="800" '
               f'font-family="DM Sans, sans-serif" letter-spacing="2">{esc(name)}</text>')

LU, LA, LI = 230, 700, 1250   # centros de carril

# ── FASE 1 — ACCESO ──────────────────────────────────────────────────────────
svg.append(terminator(LU, 185, 280, 52, ["INICIO · abre GEMA"]))
svg.append(arrow(LU, 211, LU, 248))
svg.append(decision(LU, 290, 220, 84, ["¿Cómo inicia", "sesión?"]))
svg.append(elbow([(340, 290), (560, 290), (560, 318)], label="Google (simulado)"))
svg.append(elbow([(230, 332), (230, 360), (560, 360)], label="Email", lx=380, ly=352))
svg.append(process(LA, 360, 360, 56, ["Carrusel educativo: problema (73 % no saludable)", "→ solución (gemelo) → evidencia (Twin Health 71 %)"]))

# ── FASE 2 — CREACIÓN DEL GEMELO ─────────────────────────────────────────────
svg.append(elbow([(700, 388), (700, 430), (230, 430), (230, 458)]))
svg.append(decision(LU, 510, 240, 96, ["¿Cómo crear", "el gemelo?"]))

svg.append(elbow([(350, 510), (575, 510), (575, 540)], label="Foto"))
svg.append(process(575, 570, 250, 60, ["Cámara frontal real", "(getUserMedia) + captura"]))
svg.append(elbow([(230, 558), (230, 640), (450, 640)], label="Galería", lx=320, ly=632))
svg.append(process(575, 640, 250, 56, ["Galería simulada", "→ selecciona foto"]))
svg.append(elbow([(230, 558), (230, 718), (450, 718)], label="Sin foto", lx=320, ly=710))
svg.append(process(575, 718, 250, 56, ["Editor manual: piel,", "peinado, accesorios"]))

svg.append(elbow([(700, 570), (840, 570), (840, 600)]))
svg.append(elbow([(700, 640), (840, 640), (840, 612)]))
svg.append(process(LI, 612, 380, 64, ["GENERACIÓN DEL AVATAR (subproceso)", "3 estados: saludable · regular · en riesgo"], sub=True))
svg.append(arrow(LI, 644, LI, 680))
svg.append(io_shape(LI, 712, 360, 56, ["Assets del gemelo:", "happy.png · neutral.png · tired.png"]))

svg.append(elbow([(575, 746), (575, 880), (700, 880)], dash="5 4"))
svg.append(elbow([(1250, 740), (1250, 880), (860, 880)]))
svg.append(process(700, 880, 300, 54, ["Vista previa del gemelo", "(SVG si no hay foto · imagen si hay)"]))

# ── FASE 3 — PERFIL Y DISPOSITIVOS ───────────────────────────────────────────
svg.append(elbow([(700, 907), (700, 960), (230, 960), (230, 986)]))
svg.append(io_shape(LU, 1020, 340, 64, ["Formulario de datos: edad, sexo, talla,", "peso, cintura, ciudad, antecedentes", "(con autorrelleno de demo)"]))
svg.append(arrow(LU, 1052, LU, 1090))
svg.append(process(LU, 1122, 320, 56, ["Empareja smartwatch (BLE sim):", "buscar → detectar → nombrar"]))
svg.append(elbow([(390, 1122), (1060, 1122)]))
svg.append(process(LI, 1122, 360, 56, ["Sincroniza señales del wearable:", "HRV · pasos · sueño · presión"]))
svg.append(arrow(LI, 1150, LI, 1188))
svg.append(process(LI, 1222, 380, 60, ["Calibra el ICM inicial: pesos base", "glucosa 35 · activ. 20 · sueño 20 · estrés 15 · nutric. 10"]))
svg.append(arrow(LI, 1252, LI, 1290))
svg.append(datastore(LI, 1340, 330, 70, ["Perfil + gemelo del usuario", "(MVP: memoria · prod: PostgreSQL/Timescale)"]))

# ── FASE 4 — USO DIARIO ──────────────────────────────────────────────────────
svg.append(elbow([(1085, 1340), (700, 1340), (700, 1470)]))
svg.append(process(700, 1500, 330, 60, ["HOME · panel del día: ICM, gemelo,", "5 sub-índices, glucosa, comidas"]))
svg.append(elbow([(535, 1500), (230, 1500), (230, 1530)]))
svg.append(io_shape(LU, 1565, 330, 64, ["Registra comida (desayuno / almuerzo /", "cena / snack): foto real o galería"]))
svg.append(elbow([(395, 1565), (700, 1565), (700, 1592)]))
svg.append(process(700, 1622, 320, 56, ["POST /api/analyze-meal", "(imagen base64 + tipo de comida)"]))
svg.append(elbow([(860, 1622), (1250, 1622), (1250, 1652)]))
svg.append(decision(LI, 1702, 230, 92, ["¿Gemini", "responde?"]))
svg.append(elbow([(1365, 1702), (1430, 1702), (1430, 1780)], label="Sí", color="#1FD0A3", marker="arrowG", lx=1408, ly=1696))
svg.append(process(1430, 1810, 150, 110, ["Gemini 2.0", "Flash analiza:", "plato, carbos,", "kcal, carga,", "pico previsto"], color="#1FD0A3"))
svg.append(elbow([(1135, 1702), (1075, 1702), (1075, 1780)], label="No (sin créditos/red)", color="#FF5E6C", marker="arrowR", lx=1080, ly=1696))
svg.append(process(1075, 1810, 170, 110, ["Fallback local:", "estimación por", "tipo de comida", "(plato peruano", "de referencia)"], color="#FF5E6C"))
svg.append(elbow([(1430, 1865), (1430, 1925), (1290, 1925)]))
svg.append(elbow([(1075, 1865), (1075, 1925), (1210, 1925)]))
svg.append(process(LI, 1955, 360, 60, ["Recalcula sub-índices (nutrición, glucosa)", "→ ICM en vivo + predicción de pico (~60 min)"]))
svg.append(elbow([(1070, 1955), (700, 1955), (700, 1984)]))
svg.append(decision(700, 2034, 250, 92, ["¿ICM?", "<40 · 40-69 · ≥70"]))
svg.append(elbow([(575, 2034), (230, 2034), (230, 2062)]))
svg.append(process(LU, 2092, 320, 56, ["El gemelo cambia de expresión y color:", "feliz (verde) · regular (ámbar) · fatigado (rojo)"]))
svg.append(elbow([(825, 2034), (1250, 2034), (1250, 1985)], label="≥70 ó pico >160 → ALERTA push", color="#FF5E6C", marker="arrowR", dash="5 4", lx=1080, ly=2026))

# ── FASE 5 — INTELIGENCIA ────────────────────────────────────────────────────
svg.append(elbow([(230, 2120), (230, 2178)]))
svg.append(process(LU, 2210, 320, 60, ["Simulador what-if: caminar (0-60 min),", "dormir (4-9 h), carbos cena (20-80 %)"]))
svg.append(elbow([(390, 2210), (1060, 2210)]))
svg.append(process(LI, 2210, 360, 60, ["Modelo fisiológico projectICM()", "(Reynolds 2016 · Spiegel 1999 · Hall 2019)"]))
svg.append(arrow(LI, 2240, LI, 2278))
svg.append(process(LI, 2310, 360, 56, ["Motor de recomendaciones: ataca el", "peor sub-índice, español peruano"]))
svg.append(elbow([(1070, 2310), (700, 2310), (700, 2338)]))
svg.append(process(700, 2368, 320, 56, ["Proyección a 5 años: riesgo 23 % → 48 %", "sin cambios · 23 % → 11 % con plan"]))

# ── FASE 6 — MÉDICO ──────────────────────────────────────────────────────────
svg.append(elbow([(700, 2396), (700, 2456)]))
svg.append(io_shape(700, 2492, 380, 64, ["REPORTE MÉDICO: 5 criterios NCEP-ATP III,", "TyG, HbA1c, HRV, curva de glucosa, riesgo 5a"]))
svg.append(elbow([(510, 2492), (230, 2492), (230, 2520)]))
svg.append(process(LU, 2550, 300, 52, ["Descarga / comparte el reporte", "→ lo lleva a su cita médica"]))
svg.append(elbow([(230, 2576), (230, 2602)]))
svg.append(terminator(LU, 2625, 320, 46, ["FIN DEL CICLO · se repite a diario"], color="#FFB23E"))

# Loop back annotation
svg.append(elbow([(390, 2625), (1480, 2625), (1480, 1500), (865, 1500)], dash="7 5",
                 label="LOOP DIARIO: cada comida / registro actualiza el gemelo", lx=1180, ly=2615))

# ── Legend ───────────────────────────────────────────────────────────────────
lx, ly = 1180, 158
svg.append(f'<rect x="{lx-30}" y="{ly-22}" width="360" height="150" rx="12" fill="{CARD}" stroke="{LINE}"/>')
svg.append(wrap_text(lx+150, ly-2, ["LEYENDA"], size=12, fill=SUB, weight="800"))
svg.append(f'<rect x="{lx}" y="{ly+12}" width="48" height="20" rx="10" fill="#1FD0A3" fill-opacity="0.13" stroke="#1FD0A3" stroke-width="1.6"/>')
svg.append(wrap_text(lx+62, ly+26, ["Inicio / fin"], size=11.5, anchor="start"))
svg.append(f'<rect x="{lx}" y="{ly+40}" width="48" height="20" rx="5" fill="{CARD}" stroke="#4DA3FF" stroke-width="1.6"/>')
svg.append(wrap_text(lx+62, ly+54, ["Proceso"], size=11.5, anchor="start"))
svg.append(f'<polygon points="{lx+24},{ly+66} {lx+48},{ly+78} {lx+24},{ly+90} {lx},{ly+78}" fill="#FFB23E" fill-opacity="0.10" stroke="#FFB23E" stroke-width="1.6"/>')
svg.append(wrap_text(lx+62, ly+82, ["Decisión"], size=11.5, anchor="start"))
svg.append(f'<polygon points="{lx+8},{ly+94} {lx+48},{ly+94} {lx+40},{ly+114} {lx},{ly+114}" fill="{CARD}" stroke="#1FD0A3" stroke-width="1.6"/>')
svg.append(wrap_text(lx+62, ly+108, ["Entrada / salida de datos"], size=11.5, anchor="start"))
svg.append(wrap_text(lx+185, ly+26, ["─ ─ flujo asíncrono / alerta"], size=11.5, anchor="start", fill=SUB))
svg.append(wrap_text(lx+185, ly+54, ["Doble borde = subproceso"], size=11.5, anchor="start", fill=SUB))

svg.append("</svg>")

out = "\n".join(svg)
with open("/home/siesta/gemelo-digital/docs/flujograma-gema.svg", "w") as f:
    f.write(out)
print(f"SVG escrito: {len(out)} bytes")
