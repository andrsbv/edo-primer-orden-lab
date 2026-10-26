import { ArrowDownRight, ArrowUpRight, Check, MoveUpRight } from "lucide-react";
import { Formula } from "./Formula";
import type { ModelKind } from "../lib/model";

export function ModelPicker({
  kind,
  onChange,
}: {
  kind: ModelKind;
  onChange: (kind: ModelKind) => void;
}) {
  return (
    <div className="model-grid">
      {(["growth", "decay"] as const).map((item) => {
        const growth = item === "growth",
          selected = kind === item;
        return (
          <button
            type="button"
            key={item}
            className={`model-card ${item} ${selected ? "selected" : ""}`}
            aria-pressed={selected}
            onClick={() => onChange(item)}
          >
            <div className="model-top">
              <span className="model-icon">
                {growth ? <ArrowUpRight /> : <ArrowDownRight />}
              </span>
              <span className="model-check">
                {selected ? <Check size={16} /> : <MoveUpRight size={16} />}
              </span>
            </div>
            <div className="model-content">
              <div>
                <h3>
                  {growth
                    ? "Crecimiento exponencial"
                    : "Decrecimiento exponencial"}
                </h3>
                <p>
                  {growth
                    ? "Cuanto más hay, más rápido crece."
                    : "Disminuye a un ritmo proporcional a lo que queda."}
                </p>
                <Formula
                  math={`\\frac{dP}{dt}=kP,\\quad k${growth ? ">" : "<"}0`}
                />
              </div>
              <svg
                className="mini-curve"
                viewBox="0 0 130 72"
                aria-hidden="true"
              >
                <path className="mini-grid" d="M7 6V65H126M7 35H126M65 6V65" />
                <path
                  className="mini-line"
                  d={
                    growth
                      ? "M8 62C65 59 95 44 119 8"
                      : "M8 8C25 48 56 61 119 63"
                  }
                />
                <circle r="4" cx="119" cy={growth ? "8" : "63"} />
              </svg>
            </div>
            <div className="model-tags">
              {growth
                ? "Bacterias · Poblaciones · Interés continuo"
                : "Radioactividad · Sustancias · Poblaciones"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
