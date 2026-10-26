import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Download, MousePointer2 } from "lucide-react";
import { format, population, type Model } from "../lib/model";
import { downloadBlob } from "../lib/download";
import { SectionTitle } from "./SectionTitle";

export function PopulationChart({
  model,
  horizon,
  progress,
  onSeek,
}: {
  model: Model;
  horizon: number;
  progress: number;
  onSeek: (value: number) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [view, setView] = useState("all");
  const [hover, setHover] = useState<number | null>(null);
  const [exportError, setExportError] = useState("");
  const gradient = useId().replace(/:/g, "");
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry.contentRect.width)),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const start = view === "last" ? horizon / 2 : 0;
  const end = view === "first" ? horizon / 2 : horizon;
  const maxP = Math.max(population(model, start), population(model, end));
  const data = useMemo(
    () =>
      Array.from({ length: 301 }, (_, i) => {
        const t = start + (end - start) * (i / 300);
        return { t, p: population(model, t) };
      }),
    [model, start, end],
  );
  const left = width < 500 ? 58 : 78,
    right = 22,
    top = 32,
    bottom = 278,
    height = 336;
  const graphWidth = width - left - right;
  const x = (t: number) => left + ((t - start) / (end - start)) * graphWidth;
  const y = (p: number) => bottom - (p / maxP / 1.12) * (bottom - top);
  const path = data
    .map(
      (point, i) =>
        `${i ? "L" : "M"}${x(point.t).toFixed(2)},${y(point.p).toFixed(2)}`,
    )
    .join(" ");
  const currentT = horizon * progress;
  const currentP = population(model, currentT);
  const inspected = hover ?? currentT;
  const inspectedP = population(model, inspected);
  const ticks = width < 500 ? 4 : 5;
  const atPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - box.left) * width) / box.width;
    return (
      start +
      Math.max(0, Math.min(1, (position - left) / graphWidth)) * (end - start)
    );
  };
  async function exportPng() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Tu navegador no permite exportar imágenes.");
      ctx.fillStyle = "#fcfdf9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#203c31";
      ctx.font = "bold 38px system-ui";
      ctx.fillText("EDO LAB · Evolución de la cantidad", 110, 90);
      ctx.font = "23px system-ui";
      ctx.fillStyle = "#5e6d65";
      ctx.fillText(
        `P(t) = ${model.p0} · exp(${model.k} · t)    |    t en ${model.unit}`,
        110,
        140,
      );
      const l = 170,
        r = 1710,
        b = 810,
        a = 220;
      const px = (t: number) => l + ((t - start) / (end - start)) * (r - l);
      const py = (p: number) => b - (p / maxP / 1.12) * (b - a);
      ctx.font = "22px system-ui";
      for (let i = 0; i <= 5; i++) {
        const p = (i / 5) * maxP;
        const t = start + (i / 5) * (end - start);
        ctx.strokeStyle = "#e2e8df";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l, py(p));
        ctx.lineTo(r, py(p));
        ctx.stroke();
        ctx.fillStyle = "#53635b";
        ctx.textAlign = "right";
        ctx.fillText(format(p, 2), l - 22, py(p) + 8);
        ctx.textAlign = "center";
        ctx.fillText(format(t, 2), px(t), b + 42);
      }
      const color = model.kind === "growth" ? "#34784d" : "#b55d33";
      ctx.beginPath();
      data.forEach((point, i) => {
        if (i === 0) ctx.moveTo(px(point.t), py(point.p));
        else ctx.lineTo(px(point.t), py(point.p));
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.stroke();
      const dot = (t: number, p: number, fill: string) => {
        if (t < start || t > end) return;
        ctx.beginPath();
        ctx.arc(px(t), py(p), 8, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      };
      dot(0, model.p0, color);
      dot(model.t1, model.p1, "#657993");
      dot(currentT, currentP, "#152c24");
      ctx.fillStyle = "#203c31";
      ctx.textAlign = "center";
      ctx.font = "26px system-ui";
      ctx.fillText(`Tiempo t (${model.unit})`, (l + r) / 2, 905);
      ctx.save();
      ctx.translate(38, (a + b) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Cantidad P(t)", 0, 0);
      ctx.restore();
      ctx.font = "20px system-ui";
      ctx.fillStyle = "#53635b";
      ctx.fillText(
        "● Curva del modelo     ● Punto observado (azul)     ● Instante de simulación (oscuro)",
        900,
        965,
      );
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error("No se pudo crear la imagen.")),
          "image/png",
        ),
      );
      downloadBlob(blob, `edo-${model.kind}-grafica.png`);
      setExportError("");
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "No se pudo exportar la gráfica.",
      );
    }
  }
  return (
    <section id="grafica" className="section-block">
      <SectionTitle
        number="06"
        title="La historia, en una curva"
        subtitle="Cantidad P(t) frente al tiempo t. Explora cada instante."
        action={
          <button className="secondary-button" onClick={exportPng}>
            <Download size={16} />
            Descargar PNG
          </button>
        }
      />
      <div className="panel chart-panel">
        <div className="chart-toolbar">
          <div className="chart-legend">
            <span>
              <i className="legend-line" />
              Modelo exponencial
            </span>
            <span>
              <i className="legend-dot observed" />
              Observación
            </span>
            <span>
              <i className="legend-dot" />
              Simulación
            </span>
          </div>
          <label className="chart-view">
            Vista
            <select
              aria-label="Ampliación de la gráfica"
              value={view}
              onChange={(e) => {
                setView(e.target.value);
                setHover(null);
              }}
            >
              <option value="all">Todo el horizonte</option>
              <option value="first">Primera mitad · 2×</option>
              <option value="last">Segunda mitad · 2×</option>
            </select>
          </label>
        </div>
        <div ref={container} className="chart-container">
          <svg
            role="img"
            aria-label={`Gráfica de ${model.kind === "growth" ? "crecimiento" : "decrecimiento"} exponencial. Eje horizontal tiempo en ${model.unit}, eje vertical cantidad.`}
            viewBox={`0 0 ${width} ${height}`}
            onPointerMove={(event) => setHover(atPointer(event))}
            onPointerLeave={() => setHover(null)}
            onPointerDown={(event) => onSeek(atPointer(event) / horizon)}
          >
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity=".18" />
                <stop
                  offset="100%"
                  stopColor="var(--accent)"
                  stopOpacity=".015"
                />
              </linearGradient>
            </defs>
            {Array.from({ length: ticks + 1 }, (_, i) => {
              const p = (maxP * i) / ticks,
                t = start + ((end - start) * i) / ticks;
              return (
                <g key={i}>
                  <line
                    className="chart-grid-line"
                    x1={left}
                    x2={width - right}
                    y1={y(p)}
                    y2={y(p)}
                  />
                  <text
                    className="axis-tick"
                    x={left - 10}
                    y={y(p) + 4}
                    textAnchor="end"
                  >
                    {format(p, 1)}
                  </text>
                  <text
                    className="axis-tick"
                    x={x(t)}
                    y={bottom + 23}
                    textAnchor="middle"
                  >
                    {format(t, 1)}
                  </text>
                </g>
              );
            })}
            <text className="axis-name" x={left} y="17">
              Cantidad P(t)
            </text>
            <text
              className="axis-name"
              x={left + graphWidth / 2}
              y={height - 5}
              textAnchor="middle"
            >
              Tiempo t ({model.unit})
            </text>
            <path
              d={`${path} L${x(end)},${bottom} L${x(start)},${bottom} Z`}
              fill={`url(#${gradient})`}
            />
            <path
              d={path}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {start === 0 && (
              <circle
                cx={x(0)}
                cy={y(model.p0)}
                r="5"
                fill="var(--surface)"
                stroke="var(--accent)"
                strokeWidth="2"
              >
                <title>Inicial: {model.p0}</title>
              </circle>
            )}
            {model.t1 >= start && model.t1 <= end && (
              <circle
                cx={x(model.t1)}
                cy={y(model.p1)}
                r="6"
                fill="#6d82a2"
                stroke="var(--surface)"
                strokeWidth="2"
              >
                <title>
                  Observación: ({model.t1}, {model.p1})
                </title>
              </circle>
            )}
            {currentT >= start && currentT <= end && (
              <g>
                <line
                  x1={x(currentT)}
                  x2={x(currentT)}
                  y1={y(currentP)}
                  y2={bottom}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  opacity=".65"
                />
                <circle
                  cx={x(currentT)}
                  cy={y(currentP)}
                  r="8"
                  fill="var(--text)"
                  stroke="var(--surface)"
                  strokeWidth="3"
                />
              </g>
            )}
            {hover !== null && (
              <g>
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={top}
                  y2={bottom}
                  stroke="var(--muted)"
                  strokeDasharray="3 4"
                />
                <circle
                  cx={x(hover)}
                  cy={y(inspectedP)}
                  r="4"
                  fill="var(--accent)"
                />
              </g>
            )}
          </svg>
        </div>
        <div className="chart-readout">
          <span>
            <MousePointer2 size={14} />
            Toca la curva o desliza el control
          </span>
          <strong>
            t = {format(inspected, 6)} {model.unit}
            <span>·</span>P(t) = {format(inspectedP, 6)}
          </strong>
        </div>
        <label className="sr-only" htmlFor="chart-time">
          Instante en la gráfica
        </label>
        <input
          id="chart-time"
          className="timeline chart-timeline"
          aria-label="Instante en la gráfica"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        {model.t1 > horizon && (
          <p className="chart-note">
            El punto observado está fuera del horizonte actual. Aumenta el
            tiempo máximo para verlo.
          </p>
        )}
        {currentT < start || currentT > end ? (
          <p className="chart-note">
            El marcador está fuera de esta ampliación. Cambia la vista o el
            instante.
          </p>
        ) : null}
        {exportError && (
          <p role="alert" className="field-error">
            {exportError}
          </p>
        )}
      </div>
      <div className="interpretation">
        <span className="interpretation-icon">
          {model.kind === "growth" ? "↗" : "↘"}
        </span>
        <div>
          <h3>
            {model.kind === "growth"
              ? "Un mismo porcentaje, cada vez más cantidad."
              : "Cada vez queda menos, y la caída se hace más lenta."}
          </h3>
          <p>
            {model.kind === "growth"
              ? "La curva crece y se vuelve más pronunciada. A mayor población, mayor incremento por unidad de tiempo. Sin límites de recursos, este modelo idealizado crece indefinidamente."
              : "La curva desciende y se aplana al acercarse a cero. Se pierde una fracción constante por unidad de tiempo, pero la disminución absoluta es cada vez menor. La cantidad sigue siendo positiva."}
          </p>
        </div>
      </div>
    </section>
  );
}
