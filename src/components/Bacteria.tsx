import { useEffect, useState, type CSSProperties } from "react";
import { Pause, Play, RotateCcw, Microscope } from "lucide-react";
import { format, population, type Model } from "../lib/model";
import { SectionTitle } from "./SectionTitle";

const CELLS = Array.from({ length: 96 }, (_, i) => {
  const radius = Math.sqrt((i + 0.5) / 96) * 40;
  const angle = i * 2.399963229728653;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
    angle: ((i * 137.5) % 180) - 90,
    delay: (i % 7) / 3,
  };
});

export function Bacteria({
  model,
  horizon,
  progress,
  onProgress,
  playing,
  onPlaying: setPlaying,
}: {
  model: Model;
  horizon: number;
  progress: number;
  onProgress: (value: number) => void;
  playing: boolean;
  onPlaying: (value: boolean) => void;
}) {
  const [speed, setSpeed] = useState(1);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let frame: number;
    let previous = performance.now();
    let position = progress;
    const tick = (now: number) => {
      position = Math.min(
        1,
        position + (Math.min(now - previous, 100) * speed) / 16000,
      );
      previous = now;
      onProgress(position);
      if (position < 1) frame = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Progress is read once at playback start. Seeking pauses playback before changing it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed, horizon, onProgress, setPlaying]);
  const t = horizon * progress;
  const p = population(model, t);
  const maxP = Math.max(model.p0, population(model, horizon));
  const visible = Math.max(0, Math.min(CELLS.length, (p / maxP) * CELLS.length));
  return (
    <section id="simulacion" className="section-block">
      <SectionTitle
        number="05"
        title="Observa el modelo en acción"
        subtitle="La evolución matemática cobra vida en la placa de cultivo."
      />
      <div className={`simulation-panel ${reduced ? "reduced-motion" : ""}`}>
        <div className="petri-area">
          <div className="simulation-label">
            <Microscope size={16} />
            <span>VISTA MICROSCÓPICA</span>
            <span className="live-dot" />
          </div>
          <div
            className="petri-dish"
            data-testid="petri-dish"
            role="img"
            aria-label={`Placa circular con ${Math.ceil(visible)} de 96 puntos visibles, que representan ${format(p)} unidades en t = ${format(t)} ${model.unit}`}
          >
            <div className="petri-inner">
              {CELLS.map((cell, i) => (
                <div
                  key={i}
                  className={`bacterium ${i < visible ? "alive" : ""}`}
                  style={
                    {
                      left: `${cell.x}%`,
                      top: `${cell.y}%`,
                      "--rotation": `${cell.angle}deg`,
                      "--delay": `${cell.delay}s`,
                      opacity: Math.max(0, Math.min(1, visible - i)),
                    } as CSSProperties
                  }
                >
                  <span />
                  <span />
                </div>
              ))}
            </div>
            <span className="dish-cross top" />
            <span className="dish-cross bottom" />
          </div>
          <span className="petri-caption">
            Cultivo idealizado · Escala visual proporcional
          </span>
        </div>
        <div className="simulation-info">
          <span className="eyebrow">
            {model.kind === "growth"
              ? "LA VIDA SE MULTIPLICA"
              : "LA POBLACIÓN DISMINUYE"}
          </span>
          <h3>
            {model.kind === "growth"
              ? "Cada instante cuenta."
              : "Menos, poco a poco."}
          </h3>
          <p>
            {model.kind === "growth"
              ? "La división celular ilustra un crecimiento proporcional a la población presente."
              : "La desaparición gradual ilustra una pérdida proporcional a la cantidad presente."}
          </p>
          <div className="sim-metrics">
            <div>
              <span>Tiempo actual</span>
              <strong data-testid="simulation-time">
                {format(t)} <small>{model.unit}</small>
              </strong>
            </div>
            <div>
              <span>Cantidad P(t)</span>
              <strong data-testid="simulation-population">{format(p)}</strong>
            </div>
          </div>
          <label className="timeline-label" htmlFor="timeline">
            Explorar el tiempo
            <span>
              {format(horizon)} {model.unit}
            </span>
          </label>
          <input
            className="timeline"
            type="range"
            id="timeline"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            aria-valuetext={`${format(t)} ${model.unit}, población ${format(p)}`}
            onChange={(e) => {
              setPlaying(false);
              onProgress(Number(e.target.value));
            }}
          />
          <div className="playback-controls">
            <button
              className="primary-button play-button"
              onClick={() => {
                if (!playing && progress >= 1) onProgress(0);
                setPlaying(!playing);
              }}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}{" "}
              {playing ? "Pausar" : "Reproducir"}
            </button>
            <button
              className="icon-button"
              aria-label="Reiniciar animación"
              onClick={() => {
                setPlaying(false);
                onProgress(0);
              }}
            >
              <RotateCcw size={18} />
            </button>
            <label className="speed-label">
              Velocidad
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                aria-label="Velocidad de animación"
              >
                <option value="0.5">0,5×</option>
                <option value="1">1×</option>
                <option value="2">2×</option>
                <option value="4">4×</option>
              </select>
            </label>
          </div>
          <p className="simulation-note">
            Se dibujan como máximo 96 bacterias. Una bacteria representa
            aproximadamente {format(maxP / 96)} unidades; el contador sigue la
            ecuación, sin redondear a individuos.
          </p>
          {reduced && (
            <small>
              Movimiento reducido activo: los datos siguen cambiando, sin
              movimiento ornamental.
            </small>
          )}
        </div>
      </div>
    </section>
  );
}
