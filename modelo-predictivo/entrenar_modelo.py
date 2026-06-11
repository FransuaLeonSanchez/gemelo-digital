"""Entrena los dos modelos predictivos de GEMA y guarda los artefactos.

Modelo 1 — Clasificador de riesgo metabólico (Random Forest)
    8 features de resumen semanal → riesgo {bajo, moderado, alto}
    Meta de la guía técnica: accuracy > 85 %.

Modelo 2 — Predictor del pico glucémico postprandial (Gradient Boosting)
    8 features del evento de comida → pico de glucosa a 60 min (mg/dL)
    Meta de la guía técnica: MAE < 15 mg/dL (clínicamente aceptable).
    Mismo enfoque del paper Zeevi et al. 2015 (Cell) para PPGR; en producción
    se reemplaza por el LSTM descrito en la guía cuando haya series CGM reales.

Uso:
    python entrenar_modelo.py
Salidas:
    modelos/clasificador_riesgo_rf.joblib
    modelos/predictor_pico_gbm.joblib
    modelos/metrics.json
"""

import json
from pathlib import Path

import joblib
import sklearn
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    r2_score,
)
from sklearn.model_selection import cross_val_score, train_test_split

from datos_sinteticos import generar_comidas, generar_poblacion_riesgo

AQUI = Path(__file__).parent
OUT = AQUI / "modelos"
OUT.mkdir(exist_ok=True)

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

metrics: dict = {}

# ─────────────────────────────────────────────────────────────────────────────
# Modelo 1 — Random Forest: clasificación de riesgo
# ─────────────────────────────────────────────────────────────────────────────
print("═" * 60)
print("MODELO 1 · Clasificador de riesgo metabólico (Random Forest)")
print("═" * 60)

df_r = generar_poblacion_riesgo(6000)
Xr, yr = df_r[FEATURES_RIESGO], df_r["riesgo"]
Xr_tr, Xr_te, yr_tr, yr_te = train_test_split(
    Xr, yr, test_size=0.2, stratify=yr, random_state=7,
)

rf = RandomForestClassifier(
    n_estimators=200,          # según la guía técnica
    max_depth=12,
    min_samples_leaf=5,
    class_weight="balanced",
    random_state=7,
    n_jobs=-1,
)
rf.fit(Xr_tr, yr_tr)

pred = rf.predict(Xr_te)
acc = accuracy_score(yr_te, pred)
cv5 = cross_val_score(rf, Xr, yr, cv=5, scoring="accuracy")
print(f"Accuracy test : {acc:.3f}  (meta de la guía: > 0.85)")
print(f"CV 5-fold     : {cv5.mean():.3f} ± {cv5.std():.3f}")
print()
print(classification_report(yr_te, pred))
print("Matriz de confusión (filas=real, cols=predicho):")
labels = ["bajo", "moderado", "alto"]
print(confusion_matrix(yr_te, pred, labels=labels))

importancias = sorted(
    zip(FEATURES_RIESGO, rf.feature_importances_), key=lambda t: -t[1],
)
print("\nImportancia de variables:")
for f, imp in importancias:
    print(f"  {f:26s} {imp:.3f} {'█' * int(imp * 60)}")

f1s = f1_score(yr_te, pred, labels=labels, average=None)
metrics["clasificador_riesgo"] = {
    "algoritmo": "RandomForestClassifier(n_estimators=200)",
    "n_train": len(Xr_tr),
    "n_test": len(Xr_te),
    "accuracy_test": round(acc, 4),
    "cv5_mean": round(cv5.mean(), 4),
    "cv5_std": round(cv5.std(), 4),
    "f1_por_clase": {c: round(float(f), 3) for c, f in zip(labels, f1s)},
    "matriz_confusion": confusion_matrix(yr_te, pred, labels=labels).tolist(),
    "meta_guia": "> 0.85",
    "cumple_meta": bool(acc > 0.85),
    "features": FEATURES_RIESGO,
    "importancias": {f: round(float(i), 4) for f, i in importancias},
}
joblib.dump(rf, OUT / "clasificador_riesgo_rf.joblib")

# ─────────────────────────────────────────────────────────────────────────────
# Modelo 2 — Gradient Boosting: pico glucémico a 60 min
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("MODELO 2 · Predictor de pico glucémico postprandial (GBM)")
print("═" * 60)

df_c = generar_comidas(9000)
Xc, yc = df_c[FEATURES_PICO], df_c["pico_60min_mgdl"]
Xc_tr, Xc_te, yc_tr, yc_te = train_test_split(Xc, yc, test_size=0.2, random_state=7)

gbm = GradientBoostingRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=4,
    subsample=0.85,
    random_state=7,
)
gbm.fit(Xc_tr, yc_tr)

pred_c = gbm.predict(Xc_te)
mae = mean_absolute_error(yc_te, pred_c)
r2 = r2_score(yc_te, pred_c)
print(f"MAE test : {mae:.1f} mg/dL  (meta de la guía: < 15 mg/dL)")
print(f"R²  test : {r2:.3f}")

# Ejemplo de uso: almuerzo limeño típico
ejemplo = {
    "glucosa_basal_mgdl": 95, "carbohidratos_g": 78, "indice_glucemico": 72,
    "carga_glucemica": 78 * 72 / 100, "caminata_post_min": 0,
    "sueno_anoche_h": 5.7, "hrv_ms": 42, "hora_dia": 13,
}
import pandas as pd
pico = gbm.predict(pd.DataFrame([ejemplo]))[0]
ejemplo_camina = {**ejemplo, "caminata_post_min": 25}
pico_camina = gbm.predict(pd.DataFrame([ejemplo_camina]))[0]
print(f"\nEjemplo — arroz con pollo (78 g carbos, IG 72, durmió 5.7 h):")
print(f"  sin caminar:        pico estimado ≈ {pico:.0f} mg/dL")
print(f"  caminando 25 min:   pico estimado ≈ {pico_camina:.0f} mg/dL")
print(f"  beneficio caminata: {pico - pico_camina:.0f} mg/dL menos")

metrics["predictor_pico"] = {
    "algoritmo": "GradientBoostingRegressor(n_estimators=400)",
    "n_train": len(Xc_tr),
    "n_test": len(Xc_te),
    "mae_test_mgdl": round(float(mae), 2),
    "r2_test": round(float(r2), 4),
    "meta_guia": "< 15 mg/dL",
    "cumple_meta": bool(mae < 15),
    "features": FEATURES_PICO,
    "ejemplo_arroz_con_pollo": {
        "sin_caminar": round(float(pico), 0),
        "caminando_25min": round(float(pico_camina), 0),
    },
}
metrics["entorno"] = {"sklearn": sklearn.__version__, "seed_datos": 42, "seed_split": 7}
joblib.dump(gbm, OUT / "predictor_pico_gbm.joblib")

with open(OUT / "metrics.json", "w") as f:
    json.dump(metrics, f, indent=2, ensure_ascii=False)

print("\n✔ Modelos guardados en modelo-predictivo/modelos/")
print("  - clasificador_riesgo_rf.joblib")
print("  - predictor_pico_gbm.joblib")
print("  - metrics.json")
