"""Genera los gráficos de evaluación de los modelos de GEMA.

Carga los .joblib entrenados, reconstruye el MISMO test set (mismos seeds que
entrenar_modelo.py) y produce PNGs con el tema oscuro de la app:

    presentacion/img/confusion_riesgo.png      matriz de confusión (Modelo 1)
    presentacion/img/importancias_riesgo.png   importancia de variables (Modelo 1)
    presentacion/img/pred_vs_real_pico.png     predicho vs real (Modelo 2)
    presentacion/img/escenarios_whatif.png     escenarios arroz con pollo (Modelo 2)

Uso:
    .venv/bin/python generar_graficos.py
"""

from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from datos_sinteticos import generar_comidas, generar_poblacion_riesgo

# Mismas listas que entrenar_modelo.py (no se importa para no re-entrenar)
FEATURES_RIESGO = [
    "cv_glucemico_pct", "tiempo_en_rango_pct", "pico_postprandial_prom",
    "sueno_promedio_h", "pasos_promedio_dia", "hrv_promedio_ms",
    "indice_tyg", "cintura_cm",
]
FEATURES_PICO = [
    "glucosa_basal_mgdl", "carbohidratos_g", "indice_glucemico",
    "carga_glucemica", "caminata_post_min", "sueno_anoche_h",
    "hrv_ms", "hora_dia",
]

AQUI = Path(__file__).parent
IMG = AQUI / "presentacion" / "img"
IMG.mkdir(parents=True, exist_ok=True)

# Paleta GEMA
BG = "#0B0E14"; CARD = "#131A2C"; TXT = "#EAF0FA"; SUB = "#8A95AC"; LINE = "#3A4358"
GREEN = "#1FD0A3"; BLUE = "#4DA3FF"; PURPLE = "#A78BFA"; AMBER = "#FFB23E"; RED = "#FF5E6C"

plt.rcParams.update({
    "figure.facecolor": BG, "axes.facecolor": CARD, "savefig.facecolor": BG,
    "text.color": TXT, "axes.labelcolor": TXT, "axes.edgecolor": LINE,
    "xtick.color": SUB, "ytick.color": SUB, "font.size": 12,
    "axes.titlesize": 14, "axes.titleweight": "bold", "font.family": "DejaVu Sans",
})

rf = joblib.load(AQUI / "modelos" / "clasificador_riesgo_rf.joblib")
gbm = joblib.load(AQUI / "modelos" / "predictor_pico_gbm.joblib")

# ── Modelo 1: matriz de confusión ────────────────────────────────────────────
df_r = generar_poblacion_riesgo(6000)
Xr, yr = df_r[FEATURES_RIESGO], df_r["riesgo"]
_, Xr_te, _, yr_te = train_test_split(Xr, yr, test_size=0.2, stratify=yr, random_state=7)
pred_r = rf.predict(Xr_te)

labels = ["bajo", "moderado", "alto"]
from sklearn.metrics import confusion_matrix
cm = confusion_matrix(yr_te, pred_r, labels=labels)

fig, ax = plt.subplots(figsize=(6.6, 4.7), dpi=200)
im = ax.imshow(cm, cmap="GnBu")
ax.set_xticks(range(3), [l.capitalize() for l in labels])
ax.set_yticks(range(3), [l.capitalize() for l in labels])
ax.set_xlabel("Lo que dijo el modelo", fontweight="bold")
ax.set_ylabel("Riesgo real", fontweight="bold")
ax.set_title("Aciertos y errores en 1 200 casos de prueba", fontsize=13)
for i in range(3):
    for j in range(3):
        color = TXT if cm[i, j] > cm.max() * 0.5 else "#0B0E14"
        ax.text(j, i, f"{cm[i, j]}", ha="center", va="center",
                fontsize=16, fontweight="bold", color=color)
for spine in ax.spines.values():
    spine.set_color(LINE)
fig.text(0.5, 0.015, "Nunca confunde riesgo bajo con alto: si se equivoca, es entre niveles vecinos",
         ha="center", fontsize=9.5, color=GREEN, fontweight="bold")
fig.tight_layout(rect=[0, 0.05, 1, 1])
fig.savefig(IMG / "confusion_riesgo.png")
plt.close(fig)

# ── Modelo 1: importancia de variables ───────────────────────────────────────
NOMBRES = {
    "tiempo_en_rango_pct": "Tiempo con glucosa saludable (sensor)",
    "cv_glucemico_pct": "Variabilidad de la glucosa (sensor)",
    "pico_postprandial_prom": "Pico de glucosa tras comer (sensor)",
    "indice_tyg": "Índice TyG (análisis de sangre)",
    "cintura_cm": "Medida de cintura (formulario)",
    "pasos_promedio_dia": "Pasos por día (smartwatch)",
    "sueno_promedio_h": "Horas de sueño (smartwatch)",
    "hrv_promedio_ms": "Variabilidad del ritmo cardíaco (smartwatch)",
}
imp = sorted(zip(FEATURES_RIESGO, rf.feature_importances_), key=lambda t: t[1])
nombres = [NOMBRES[f] for f, _ in imp]
vals = [v * 100 for _, v in imp]
colores = [GREEN if v >= 17 else BLUE if v >= 8 else PURPLE for v in vals]

fig, ax = plt.subplots(figsize=(8.4, 4.7), dpi=200)
bars = ax.barh(nombres, vals, color=colores, height=0.62)
for b, v in zip(bars, vals):
    ax.text(v + 0.5, b.get_y() + b.get_height() / 2, f"{v:.1f} %",
            va="center", fontsize=10.5, color=TXT, fontweight="bold")
ax.set_xlim(0, 34)
ax.set_xlabel("Peso en la decisión (%)", fontweight="bold")
ax.set_title("Qué datos pesan más al evaluar el riesgo", fontsize=13)
ax.grid(axis="x", color=LINE, alpha=0.35)
fig.tight_layout()
fig.savefig(IMG / "importancias_riesgo.png")
plt.close(fig)

# ── Modelo 2: predicho vs real ───────────────────────────────────────────────
df_c = generar_comidas(9000)
Xc, yc = df_c[FEATURES_PICO], df_c["pico_60min_mgdl"]
_, Xc_te, _, yc_te = train_test_split(Xc, yc, test_size=0.2, random_state=7)
pred_c = gbm.predict(Xc_te)
mae = np.mean(np.abs(pred_c - yc_te))

fig, ax = plt.subplots(figsize=(5.8, 4.9), dpi=200)
lims = [95, 265]
ax.fill_between(lims, [l - 15 for l in lims], [l + 15 for l in lims],
                color=GREEN, alpha=0.10, label="margen clínico aceptado: ±15 mg/dL")
ax.scatter(yc_te, pred_c, s=9, alpha=0.30, color=BLUE, edgecolors="none")
ax.plot(lims, lims, "--", color=SUB, lw=1.4)
ax.set_xlim(lims); ax.set_ylim(lims)
ax.set_xlabel("Pico que ocurrió (mg/dL)", fontweight="bold")
ax.set_ylabel("Pico que predijo el modelo (mg/dL)", fontweight="bold")
ax.set_title("Predicción vs realidad · 1 800 comidas", fontsize=13)
ax.legend(loc="upper left", facecolor=CARD, edgecolor=LINE, labelcolor=TXT, fontsize=10)
ax.text(0.97, 0.06, f"Error promedio: ±{mae:.1f} mg/dL\n(meta clínica: ±15)",
        transform=ax.transAxes, ha="right", fontsize=13, fontweight="bold",
        color=GREEN, bbox=dict(boxstyle="round,pad=0.45", fc=CARD, ec=GREEN, lw=1.4))
ax.grid(color=LINE, alpha=0.3)
fig.tight_layout()
fig.savefig(IMG / "pred_vs_real_pico.png")
plt.close(fig)

# ── Modelo 2: escenarios what-if (arroz con pollo) ───────────────────────────
base = {
    "glucosa_basal_mgdl": 95, "carbohidratos_g": 78, "indice_glucemico": 72,
    "carga_glucemica": 78 * 72 / 100, "caminata_post_min": 0,
    "sueno_anoche_h": 5.7, "hrv_ms": 42, "hora_dia": 13,
}
escenarios = [
    ("Arroz con pollo, sin caminar", base),
    ("+ caminata 25 min", {**base, "caminata_post_min": 25}),
    ("Con quinua (IG 53)", {**base, "indice_glucemico": 53, "carga_glucemica": 78 * 53 / 100}),
    ("Quinua + caminata 25 min", {**base, "indice_glucemico": 53,
                                  "carga_glucemica": 78 * 53 / 100, "caminata_post_min": 25}),
]
nombres_e = [n for n, _ in escenarios][::-1]
picos = [float(gbm.predict(pd.DataFrame([e]))[0]) for _, e in escenarios][::-1]
colores_e = [GREEN if p <= 140 else AMBER if p <= 155 else RED for p in picos]

fig, ax = plt.subplots(figsize=(7.6, 4.2), dpi=200)
bars = ax.barh(nombres_e, picos, color=colores_e, height=0.58)
for b, p in zip(bars, picos):
    ax.text(p + 2, b.get_y() + b.get_height() / 2, f"{p:.0f}",
            va="center", fontsize=12, fontweight="bold", color=TXT)
ax.axvline(140, color=RED, lw=1.6, ls="--")
ax.text(141.5, 3.3, "límite de pico alto (140)", color=RED, fontsize=9.5, fontweight="bold")
ax.set_xlim(90, 185)
ax.set_xlabel("Pico de glucosa previsto a 60 min (mg/dL)", fontweight="bold")
ax.set_title("El mismo almuerzo, cuatro decisiones distintas", fontsize=13)
ax.grid(axis="x", color=LINE, alpha=0.3)
fig.text(0.5, 0.015, "Quinua + caminata: el pico baja 32 puntos — de aquí salen los consejos de la app",
         ha="center", fontsize=9.5, color=GREEN, fontweight="bold")
fig.tight_layout(rect=[0, 0.05, 1, 1])
fig.savefig(IMG / "escenarios_whatif.png")
plt.close(fig)

print(f"✔ 4 gráficos guardados en {IMG}")
