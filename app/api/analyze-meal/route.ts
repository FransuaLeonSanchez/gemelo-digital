import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analyze-meal
 * Body: { imageBase64: string (sin prefijo data:), mimeType: string, mealType: string }
 *
 * Analiza la foto de un plato con Gemini y devuelve la estimación nutricional
 * en el formato que consume la app. Si Gemini falla (sin créditos, sin red,
 * clave inválida), responde { ok: false } y el cliente usa su estimación local.
 */

// gemini-2.5-flash es el modelo con cuota activa en el proyecto actual;
// si falla se intenta 2.5-flash-lite (más barato) antes de caer al mock local.
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const geminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const PROMPT = `Eres el motor de análisis nutricional de GEMA, una app peruana de
prevención del síndrome metabólico. Analiza la foto de este plato de comida.

Responde SOLO un JSON válido (sin markdown, sin explicación) con esta forma exacta:
{
  "name": "<nombre corto del plato en español peruano, ej: 'Arroz con pollo + ensalada'>",
  "carbs": <carbohidratos estimados en gramos, entero>,
  "kcal": <energía estimada en kcal, entero>,
  "load": "<carga glucémica: 'Baja' | 'Media' | 'Alta'>",
  "predictedPeak": <pico de glucosa estimado en mg/dL a los 60 min para un adulto joven con leve resistencia a la insulina (basal ~95 mg/dL), entero entre 100 y 210>,
  "confidence": <confianza de 0 a 100, entero>
}

Reglas:
- Si hay arroz blanco, papa, fideos o pan en porción grande → load "Alta".
- Plato balanceado con proteína y verdura → "Media" o "Baja" según porción de carbohidrato.
- predictedPeak: Baja → 105-125, Media → 125-150, Alta → 150-185.
- Si la imagen NO es comida, responde {"name":"No detectado","carbs":0,"kcal":0,"load":"Baja","predictedPeak":95,"confidence":0}.`;

export async function POST(req: NextRequest) {
  let body: { imageBase64?: string; mimeType?: string; mealType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !body.imageBase64) {
    return NextResponse.json({ ok: false, reason: "no-key-or-image" });
  }

  try {
    let data: any = null;
    let lastStatus = 0;

    for (const model of GEMINI_MODELS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(geminiUrl(model), {
        method: "POST",
        signal: controller.signal,
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                {
                  inline_data: {
                    mime_type: body.mimeType || "image/jpeg",
                    data: body.imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }).finally(() => clearTimeout(timeout));

      if (res.ok) {
        data = await res.json();
        break;
      }
      lastStatus = res.status;
      const err = await res.text();
      console.error(`Gemini ${model} error`, res.status, err.slice(0, 200));
    }

    if (!data) {
      return NextResponse.json({ ok: false, reason: `gemini-${lastStatus}` });
    }
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return NextResponse.json({ ok: false, reason: "empty" });

    // Gemini con responseMimeType json devuelve JSON directo; por si acaso
    // limpiamos fences de markdown.
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    const load = ["Baja", "Media", "Alta"].includes(parsed.load)
      ? parsed.load
      : "Media";

    return NextResponse.json({
      ok: true,
      source: "gemini",
      meal: {
        name: String(parsed.name ?? "Plato detectado").slice(0, 60),
        carbs: Math.max(0, Math.min(300, Math.round(Number(parsed.carbs) || 0))),
        kcal: Math.max(0, Math.min(2500, Math.round(Number(parsed.kcal) || 0))),
        load,
        predictedPeak: Math.max(
          90,
          Math.min(220, Math.round(Number(parsed.predictedPeak) || 130)),
        ),
        confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 80))),
      },
    });
  } catch (e) {
    console.error("analyze-meal failed:", e);
    return NextResponse.json({ ok: false, reason: "exception" });
  }
}
