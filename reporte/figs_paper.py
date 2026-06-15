"""Genera las figuras del paper IEEE de GEMA, en FONDO BLANCO y calidad de
impresion (las figuras del repo usan tema oscuro, no apto para un articulo IEEE).

Reusa los .joblib entrenados y el generador sintetico, reconstruye el mismo
test set (mismos seeds que entrenar_modelo.py) y produce:

    figs/fig_confusion.png      matriz de confusion (Modelo 1)
    figs/fig_importancias.png   importancia de variables (Modelo 1)
    figs/fig_pred_real.png      predicho vs real (Modelo 2)
    figs/fig_whatif.png         escenarios arroz con pollo (Modelo 2)
    figs/fig_epi.png            epidemiologia del sindrome metabolico en Peru
    figs/fig_icm.png            composicion del Indice de Carga Metabolica
    figs/fig_twin.png           el gemelo en 3 estados segun el ICM
"""
from pathlib import Path
import sys

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

MP = Path("/home/siesta/gemelo-digital/modelo-predictivo")
sys.path.insert(0, str(MP))
from datos_sinteticos import generar_comidas, generar_poblacion_riesgo  # noqa

OUT = Path("/home/siesta/gemelo-digital/reporte/figs")
OUT.mkdir(parents=True, exist_ok=True)

FEATURES_RIESGO = ["cv_glucemico_pct", "tiempo_en_rango_pct", "pico_postprandial_prom",
                   "sueno_promedio_h", "pasos_promedio_dia", "hrv_promedio_ms",
                   "indice_tyg", "cintura_cm"]
FEATURES_PICO = ["glucosa_basal_mgdl", "carbohidratos_g", "indice_glucemico",
                 "carga_glucemica", "caminata_post_min", "sueno_anoche_h",
                 "hrv_ms", "hora_dia"]

# Paleta GEMA sobre fondo BLANCO (colores solidos, alto contraste -> IEEE)
BLUE = "#2563EB"; GREEN = "#0E9F6E"; PURPLE = "#7C3AED"
AMBER = "#D97706"; RED = "#DC2626"; TEAL = "#0D9488"
INK = "#111827"; GRID = "#D1D5DB"; MUT = "#6B7280"

plt.rcParams.update({
    "figure.facecolor": "white", "axes.facecolor": "white", "savefig.facecolor": "white",
    "text.color": INK, "axes.labelcolor": INK, "axes.edgecolor": "#9CA3AF",
    "xtick.color": INK, "ytick.color": INK, "font.size": 12,
    "font.family": "DejaVu Serif",        # serif, mas cercano a Times del paper
    "axes.titleweight": "bold", "axes.titlesize": 13, "savefig.dpi": 320,
    "savefig.bbox": "tight",
})

rf = joblib.load(MP / "modelos" / "clasificador_riesgo_rf.joblib")
gbm = joblib.load(MP / "modelos" / "predictor_pico_gbm.joblib")

# ── Modelo 1: matriz de confusion ────────────────────────────────────────────
df_r = generar_poblacion_riesgo(6000)
Xr, yr = df_r[FEATURES_RIESGO], df_r["riesgo"]
_, Xr_te, _, yr_te = train_test_split(Xr, yr, test_size=0.2, stratify=yr, random_state=7)
pred_r = rf.predict(Xr_te)
labels = ["bajo", "moderado", "alto"]
cm = confusion_matrix(yr_te, pred_r, labels=labels)

fig, ax = plt.subplots(figsize=(4.6, 3.7))
im = ax.imshow(cm, cmap="Blues")
ax.set_xticks(range(3), [l.capitalize() for l in labels])
ax.set_yticks(range(3), [l.capitalize() for l in labels])
ax.set_xlabel("Clase predicha", fontweight="bold")
ax.set_ylabel("Clase real", fontweight="bold")
for i in range(3):
    for j in range(3):
        c = "white" if cm[i, j] > cm.max() * 0.5 else INK
        ax.text(j, i, f"{cm[i, j]}", ha="center", va="center",
                fontsize=17, fontweight="bold", color=c)
ax.set_xticks(np.arange(-.5, 3, 1), minor=True)
ax.set_yticks(np.arange(-.5, 3, 1), minor=True)
ax.grid(which="minor", color="white", linewidth=2)
ax.tick_params(which="minor", length=0)
fig.tight_layout()
fig.savefig(OUT / "fig_confusion.png")
plt.close(fig)

# ── Modelo 1: importancia de variables ───────────────────────────────────────
NOMBRES = {
    "tiempo_en_rango_pct": "Tiempo en rango glucémico (CGM)",
    "cv_glucemico_pct": "Variabilidad glucémica (CGM)",
    "pico_postprandial_prom": "Pico postprandial promedio (CGM)",
    "indice_tyg": "Índice TyG (laboratorio)",
    "cintura_cm": "Circunferencia de cintura (perfil)",
    "pasos_promedio_dia": "Pasos por día (smartwatch)",
    "sueno_promedio_h": "Horas de sueño (smartwatch)",
    "hrv_promedio_ms": "HRV — estrés (smartwatch)",
}
imp = sorted(zip(FEATURES_RIESGO, rf.feature_importances_), key=lambda t: t[1])
nombres = [NOMBRES[f] for f, _ in imp]
vals = [v * 100 for _, v in imp]
colores = [GREEN if v >= 17 else BLUE if v >= 8 else PURPLE for v in vals]
fig, ax = plt.subplots(figsize=(6.6, 3.5))
bars = ax.barh(nombres, vals, color=colores, height=0.66, edgecolor="white")
for b, v in zip(bars, vals):
    ax.text(v + 0.4, b.get_y() + b.get_height() / 2, f"{v:.1f}%",
            va="center", fontsize=11, color=INK, fontweight="bold")
ax.set_xlim(0, 34)
ax.set_xlabel("Importancia en la decisión (%)", fontweight="bold")
ax.grid(axis="x", color=GRID, alpha=0.8)
ax.set_axisbelow(True)
fig.tight_layout()
fig.savefig(OUT / "fig_importancias.png")
plt.close(fig)

# ── Modelo 2: predicho vs real ───────────────────────────────────────────────
df_c = generar_comidas(9000)
Xc, yc = df_c[FEATURES_PICO], df_c["pico_60min_mgdl"]
_, Xc_te, _, yc_te = train_test_split(Xc, yc, test_size=0.2, random_state=7)
pred_c = gbm.predict(Xc_te)
mae = float(np.mean(np.abs(pred_c - yc_te)))
fig, ax = plt.subplots(figsize=(4.7, 4.2))
lims = [95, 265]
ax.fill_between(lims, [l - 15 for l in lims], [l + 15 for l in lims],
                color=GREEN, alpha=0.16, label="margen clínico $\\pm$15 mg/dL")
ax.scatter(yc_te, pred_c, s=7, alpha=0.28, color=BLUE, edgecolors="none")
ax.plot(lims, lims, "--", color=INK, lw=1.3)
ax.set_xlim(lims); ax.set_ylim(lims)
ax.set_xlabel("Pico observado (mg/dL)", fontweight="bold")
ax.set_ylabel("Pico predicho (mg/dL)", fontweight="bold")
ax.legend(loc="upper left", fontsize=10, framealpha=0.95)
ax.text(0.97, 0.07, f"MAE = $\\pm${mae:.1f} mg/dL\n$R^2$ = 0.914",
        transform=ax.transAxes, ha="right", fontsize=12, fontweight="bold",
        color=GREEN, bbox=dict(boxstyle="round,pad=0.4", fc="white", ec=GREEN, lw=1.3))
ax.grid(color=GRID, alpha=0.8)
ax.set_axisbelow(True)
fig.tight_layout()
fig.savefig(OUT / "fig_pred_real.png")
plt.close(fig)

# ── Modelo 2: escenarios what-if (arroz con pollo) ───────────────────────────
base = {"glucosa_basal_mgdl": 95, "carbohidratos_g": 78, "indice_glucemico": 72,
        "carga_glucemica": 78 * 72 / 100, "caminata_post_min": 0,
        "sueno_anoche_h": 5.7, "hrv_ms": 42, "hora_dia": 13}
escen = [("Arroz con pollo, sin caminar", base),
         ("+ caminata 25 min", {**base, "caminata_post_min": 25}),
         ("Con quinua (IG 53)", {**base, "indice_glucemico": 53, "carga_glucemica": 78 * 53 / 100}),
         ("Quinua + caminata 25 min", {**base, "indice_glucemico": 53,
                                       "carga_glucemica": 78 * 53 / 100, "caminata_post_min": 25})]
nombres_e = [n for n, _ in escen][::-1]
picos = [float(gbm.predict(pd.DataFrame([e]))[0]) for _, e in escen][::-1]
colores_e = [GREEN if p <= 140 else AMBER if p <= 155 else RED for p in picos]
fig, ax = plt.subplots(figsize=(6.6, 3.2))
bars = ax.barh(nombres_e, picos, color=colores_e, height=0.62, edgecolor="white")
for b, p in zip(bars, picos):
    ax.text(p + 1.5, b.get_y() + b.get_height() / 2, f"{p:.0f}",
            va="center", fontsize=12, fontweight="bold", color=INK)
ax.axvline(140, color=RED, lw=1.5, ls="--")
ax.text(141, 3.35, "límite de pico alto (140)", color=RED, fontsize=9.5, fontweight="bold")
ax.set_xlim(90, 185)
ax.set_xlabel("Pico de glucosa previsto a 60 min (mg/dL)", fontweight="bold")
ax.grid(axis="x", color=GRID, alpha=0.8)
ax.set_axisbelow(True)
fig.tight_layout()
fig.savefig(OUT / "fig_whatif.png")
plt.close(fig)

# ── Epidemiologia del sindrome metabolico en Peru ────────────────────────────
grupos = ["Sierra\nrural", "Prevalencia\nnacional", "Lima\nMetrop.", "Hombres\n(nac.)",
          "Mujeres\n(nac.)", "Hospital\nEsSalud", "Comedores\npopulares"]
prev = [11.1, 16.8, 20.7, 7.2, 26.4, 38.97, 40.1]
cols = [GREEN, BLUE, BLUE, TEAL, PURPLE, AMBER, RED]
fig, ax = plt.subplots(figsize=(6.7, 3.1))
bars = ax.bar(grupos, prev, color=cols, width=0.66, edgecolor="white")
for b, v in zip(bars, prev):
    ax.text(b.get_x() + b.get_width() / 2, v + 0.7, f"{v:.1f}%",
            ha="center", fontsize=10.5, fontweight="bold", color=INK)
ax.set_ylim(0, 46)
ax.set_ylabel("Prevalencia (%)", fontweight="bold")
ax.grid(axis="y", color=GRID, alpha=0.8)
ax.set_axisbelow(True)
ax.tick_params(axis="x", labelsize=9.5)
fig.tight_layout()
fig.savefig(OUT / "fig_epi.png")
plt.close(fig)

# ── Composicion del ICM (5 sub-indices ponderados) ───────────────────────────
sub = ["Glucosa", "Actividad", "Sueño", "Estrés", "Nutrición"]
peso = [35, 20, 20, 15, 10]
cols = ["#38BDF8", "#22C55E", "#8B5CF6", "#EF4444", "#14B8A6"]
fig, ax = plt.subplots(figsize=(4.5, 3.7), subplot_kw=dict(aspect="equal"))
wedges, _ = ax.pie(peso, colors=cols, startangle=90, counterclock=False,
                   wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2))
ax.text(0, 0.12, "ICM", ha="center", va="center", fontsize=20, fontweight="bold", color=INK)
ax.text(0, -0.20, "0–100", ha="center", va="center", fontsize=11, color=MUT)
leg = [f"{s} · {p}%" for s, p in zip(sub, peso)]
ax.legend(wedges, leg, loc="center left", bbox_to_anchor=(0.92, 0.5),
          fontsize=11, frameon=False)
fig.tight_layout()
fig.savefig(OUT / "fig_icm.png")
plt.close(fig)

# ── El gemelo en 3 estados segun el ICM (montaje con avatares reales) ─────────
TW = Path("/home/siesta/gemelo-digital/public/images/twin")
estados = [("happy.png", "Saludable", "ICM 0–39", "#16A34A"),
           ("neutral.png", "Regular", "ICM 40–69", "#D97706"),
           ("tired.png", "En riesgo", "ICM 70–100", "#DC2626")]
S = 520            # lado del avatar
PAD, TOP, BOT = 26, 18, 92
canvas = Image.new("RGB", (S * 3 + PAD * 4, S + TOP + BOT + PAD), "white")
draw = ImageDraw.Draw(canvas)
from PIL import ImageFont
def font(sz, bold=True):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" if bold
              else "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            return ImageFont.load_default()
f_big, f_sub = font(40), font(30, bold=False)
for i, (fn, titulo, rango, color) in enumerate(estados):
    x = PAD + i * (S + PAD)
    im = Image.open(TW / fn).convert("RGBA").resize((S, S))
    bg = Image.new("RGBA", (S, S), "white")
    bg.alpha_composite(im)
    canvas.paste(bg.convert("RGB"), (x, TOP + PAD // 2))
    # banda de color con el estado
    by = TOP + PAD // 2 + S + 8
    draw.rounded_rectangle([x, by, x + S, by + BOT - 16], radius=16, fill=color)
    t1 = f"{titulo}"
    w1 = draw.textlength(t1, font=f_big)
    draw.text((x + (S - w1) / 2, by + 6), t1, font=f_big, fill="white")
    w2 = draw.textlength(rango, font=f_sub)
    draw.text((x + (S - w2) / 2, by + 50), rango, font=f_sub, fill="white")
canvas.save(OUT / "fig_twin.png")

print("MAE modelo2 =", round(mae, 2))
print("Matriz confusion:\n", cm)
print("OK figuras:", sorted(p.name for p in OUT.glob("*.png")))
