"""Generador de datos sintéticos fisiológicamente plausibles para GEMA.

Mientras no tengamos datos reales de usuarios (CGM + wearable), entrenamos con
una población sintética cuyas distribuciones replican lo publicado:

  - NHANES (USA) y ENDES (Perú): distribuciones de cintura, glucosa en ayunas,
    triglicéridos en adultos 20-45 años.
  - Zeevi et al. 2015 (Cell): la respuesta glucémica postprandial (PPGR)
    depende de la comida (carbohidratos, carga glucémica) Y de la persona
    (glucosa basal, actividad, sueño) — el mismo plato produce picos distintos
    en personas distintas.
  - Reynolds et al. 2016 (Diabetologia): caminar después de comer reduce el
    pico postprandial hasta ~20 %.
  - Spiegel et al. 1999 (Lancet): dormir < 7 h aumenta la resistencia a la
    insulina al día siguiente (~30 %).
  - Simental-Mendía et al. 2008: índice TyG como proxy de resistencia a la
    insulina. TyG = ln(TG/2) + ln(glucosa_ayunas/2).

El generador introduce correlaciones realistas (poco sueño → más variabilidad
glucémica; pocos pasos → más cintura) y ruido individual, para que el modelo
aprenda relaciones reales y no artefactos.
"""

import numpy as np
import pandas as pd

RNG_SEED = 42


# ─────────────────────────────────────────────────────────────────────────────
# Dataset 1 — Clasificación de riesgo metabólico (bajo / moderado / alto)
# ─────────────────────────────────────────────────────────────────────────────

def generar_poblacion_riesgo(n: int = 6000, seed: int = RNG_SEED) -> pd.DataFrame:
    """Población sintética de adultos 20-45 años de Lima Metropolitana.

    Cada fila = el resumen de 7 días de un usuario (lo que el Random Forest
    consumirá en producción según la guía técnica del proyecto).
    """
    rng = np.random.default_rng(seed)

    # Factor latente de "carga metabólica" por persona (0 = óptimo, 1 = muy mal)
    latente = rng.beta(2.2, 2.8, n)

    # Hábitos — correlacionados con el factor latente + ruido individual
    sueno_h = np.clip(8.2 - 2.8 * latente + rng.normal(0, 0.7, n), 3.5, 10)
    pasos = np.clip(11000 - 7500 * latente + rng.normal(0, 1500, n), 800, 20000)
    hrv_ms = np.clip(72 - 38 * latente + rng.normal(0, 8, n), 12, 110)

    # Antropometría / laboratorio
    cintura_cm = np.clip(74 + 30 * latente + rng.normal(0, 5, n), 60, 130)
    glucosa_ayunas = np.clip(82 + 38 * latente + rng.normal(0, 6, n), 65, 160)
    trigliceridos = np.clip(90 + 130 * latente + rng.normal(0, 25, n), 40, 400)
    tyg = np.log(trigliceridos / 2) + np.log(glucosa_ayunas / 2)

    # Indicadores CGM de 7 días (derivados de hábitos + ruido)
    cv_glucemico = np.clip(
        12 + 18 * latente + (7 - np.minimum(sueno_h, 7)) * 1.5 + rng.normal(0, 2.5, n),
        6, 48,
    )
    tiempo_en_rango = np.clip(
        96 - 42 * latente - (cv_glucemico - 12) * 0.8 + rng.normal(0, 4, n),
        20, 100,
    )
    pico_postprandial = np.clip(
        118 + 62 * latente - (pasos / 1000) * 0.9 + rng.normal(0, 8, n),
        100, 240,
    )

    df = pd.DataFrame({
        "cv_glucemico_pct": cv_glucemico.round(1),
        "tiempo_en_rango_pct": tiempo_en_rango.round(1),
        "pico_postprandial_prom": pico_postprandial.round(0),
        "sueno_promedio_h": sueno_h.round(1),
        "pasos_promedio_dia": pasos.round(0),
        "hrv_promedio_ms": hrv_ms.round(0),
        "indice_tyg": tyg.round(2),
        "cintura_cm": cintura_cm.round(0),
    })

    # Etiqueta: score continuo tipo MetS-Z simplificado → 3 clases
    score = (
        0.25 * (df.cv_glucemico_pct - 12) / 18
        + 0.20 * (100 - df.tiempo_en_rango_pct) / 50
        + 0.15 * (df.pico_postprandial_prom - 118) / 60
        + 0.10 * (7.5 - df.sueno_promedio_h).clip(0) / 3
        + 0.10 * (9000 - df.pasos_promedio_dia).clip(0) / 7000
        + 0.10 * (df.indice_tyg - 8.0) / 1.2
        + 0.10 * (df.cintura_cm - 80) / 30
        + np.random.default_rng(seed + 1).normal(0, 0.05, n)  # ruido de etiqueta
    )
    df["riesgo"] = pd.cut(
        score, bins=[-np.inf, 0.28, 0.55, np.inf],
        labels=["bajo", "moderado", "alto"],
    )
    return df


# ─────────────────────────────────────────────────────────────────────────────
# Dataset 2 — Predicción del pico glucémico postprandial (regresión)
# ─────────────────────────────────────────────────────────────────────────────

def generar_comidas(n: int = 9000, seed: int = RNG_SEED) -> pd.DataFrame:
    """Eventos de comida con el pico de glucosa observado a 60 min.

    En producción este modelo será un LSTM con la serie CGM de 12 h
    (según la guía técnica); este dataset entrena el baseline tabular
    (Gradient Boosting), el mismo enfoque del paper de Zeevi 2015.
    """
    rng = np.random.default_rng(seed)

    glucosa_basal = np.clip(rng.normal(95, 12, n), 70, 150)
    carbos_g = np.clip(rng.gamma(4.5, 14, n), 5, 220)            # típico 30-90 g
    indice_glucemico = np.clip(rng.normal(62, 16, n), 25, 105)   # IG del plato
    caminata_post_min = np.clip(rng.exponential(12, n), 0, 60)
    sueno_anoche_h = np.clip(rng.normal(6.6, 1.2, n), 3.5, 10)
    hrv_ms = np.clip(rng.normal(48, 16, n), 12, 110)
    hora_dia = rng.integers(6, 23, n)

    # Carga glucémica = carbos * IG / 100 (definición estándar)
    carga_glucemica = carbos_g * indice_glucemico / 100

    # Modelo generador del pico (fisiología publicada + interacciones):
    deficit_sueno = np.clip(7.0 - sueno_anoche_h, 0, None)
    estres = np.clip((55 - hrv_ms) / 40, 0, None)

    pico_60min = (
        glucosa_basal
        + 0.95 * carga_glucemica                       # efecto principal comida
        + 0.10 * carbos_g                              # carbos absolutos
        - 0.55 * caminata_post_min                     # Reynolds 2016
        * (1 + 0.3 * (carga_glucemica > 35))           #   camina más → más efecto si comida pesada
        + 6.5 * deficit_sueno                          # Spiegel 1999
        + 9.0 * estres                                 # cortisol ↑ glucosa
        + 4.0 * ((hora_dia >= 20) | (hora_dia <= 7))   # peor tolerancia nocturna
        + rng.normal(0, 7.5, n)                        # variabilidad individual
    )
    pico_60min = np.clip(pico_60min, glucosa_basal - 5, 280)

    return pd.DataFrame({
        "glucosa_basal_mgdl": glucosa_basal.round(0),
        "carbohidratos_g": carbos_g.round(0),
        "indice_glucemico": indice_glucemico.round(0),
        "carga_glucemica": carga_glucemica.round(1),
        "caminata_post_min": caminata_post_min.round(0),
        "sueno_anoche_h": sueno_anoche_h.round(1),
        "hrv_ms": hrv_ms.round(0),
        "hora_dia": hora_dia,
        "pico_60min_mgdl": pico_60min.round(0),
    })


if __name__ == "__main__":
    r = generar_poblacion_riesgo(8)
    c = generar_comidas(8)
    print(r.to_string(index=False))
    print()
    print(c.to_string(index=False))
