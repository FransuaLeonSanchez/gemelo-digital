"""Demo de inferencia con los modelos entrenados de GEMA.

Simula exactamente lo que hará el backend cuando la app envíe datos reales:
  1. El resumen semanal del usuario → clase de riesgo (+ probabilidades).
  2. Una comida que está por comer → pico de glucosa estimado a 60 min.

Uso:
    python predecir.py            # corre el caso de ejemplo (Fransua)
"""

from pathlib import Path

import joblib
import pandas as pd

AQUI = Path(__file__).parent
rf = joblib.load(AQUI / "modelos" / "clasificador_riesgo_rf.joblib")
gbm = joblib.load(AQUI / "modelos" / "predictor_pico_gbm.joblib")

# ── Caso 1: clasificación de riesgo del usuario de la app (Fransua, 22) ──────
fransua_semana = pd.DataFrame([{
    "cv_glucemico_pct": 24.5,        # variabilidad glucémica 7 días
    "tiempo_en_rango_pct": 68.0,     # como muestra la app
    "pico_postprandial_prom": 158.0,
    "sueno_promedio_h": 6.1,
    "pasos_promedio_dia": 6420,
    "hrv_promedio_ms": 42,
    "indice_tyg": 8.30,              # ln(158/2)+ln(102/2)
    "cintura_cm": 88,
}])

riesgo = rf.predict(fransua_semana)[0]
probas = dict(zip(rf.classes_, rf.predict_proba(fransua_semana)[0]))
print("── Clasificación de riesgo (semana de Fransua) ──")
print(f"  Riesgo: {str(riesgo).upper()}")
for clase in ["bajo", "moderado", "alto"]:
    pct = probas.get(clase, 0) * 100
    print(f"    {clase:9s} {pct:5.1f} %  {'█' * int(pct / 3)}")

# ── Caso 2: predicción del pico para el almuerzo que está por registrar ─────
print("\n── Predicción de pico glucémico (almuerzo: arroz con pollo) ──")
base = {
    "glucosa_basal_mgdl": 95, "carbohidratos_g": 78, "indice_glucemico": 72,
    "carga_glucemica": 78 * 72 / 100, "caminata_post_min": 0,
    "sueno_anoche_h": 5.7, "hrv_ms": 42, "hora_dia": 13,
}
escenarios = {
    "Tal cual (sin caminar)": base,
    "Caminando 25 min después": {**base, "caminata_post_min": 25},
    "Mismo plato pero con quinua (IG 53)": {
        **base, "indice_glucemico": 53, "carga_glucemica": 78 * 53 / 100,
    },
    "Quinua + caminata 25 min": {
        **base, "indice_glucemico": 53, "carga_glucemica": 78 * 53 / 100,
        "caminata_post_min": 25,
    },
}
for nombre, esc in escenarios.items():
    pico = gbm.predict(pd.DataFrame([esc]))[0]
    flag = "⚠ pico alto" if pico > 140 else "✓ en rango"
    print(f"  {nombre:38s} → {pico:5.0f} mg/dL  {flag}")
