import { useState } from "react";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { Formula } from "./Formula";
import { SectionTitle } from "./SectionTitle";
import { tex, type Model } from "../lib/model";

export function SolutionSteps({ model }: { model: Model }) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));
  const { p0, p1, t1, k, unit } = model;
  const steps = [
    {
      title: "Planteamos la ecuación diferencial",
      math: "\\frac{dP}{dt}=kP",
      text: "La rapidez con la que cambia la cantidad P es proporcional a la cantidad presente. La constante k representa esa proporcionalidad.",
    },
    {
      title: "Separamos las variables",
      math: "\\frac{1}{P}\\,dP=k\\,dt",
      text: "Dividimos entre P, que es positiva en este modelo, y multiplicamos por dt. Así, P queda a un lado y t al otro.",
    },
    {
      title: "Integramos ambos lados",
      math: "\\int \\frac{1}{P}\\,dP=\\int k\\,dt",
      text: "Aplicamos una integral a cada lado. Como k es constante respecto del tiempo, sale de la integral.",
    },
    {
      title: "Usamos la integral del logaritmo",
      math: "\\ln|P|=kt+C_1",
      text: "La primitiva de 1/P es ln|P|. Agrupamos las constantes de integración en una sola, C₁. Como P > 0, podemos escribir ln P.",
    },
    {
      title: "Despejamos la solución general",
      math: "P=e^{kt+C_1}=e^{C_1}e^{kt}=Ce^{kt},\\quad C>0",
      text: "Aplicamos la función exponencial a ambos lados para deshacer el logaritmo. Definimos una nueva constante C = exp(C₁), que es positiva.",
    },
    {
      title: "Aplicamos la condición inicial",
      math: `P(0)=Ce^0=C=P_0=${tex(p0)}`,
      extra: `P(t)=${tex(p0)}e^{kt}`,
      text: "En t = 0, la exponencial vale 1. Por eso, C coincide exactamente con la cantidad inicial P₀.",
    },
    {
      title: "Sustituimos la observación",
      math: `P(t_1)=P_0e^{kt_1}`,
      extra: `${tex(p1)}=${tex(p0)}e^{k(${tex(t1)})}`,
      text: `Al cabo de ${t1} ${unit}, la cantidad observada es ${p1}. Sustituimos ese par de datos para encontrar k.`,
    },
    {
      title: "Despejamos la constante k",
      math: "\\frac{P(t_1)}{P_0}=e^{kt_1}",
      extra: `\\ln\\!\\left(\\frac{P(t_1)}{P_0}\\right)=kt_1 \\quad\\Longrightarrow\\quad k=\\frac{\\ln(P(t_1)/P_0)}{t_1}`,
      final: `k=\\frac{\\ln\\!\\left(\\frac{${tex(p1)}}{${tex(p0)}}\\right)}{${tex(t1)}}\\approx ${tex(k, 10)}\\;\\text{${unit}}^{-1}`,
      text: "Primero dividimos entre P₀. Luego aplicamos el logaritmo natural a ambos lados, usando ln(eˣ) = x. Finalmente dividimos entre t₁, que es mayor que cero.",
    },
    {
      title: "Escribimos la solución particular",
      math: `P(t)=${tex(p0)}\\exp\\!\\left(\\frac{\\ln\\!\\left(\\frac{${tex(p1)}}{${tex(p0)}}\\right)}{${tex(t1)}}t\\right)`,
      extra: `P(t)\\approx ${tex(p0)}e^{(${tex(k, 10)})t}`,
      text: "Esta es la función del ejercicio. La primera expresión conserva la forma exacta de los datos; la segunda usa k redondeada solo para mostrarla.",
    },
    {
      title: "Interpretamos el resultado",
      math: `k${k > 0 ? ">" : "<"}0\\quad\\Longrightarrow\\quad P(t)\\;\\text{${k > 0 ? "crece" : "disminuye"}}`,
      text: `k se mide en ${unit}⁻¹ para que kt no tenga unidades. ${k > 0 ? "La cantidad se multiplica por eᵏ en cada unidad de tiempo; un mismo porcentaje genera incrementos absolutos cada vez mayores." : "La cantidad se multiplica por eᵏ en cada unidad de tiempo, con 0 < eᵏ < 1. Se acerca a cero sin alcanzarlo en un tiempo finito."} El modelo supone una tasa proporcional constante y condiciones ideales.`,
    },
  ];
  return (
    <section id="desarrollo" className="section-block">
      <SectionTitle
        number="03"
        title="Entiende cada paso"
        subtitle="De la ecuación diferencial a tu solución particular."
        action={
          <button
            className="secondary-button"
            onClick={() =>
              setOpen(
                open.size === 10 ? new Set() : new Set(steps.map((_, i) => i)),
              )
            }
          >
            <ChevronsUpDown size={16} />
            {open.size === 10
              ? "Contraer solución"
              : "Mostrar toda la solución"}
          </button>
        }
      />
      <div className="steps-list">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={`solution-step ${open.has(i) ? "expanded" : ""}`}
          >
            <button
              className="step-toggle"
              aria-expanded={open.has(i)}
              aria-controls={`explanation-${i}`}
              onClick={() =>
                setOpen((previous) => {
                  const next = new Set(previous);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
            >
              <span className="step-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step.title}</span>
              <ChevronDown size={17} />
            </button>
            <div
              className="step-body"
              id={`explanation-${i}`}
              hidden={!open.has(i)}
            >
              <p>{step.text}</p>
              <Formula math={step.math} block />
              {step.extra && <Formula math={step.extra} block />}
              {step.final && (
                <div className="step-highlight">
                  <Formula math={step.final} block />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
