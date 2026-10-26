import { useMemo, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import {
  defaultHorizon,
  format,
  makePoints,
  parseNumber,
  toCsv,
  type Model,
} from "../lib/model";
import { downloadBlob } from "../lib/download";
import { SectionTitle } from "./SectionTitle";

export function ValueTable({
  model,
  horizon,
  onHorizon,
}: {
  model: Model;
  horizon: number;
  onHorizon: (value: number) => void;
}) {
  const [time, setTime] = useState(String(horizon));
  const [count, setCount] = useState("10");
  const [precision, setPrecision] = useState("2");
  const [settings, setSettings] = useState({ count: 10, precision: 2 });
  const [error, setError] = useState("");
  const points = useMemo(
    () => makePoints(model, horizon, settings.count),
    [model, horizon, settings.count],
  );
  return (
    <section id="tabla" className="section-block">
      <SectionTitle
        number="04"
        title="Ponle números al cambio"
        subtitle="Una misma función, evaluada en distintos instantes."
        action={
          <button
            className="secondary-button"
            onClick={() =>
              downloadBlob(
                new Blob([toCsv(points, model.unit)], {
                  type: "text/csv;charset=utf-8",
                }),
                `edo-${model.kind}-tabla.csv`,
              )
            }
          >
            <Download size={16} />
            Descargar CSV
          </button>
        }
      />
      <div className="panel">
        {defaultHorizon(model) < model.t1 * 2 && (
          <p className="chart-note settings-error">
            El horizonte inicial se limita al rango numérico seguro; puedes
            ajustarlo sin superar ese límite.
          </p>
        )}
        <form
          className="table-settings"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const end = parseNumber(time),
              intervals = parseNumber(count),
              decimals = parseNumber(precision);
            try {
              if (
                !Number.isInteger(intervals) ||
                intervals < 1 ||
                intervals > 100
              )
                throw new Error("Elige entre 1 y 100 intervalos enteros.");
              if (!Number.isInteger(decimals) || decimals < 0 || decimals > 8)
                throw new Error("Elige entre 0 y 8 decimales.");
              makePoints(model, end, intervals);
              setSettings({ count: intervals, precision: decimals });
              onHorizon(end);
              setError("");
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Revisa los valores.",
              );
            }
          }}
        >
          <div className="settings-label">
            <SlidersHorizontal size={18} />
            <span>Explora el horizonte</span>
          </div>
          <label>
            Tiempo máximo ({model.unit})
            <input
              aria-label="Tiempo máximo"
              inputMode="decimal"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label>
            Intervalos
            <input
              aria-label="Número de intervalos"
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </label>
          <label>
            Decimales
            <select
              aria-label="Precisión decimal"
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
            >
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <button className="secondary-button" type="submit">
            Aplicar
          </button>
        </form>
        {error && (
          <p className="field-error settings-error" role="alert">
            {error}
          </p>
        )}
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Tabla de valores desplazable"
        >
          <table>
            <caption className="sr-only">
              Valores de P(t), variación y porcentaje respecto a la cantidad
              inicial.
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  Tiempo t <span>({model.unit})</span>
                </th>
                <th scope="col">Cantidad P(t)</th>
                <th scope="col">Variación ΔP</th>
                <th scope="col">Variación %</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point, i) => (
                <tr key={i}>
                  <td>
                    {format(point.t, settings.precision)}
                    {i === 0 && <span className="table-tag">Inicial</span>}
                  </td>
                  <td>{format(point.p, settings.precision)}</td>
                  <td>
                    {point.delta > 0 ? "+" : ""}
                    {format(point.delta, settings.precision)}
                  </td>
                  <td>
                    <span
                      className={`percent-badge ${i === 0 ? "neutral" : ""}`}
                    >
                      {point.percent > 0 ? "+" : ""}
                      {format(point.percent, settings.precision)} %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-note">
          {points.length} puntos · ΔP = P(t) − P₀ · % = 100 × ΔP / P₀. El CSV
          conserva la precisión numérica.
        </div>
      </div>
    </section>
  );
}
