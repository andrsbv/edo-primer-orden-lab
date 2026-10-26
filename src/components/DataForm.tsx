import { ArrowRight, FlaskConical, RotateCcw, Info } from "lucide-react";
import type { InputData, InputErrors, ModelKind, TimeUnit } from "../lib/model";
import { units } from "../lib/model";

export function DataForm({
  input,
  errors,
  kind,
  onChange,
  onSolve,
  onExample,
  onReset,
}: {
  input: InputData;
  errors: InputErrors;
  kind: ModelKind;
  onChange: (input: InputData) => void;
  onSolve: () => void;
  onExample: () => void;
  onReset: () => void;
}) {
  const fields = [
    {
      id: "p0",
      label: "Cantidad inicial",
      symbol: "P₀",
      help: "Cantidad que existe cuando t = 0.",
      placeholder: "100",
    },
    {
      id: "t1",
      label: "Tiempo de observación",
      symbol: "t₁",
      help: "Tiempo transcurrido hasta medir la cantidad.",
      placeholder: "5",
    },
    {
      id: "p1",
      label: "Cantidad observada",
      symbol: "P(t₁)",
      help: "Cantidad medida en el instante t₁.",
      placeholder: kind === "growth" ? "200" : "50",
    },
  ] as const;
  return (
    <form
      className="data-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSolve();
      }}
    >
      <div className="panel-heading">
        <div>
          <span className="eyebrow">CONDICIONES INICIALES</span>
          <h3>Introduce tus datos</h3>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onReset}
          aria-label="Reiniciar ejercicio"
          title="Reiniciar ejercicio"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      {fields.map((f) => (
        <div className="field" key={f.id}>
          <label htmlFor={f.id}>
            {f.label}
            <span title={f.help}>
              <Info size={14} aria-label={f.help} />
            </span>
          </label>
          <div className={`input-shell ${errors[f.id] ? "invalid" : ""}`}>
            <span className="input-symbol">{f.symbol}</span>
            <input
              id={f.id}
              inputMode="decimal"
              type="text"
              autoComplete="off"
              maxLength={130}
              placeholder={f.placeholder}
              value={input[f.id]}
              aria-invalid={Boolean(errors[f.id])}
              aria-describedby={`${f.id}-help ${errors[f.id] ? `${f.id}-error` : ""}`}
              onChange={(e) => onChange({ ...input, [f.id]: e.target.value })}
            />
            {f.id === "t1" && <span className="input-unit">{input.unit}</span>}
          </div>
          <small id={`${f.id}-help`}>{f.help}</small>
          {errors[f.id] && (
            <p role="alert" id={`${f.id}-error`} className="field-error">
              {errors[f.id]}
            </p>
          )}
        </div>
      ))}
      <div className="field">
        <label htmlFor="unit">Unidad de tiempo</label>
        <select
          id="unit"
          value={input.unit}
          onChange={(e) =>
            onChange({ ...input, unit: e.target.value as TimeUnit })
          }
        >
          {Object.entries(units).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <small>
          Cambiar la unidad reinterpreta los datos; no los convierte.
        </small>
      </div>
      {errors.general && (
        <p className="field-error" role="alert">
          {errors.general}
        </p>
      )}
      <button type="submit" className="primary-button">
        Resolver ecuación
        <ArrowRight size={18} />
      </button>
      <button
        type="button"
        className="text-button example-button"
        onClick={onExample}
      >
        <FlaskConical size={16} />
        Cargar ejemplo de {kind === "growth" ? "crecimiento" : "decrecimiento"}
      </button>
    </form>
  );
}
