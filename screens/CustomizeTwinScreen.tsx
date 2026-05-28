"use client";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
  setAppearance: (a: TwinAppearance) => void;
  userPhoto?: string | null;
}

const SKIN_SWATCHES = ["#F4D5B8", "#E8B98A", "#D29A6C", "#B07A4F", "#8B5A36"];

export function CustomizeTwinScreen({ onNav, appearance, setAppearance, userPhoto }: Props) {
  const set = <K extends keyof TwinAppearance>(k: K, v: TwinAppearance[K]) =>
    setAppearance({ ...appearance, [k]: v });

  return (
    <div className="flex flex-col h-full px-5 pb-5">
      <TopBar title="Personaliza tu gemelo" onBack={() => onNav("createTwin")} />

      <div className="flex items-center justify-center gap-2 mt-1 mb-2">
        {userPhoto && (
          <>
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userPhoto}
                alt="tu foto"
                className="w-16 h-16 rounded-full object-cover border-2 border-line"
              />
              <p className="text-hint text-[9px] uppercase tracking-wider font-bold mt-1">
                Tu foto
              </p>
            </div>
            <span className="text-sub text-xl">→</span>
          </>
        )}
        <div className="text-center">
          <TwinAvatar mood="neutral" size={150} appearance={appearance} />
          <p className="text-brand-blue text-[9px] uppercase tracking-wider font-bold -mt-2">
            Tu gemelo
          </p>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto scroll-hide flex-1">
        <Group label="Tono de piel">
          <div className="flex gap-2">
            {SKIN_SWATCHES.map((c, i) => (
              <button
                key={c}
                onClick={() => set("skinTone", i)}
                className="w-9 h-9 rounded-full transition-transform active:scale-95"
                style={{
                  backgroundColor: c,
                  outline: appearance.skinTone === i ? "2px solid #4DA3FF" : "2px solid transparent",
                  outlineOffset: 2,
                }}
                aria-label={`piel ${i + 1}`}
              />
            ))}
          </div>
        </Group>

        <Group label="Peinado">
          <Chips
            options={["corto", "largo", "recogido", "rizado"] as const}
            value={appearance.hair}
            onChange={(v) => set("hair", v)}
          />
        </Group>

        <Group label="Accesorios">
          <Chips
            options={["sin lentes", "con lentes"] as const}
            value={appearance.glasses ? "con lentes" : "sin lentes"}
            onChange={(v) => set("glasses", v === "con lentes")}
          />
        </Group>

        <Group label="Presentación">
          <Chips
            options={["femenina", "masculina", "neutra"] as const}
            value={appearance.presentation}
            onChange={(v) => set("presentation", v)}
          />
        </Group>
      </div>

      <div className="pt-3">
        <Button onClick={() => onNav("processing")}>Continuar</Button>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sub text-[12px] uppercase tracking-wider font-bold mb-2">{label}</p>
      {children}
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${
              active
                ? "bg-brand-blue text-bg"
                : "bg-card2 text-sub border border-line"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
