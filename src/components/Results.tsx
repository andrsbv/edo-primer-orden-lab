import {
  ArrowDownRight,
  ArrowUpRight,
  CircleCheck,
  Lightbulb,
} from "lucide-react";
import { Formula } from "./Formula";
import { format, tex, type Model, type ModelKind } from "../lib/model";

export function Results({
  model,
  kind,
}: {
  model: Model | null;
  kind: ModelKind;
}) {
  if (!model)
    return (
      <div className="empty-result">
        <div className="empty-visual">
          <svg viewBox="0 0 380 160" aria-hidden="true">
            <defs>
              <pattern
                id="dots"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <circle r="1" fill="currentColor" cx="1" cy="1" />
              </pattern>
            </defs>
            <rect width="380" height="160" fill="url(#dots)" opacity=".17" />
            <path
              d="M28 135H355M42 148V15"
              fill="none"
              stroke="currentColor"
              opacity=".3"
            />
            <path
              d={
                kind === "growth"
                  ? "M42 128C196 128 289 102 333 24"
                  : "M42 24C70 105 180 128 333 128"
              }
              className="intro-curve"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <text x="350" y="153" fill="currentColor" fontSize="12">
              t
            </text>
            <text x="19" y="22" fill="currentColor" fontSize="12">
              P
            </text>
          </svg>
        </div>
        <span className="eyebrow">DE LOS DATOS AL MODELO</span>
        <h3>
          Un cambio. Una ecuación.
          <br />
          Muchas posibilidades.
        </h3>
        <p>
          Con una cantidad inicial y una observación, encuentra la ley que
          describe cómo evoluciona tu sistema.
        </p>
        <div className="empty-equation">
          <Formula math={"P(t)=P_0 e^{kt}"} />
        </div>
        <div className="hint">
          <Lightbulb size={18} />
          <span>
            Usa el ejemplo o introduce tus valores y pulsa{" "}
            <strong>Resolver ecuación</strong>.
          </span>
        </div>
      </div>
    );
  const growth = model.k > 0;
  const characteristic = Math.log(2) / Math.abs(model.k);
  return (
    <div className="results-panel" aria-live="polite">
      <div className="result-status">
        <CircleCheck size={16} /> Modelo resuelto
        <span>{growth ? "Crecimiento" : "Decrecimiento"}</span>
      </div>
      <span className="eyebrow">CONSTANTE DE PROPORCIONALIDAD</span>
      <div className="rate-result">
        <Formula math={`k \\approx ${tex(model.k, 10)}`} />
        <span>{model.unit}⁻¹</span>
      </div>
      <p className="result-interpretation">
        {growth
          ? "La cantidad aumenta: su tasa de cambio es positiva y proporcional a la población."
          : "La cantidad disminuye: su tasa de cambio es negativa y proporcional a lo que queda."}
      </p>
      <div className="particular">
        <span className="eyebrow">TU SOLUCIÓN PARTICULAR</span>
        <Formula
          math={`P(t)\\approx ${tex(model.p0)}\\,e^{(${tex(model.k, 10)})t}`}
          block
        />
        <small>
          El coeficiente mostrado está redondeado. Los cálculos usan toda la
          precisión.
        </small>
      </div>
      <div className="result-facts">
        <div>
          <span>Cantidad inicial</span>
          <strong>{format(model.p0)}</strong>
          <small>t = 0 {model.unit}</small>
        </div>
        <div>
          <span>Cantidad observada</span>
          <strong>{format(model.p1)}</strong>
          <small>
            t = {format(model.t1)} {model.unit}
          </small>
        </div>
        <div>
          <span>{growth ? "Tiempo de duplicación" : "Vida media"}</span>
          <strong>
            {format(characteristic)} <small>{model.unit}</small>
          </strong>
          <small>
            {growth ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{" "}
            {growth ? "P → 2P" : "P → P/2"}
          </small>
        </div>
      </div>
      <div className="result-general">
        <div>
          <span>Ecuación diferencial</span>
          <Formula math={`\\frac{dP}{dt}=kP`} />
        </div>
        <div>
          <span>Solución general positiva</span>
          <Formula math={"P(t)=Ce^{kt},\\ C>0"} />
        </div>
      </div>
    </div>
  );
}
