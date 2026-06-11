import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEMA — Tu gemelo metabólico",
  description:
    "GEMA crea una copia digital de tu metabolismo para detectar el riesgo de síndrome metabólico antes de que aparezcan los síntomas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
