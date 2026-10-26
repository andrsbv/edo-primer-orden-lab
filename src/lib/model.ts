export type ModelKind = "growth" | "decay";
export type TimeUnit = "s" | "min" | "h" | "d";
export const units: Record<TimeUnit, string> = {
  s: "segundos",
  min: "minutos",
  h: "horas",
  d: "días",
};
export interface InputData {
  p0: string;
  t1: string;
  p1: string;
  unit: TimeUnit;
}
export interface Model {
  kind: ModelKind;
  p0: number;
  t1: number;
  p1: number;
  unit: TimeUnit;
  k: number;
}
export interface Point {
  t: number;
  p: number;
  delta: number;
  percent: number;
}
export type InputErrors = Partial<
  Record<"p0" | "t1" | "p1" | "general", string>
>;
export const MIN_VALUE = 1e-100;
export const MAX_VALUE = 1e100;
const LOW_LOG = Math.log(MIN_VALUE);
const HIGH_LOG = Math.log(MAX_VALUE);

export function parseNumber(raw: string): number {
  const text = raw.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return NaN;
  return Number(text);
}

export function solve(
  input: InputData,
  kind: ModelKind,
): { model?: Model; errors: InputErrors } {
  const errors: InputErrors = {};
  const p0 = parseNumber(input.p0),
    t1 = parseNumber(input.t1),
    p1 = parseNumber(input.p1);
  for (const [key, value] of Object.entries({ p0, t1, p1 })) {
    if (!Number.isFinite(value))
      errors[key as keyof InputErrors] = "Introduce un número válido y finito.";
    else if (value <= 0)
      errors[key as keyof InputErrors] = "El valor debe ser mayor que cero.";
    else if (value < MIN_VALUE || value > MAX_VALUE)
      errors[key as keyof InputErrors] = "Usa un valor entre 10⁻¹⁰⁰ y 10¹⁰⁰.";
  }
  if (Object.keys(errors).length) return { errors };
  if (p1 === p0)
    return {
      errors: {
        p1: "P(t₁) = P₀ implica k = 0: la cantidad es constante. Elige datos con crecimiento o decrecimiento estricto.",
      },
    };
  if (kind === "growth" && p1 < p0)
    return { errors: { p1: "Para crecimiento, P(t₁) debe ser mayor que P₀." } };
  if (kind === "decay" && p1 > p0)
    return {
      errors: { p1: "Para decrecimiento, P(t₁) debe ser menor que P₀." },
    };
  const k = rate(p0, p1, t1);
  if (!Number.isFinite(k) || k === 0)
    return {
      errors: {
        general:
          "La diferencia es demasiado pequeña para representarse con precisión. Usa datos menos extremos.",
      },
    };
  return { model: { kind, p0, p1, t1, k, unit: input.unit }, errors: {} };
}

export function rate(p0: number, p1: number, t1: number): number {
  if (![p0, p1, t1].every((v) => Number.isFinite(v) && v > 0))
    throw new RangeError("Datos inválidos para calcular k.");
  const relative = (p1 - p0) / p0;
  const logarithm =
    Math.abs(relative) < 0.5
      ? Math.log1p(relative)
      : Math.log(p1) - Math.log(p0);
  const result = logarithm / t1;
  if (!Number.isFinite(result))
    throw new RangeError("k excede la precisión disponible.");
  return result;
}

export function population(model: Pick<Model, "p0" | "k">, t: number): number {
  if (
    !Number.isFinite(t) ||
    t < 0 ||
    !Number.isFinite(model.k) ||
    !Number.isFinite(model.p0) ||
    model.p0 <= 0
  )
    throw new RangeError("Parámetros inválidos.");
  if (t === 0) return model.p0;
  const exponent = Math.log(model.p0) + model.k * t;
  if (
    !Number.isFinite(exponent) ||
    exponent > HIGH_LOG + 1e-10 ||
    exponent < LOW_LOG - 1e-10
  )
    throw new RangeError(
      "Ese horizonte supera el rango numérico seguro (10⁻¹⁰⁰ a 10¹⁰⁰). Reduce el tiempo máximo.",
    );
  return Math.exp(Math.min(HIGH_LOG, Math.max(LOW_LOG, exponent)));
}

export function maximumTime(model: Model): number {
  const boundary = model.k > 0 ? HIGH_LOG : LOW_LOG;
  return Math.max(
    model.t1,
    Math.min(MAX_VALUE, (boundary - Math.log(model.p0)) / model.k),
  );
}
export function defaultHorizon(model: Model): number {
  return Math.min(model.t1 * 2, maximumTime(model));
}

export function makePoints(
  model: Model,
  horizon: number,
  intervals: number,
): Point[] {
  if (!Number.isFinite(horizon) || horizon <= 0 || horizon > MAX_VALUE)
    throw new RangeError(
      "El tiempo máximo debe ser positivo y no superar 10¹⁰⁰.",
    );
  if (!Number.isInteger(intervals) || intervals < 1 || intervals > 500)
    throw new RangeError("Usa entre 1 y 500 intervalos.");
  population(model, horizon);
  return Array.from({ length: intervals + 1 }, (_, i) => {
    const t = horizon * (i / intervals);
    const p = population(model, t);
    return {
      t,
      p,
      delta: p - model.p0,
      percent: ((p - model.p0) / model.p0) * 100,
    };
  });
}

export function format(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "Fuera de rango";
  if (
    value !== 0 &&
    (Math.abs(value) < 10 ** -decimals || Math.abs(value) >= 1e9)
  )
    return value.toExponential(Math.min(decimals, 6)).replace(".", ",");
  return new Intl.NumberFormat("es-EC", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(Object.is(value, -0) ? 0 : value);
}
export function tex(value: number, precision?: number): string {
  if (value === 0) return "0";
  const number = precision
    ? Number(value.toPrecision(precision)).toString()
    : value.toString();
  if (number.includes("e")) {
    const [base, power] = number.split("e");
    return `${base}\\times 10^{${Number(power)}}`;
  }
  return number;
}
export function toCsv(points: Point[], unit: TimeUnit): string {
  // Raw numeric precision and dot decimals preserve data independently of display rounding.
  return (
    "\uFEFF" +
    [
      `tiempo_${unit},P(t),variacion,porcentaje_variacion`,
      ...points.map((p) => [p.t, p.p, p.delta, p.percent].join(",")),
    ].join("\r\n")
  );
}
