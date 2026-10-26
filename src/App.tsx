import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CodeXml,
  Moon,
  Sun,
  FlaskConical,
} from "lucide-react";
import { DataForm } from "./components/DataForm";
import { ModelPicker } from "./components/ModelPicker";
import { Results } from "./components/Results";
import { SolutionSteps } from "./components/SolutionSteps";
import { ValueTable } from "./components/ValueTable";
import { Bacteria } from "./components/Bacteria";
import { PopulationChart } from "./components/PopulationChart";
import { SectionTitle } from "./components/SectionTitle";
import { Formula } from "./components/Formula";
import {
  defaultHorizon,
  solve,
  type InputData,
  type InputErrors,
  type Model,
  type ModelKind,
} from "./lib/model";

function ModelWorkspace({ model }: { model: Model }) {
  const [horizon, setHorizon] = useState(() => defaultHorizon(model));
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <SolutionSteps model={model} />
      <ValueTable
        model={model}
        horizon={horizon}
        onHorizon={(value) => {
          setHorizon(value);
          setProgress(0);
          setPlaying(false);
        }}
      />
      <Bacteria
        model={model}
        horizon={horizon}
        progress={progress}
        onProgress={setProgress}
        playing={playing}
        onPlaying={setPlaying}
      />
      <PopulationChart
        model={model}
        horizon={horizon}
        progress={progress}
        onSeek={(value) => {
          setPlaying(false);
          setProgress(value);
        }}
      />
    </>
  );
}

const initialData: InputData = { p0: "100", t1: "5", p1: "200", unit: "h" };

export default function App() {
  const [kind, setKind] = useState<ModelKind>("growth");
  const [input, setInput] = useState<InputData>(initialData);
  const [errors, setErrors] = useState<InputErrors>({});
  const [model, setModel] = useState<Model | null>(null);
  const [solutionId, setSolutionId] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      // Oscuro por defecto. Respetar una preferencia clara elegida previamente.
      return localStorage.getItem("edo-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const changeTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("edo-theme", next);
    } catch {
      /* Theme remains usable when browser storage is disabled. */
    }
  };
  const invalidate = () => {
    setModel(null);
    setErrors({});
  };
  const calculate = () => {
    const result = solve(input, kind);
    setErrors(result.errors);
    if (result.model) {
      setModel(result.model);
      setSolutionId((value) => value + 1);
    } else {
      setModel(null);
      const first = Object.keys(result.errors)[0];
      requestAnimationFrame(() => document.getElementById(first)?.focus());
    }
  };
  return (
    <div className={`app theme-${theme} mode-${kind}`}>
      <a className="skip-link" href="#contenido">
        Saltar al laboratorio
      </a>
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark brand-mark-logo">
            <img className="brand-logo" src="/ecotec-logo.svg" alt="Logo de ECOTEC" />
          </span>
          <span className="brand-stack">
            <strong>EDO<span>lab</span></strong>
            <span className="brand-label">ECOTEC</span>
          </span>
          <span className="brand-divider" />
          <span className="brand-subtitle">LABORATORIO INTERACTIVO DE ECUACIONES DIFERENCIALES</span>
        </a>
        <nav aria-label="Navegación principal">
          <a className="nav-active" href="#laboratorio">
            Laboratorio
          </a>
          <a href="#guia">
            Guía del modelo
            <ArrowUpRight size={14} />
          </a>
        </nav>
        <button
          className="theme-toggle icon-button"
          aria-label={
            theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"
          }
          onClick={changeTheme}
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </header>
      <main id="contenido">
        <section className="hero">
          <div className="hero-main">
            <div className="eyebrow hero-eyebrow">
              <span className="green-dot" />
              UN LABORATORIO ECOTEC DE GRANDES IDEAS
            </div>
            <h1>
              Lo que cambia,
              <br />
              se puede <span>entender.</span>
            </h1>
            <p>
              Aprende, resuelve y visualiza ecuaciones diferenciales de primer
              orden. De los datos a la vida, paso a paso.
            </p>
            <div className="hero-tags">
              <span>
                <Check size={14} />
                Resolución guiada
              </span>
              <span>
                <Check size={14} />
                Simulación en tiempo real
              </span>
              <span>
                <Check size={14} />
                100% interactivo
              </span>
            </div>
          </div>
          <div className="hero-note">
            <span className="note-top">
              EL LENGUAJE DEL CAMBIO<span>01 / EDO</span>
            </span>
            <Formula math={"\\frac{dP}{dt}=kP"} block />
            <p>
              La velocidad de cambio
              <br />
              depende de lo que hay.
            </p>
            <div className="note-bottom">
              <span className="tiny-bacteria" />
              <span>OBSERVAR. MODELAR. COMPRENDER.</span>
            </div>
          </div>
        </section>
        <div className="lab-heading" id="laboratorio">
          <div>
            <span className="eyebrow">TU ESPACIO DE EXPLORACIÓN</span>
            <h2>Crecimiento y decrecimiento exponencial</h2>
          </div>
          <span className="lab-badge">
            <FlaskConical size={15} />
            Laboratorio 01
          </span>
        </div>
        <div className="progress-nav" aria-label="Etapas del ejercicio">
          {[
            ["01", "Modelo", "#modelo"],
            ["02", "Datos", "#datos"],
            ["03", "Desarrollo", "#desarrollo"],
            ["04", "Tabla", "#tabla"],
            ["05", "Simulación", "#simulacion"],
            ["06", "Gráfica", "#grafica"],
          ].map(([num, title, href], i) =>
            i < 2 || model ? (
              <a
                key={num}
                href={href}
                className={i < 2 || model ? "available" : ""}
              >
                <span>{num}</span>
                {title}
              </a>
            ) : (
              <span className="stage-disabled" key={num}>
                <span>{num}</span>
                {title}
              </span>
            ),
          )}
        </div>
        <section id="modelo" className="model-section">
          <SectionTitle
            number="01"
            title="¿Qué quieres explorar?"
            subtitle="Elige el comportamiento de tu sistema."
          />
          <ModelPicker
            kind={kind}
            onChange={(next) => {
              if (next !== kind) {
                setKind(next);
                invalidate();
              }
            }}
          />
        </section>
        <section id="datos" className="section-block">
          <SectionTitle
            number="02"
            title="Construye tu modelo"
            subtitle="Tres datos son suficientes para encontrar la constante k."
          />
          <div className="workspace-grid">
            <div className="panel">
              <DataForm
                input={input}
                errors={errors}
                kind={kind}
                onChange={(next) => {
                  setInput(next);
                  invalidate();
                }}
                onSolve={calculate}
                onExample={() => {
                  setInput({
                    p0: "100",
                    p1: kind === "growth" ? "200" : "50",
                    t1: "5",
                    unit: "h",
                  });
                  invalidate();
                }}
                onReset={() => {
                  setInput({ p0: "", p1: "", t1: "", unit: "h" });
                  invalidate();
                }}
              />
            </div>
            <div className="panel output-panel">
              <Results model={model} kind={kind} />
            </div>
          </div>
          {model && (
            <div className="solution-ready">
              <Check size={16} />
              Tu modelo está listo. Sigue abajo para ver el desarrollo, la tabla
              y la simulación.
              <a href="#desarrollo">
                Ver solución
                <ArrowUpRight size={15} />
              </a>
            </div>
          )}
        </section>
        {model && <ModelWorkspace key={solutionId} model={model} />}
        <section id="guia" className="guide">
          <div>
            <span className="eyebrow">
              <BookOpen size={15} />
              ANTES DE GENERALIZAR
            </span>
            <h2>
              Un modelo sencillo.
              <br />
              Una idea poderosa.
            </h2>
          </div>
          <div className="guide-content">
            <p>
              En un modelo exponencial, el cambio es proporcional a la cantidad
              actual. La constante <strong>k</strong> mantiene el mismo valor
              durante todo el intervalo.
            </p>
            <details>
              <summary>¿Dónde aparece en la vida real?</summary>
              <p>
                El crecimiento describe bacterias con recursos abundantes,
                poblaciones idealizadas e interés compuesto continuo. El
                decrecimiento puede describir desintegración radiactiva,
                eliminación de sustancias y reducción de una población
                bacteriana bajo condiciones controladas.
              </p>
            </details>
            <details>
              <summary>¿Qué supone este modelo?</summary>
              <p>
                Supone una cantidad positiva, una tasa proporcional constante y
                condiciones estables. No incorpora límites de recursos,
                competencia, migración ni efectos aleatorios. Para poblaciones
                con capacidad de carga, se necesita otro modelo, como el
                logístico.
              </p>
            </details>
            <details>
              <summary>¿Qué significan k y e?</summary>
              <p>
                k es la tasa de cambio relativa continua, expresada en unidades
                de tiempo inversas. No es exactamente el porcentaje discreto por
                intervalo: ese porcentaje es 100(eᵏ − 1) para una unidad de
                tiempo. e ≈ 2,71828 es la base del logaritmo natural.
              </p>
            </details>
            <details>
              <summary>¿Y si la cantidad no cambia?</summary>
              <p>
                Si P(t₁) = P₀, entonces k = 0 y P(t) = P₀. Es una solución
                constante. Este laboratorio pide crecimiento o decrecimiento
                estricto y te avisa cuando tus datos describen ese caso.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand footer-brand" href="#">
          <span className="brand-mark brand-mark-logo footer-logo">
            <img className="brand-logo" src="/ecotec-logo.svg" alt="Logo de ECOTEC" />
          </span>
          <span className="brand-stack">
            <strong>EDO<span>lab</span></strong>
            <span className="brand-label">ECOTEC</span>
          </span>
        </a>
        <div className="footer-credit">
          <strong>Desarrollado por Erick Castro</strong>
        </div>
        <p>Hecho para aprender, experimentar y descubrir.</p>
        <a
          href="https://github.com/andrsbv/edo-primer-orden-lab"
          target="_blank"
          rel="noreferrer"
        >
          <CodeXml size={16} />
          Código del proyecto
          <ArrowUpRight size={14} />
        </a>
        <span>ECUACIONES DIFERENCIALES · PRIMER ORDEN</span>
      </footer>
    </div>
  );
}
