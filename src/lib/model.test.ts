import { describe, expect, it } from "vitest";
import {
  defaultHorizon,
  format,
  makePoints,
  maximumTime,
  parseNumber,
  population,
  rate,
  solve,
  tex,
  toCsv,
  type InputData,
  type Model,
} from "./model";

const input: InputData = { p0: "100", p1: "200", t1: "5", unit: "h" };
const growth = solve(input, "growth").model!;
const decay = solve({ ...input, p1: "50" }, "decay").model!;

describe("Modelos exponenciales y condiciones iniciales", () => {
  it("calcula k positivo y el crecimiento esperado", () => {
    expect(growth.k).toBeCloseTo(0.13862943611198905, 13);
    expect(population(growth, 5)).toBeCloseTo(200, 10);
    expect(population(growth, 10)).toBeCloseTo(400, 10);
  });
  it("calcula k negativo y la vida media esperada", () => {
    expect(decay.k).toBeCloseTo(-0.13862943611198905, 13);
    expect(population(decay, 5)).toBeCloseTo(50, 10);
    expect(population(decay, 10)).toBeCloseTo(25, 10);
    expect(Math.log(2) / Math.abs(decay.k)).toBeCloseTo(5, 12);
  });
  it("conserva P(0) exactamente y reproduce la observación", () => {
    for (const model of [growth, decay]) {
      expect(population(model, 0)).toBe(model.p0);
      expect(population(model, model.t1)).toBeCloseTo(model.p1, 10);
    }
  });
  it("soporta el caso constante en el motor y lo explica en la selección estricta", () => {
    expect(rate(100, 100, 5)).toBe(0);
    expect(population({ p0: 100, k: 0 }, 100)).toBeCloseTo(100, 12);
    expect(solve({ ...input, p1: "100" }, "growth").errors.p1).toContain(
      "k = 0",
    );
    expect(solve({ ...input, p1: "100" }, "decay").model).toBeUndefined();
  });
  it("interpreta la unidad de tiempo sin conversiones silenciosas", () => {
    expect(solve({ ...input, unit: "d" }, "growth").model?.unit).toBe("d");
    expect(solve({ ...input, unit: "d" }, "growth").model?.k).toBe(growth.k);
  });
});

describe("Entradas inválidas", () => {
  it.each([
    "",
    " ",
    "NaN",
    "Infinity",
    "-Infinity",
    "0x10",
    "1/2",
    "1.2.3",
    "200x",
    "1e999",
  ])("rechaza %j", (value) => {
    expect(solve({ ...input, p0: value }, "growth").model).toBeUndefined();
    expect(solve({ ...input, p0: value }, "growth").errors.p0).toBeTruthy();
  });
  it.each(["p0", "p1", "t1"] as const)(
    "rechaza cero, negativos y valores fuera de rango en %s",
    (field) => {
      for (const value of ["0", "-1", "1e-101", "1e101"])
        expect(
          solve({ ...input, [field]: value }, "growth").errors[field],
        ).toBeTruthy();
    },
  );
  it("detecta datos incompatibles sin cambiarlos", () => {
    const original = { ...input };
    expect(solve(original, "decay").errors.p1).toContain("menor");
    expect(original).toEqual(input);
    expect(solve({ ...input, p1: "50" }, "growth").errors.p1).toContain(
      "mayor",
    );
  });
  it("admite coma decimal y notación científica sin ejecutar expresiones", () => {
    expect(parseNumber(" 2,5 ")).toBe(2.5);
    expect(parseNumber("1e2")).toBe(100);
    expect(Number.isNaN(parseNumber("2*3"))).toBe(true);
  });
  it("protege las funciones ante parámetros inválidos", () => {
    expect(() => rate(0, 100, 1)).toThrow();
    expect(() => rate(1, 2, 0)).toThrow();
    expect(() => population(growth, -1)).toThrow();
    expect(() => population(growth, Infinity)).toThrow();
    expect(() => population({ p0: -1, k: 2 }, 1)).toThrow();
  });
});

describe("Coherencia de tabla, curva y exportación", () => {
  it("genera once puntos desde cero hasta 2t₁", () => {
    const points = makePoints(growth, defaultHorizon(growth), 10);
    expect(points).toHaveLength(11);
    expect(points[0]).toEqual({ t: 0, p: 100, delta: 0, percent: 0 });
    expect(points[10].t).toBe(10);
    expect(points[10].p).toBeCloseTo(400, 10);
    expect(points[10].percent).toBeCloseTo(300, 10);
  });
  it("coincide con puntos teóricos conocidos en ambos sentidos", () => {
    const model = solve(
      { p0: "8", p1: "16", t1: "3", unit: "min" },
      "growth",
    ).model!;
    const table = makePoints(model, 12, 4);
    table.forEach((point, i) => {
      expect(point.p).toBeCloseTo(8 * 2 ** i, 11);
      expect(point.p).toBe(population(model, point.t));
    });
    makePoints(decay, 10, 2).forEach((point, i) =>
      expect(point.p).toBeCloseTo(100 / 2 ** i, 11),
    );
  });
  it("exporta CSV con unidades y precisión sin formateo regional", () => {
    const csv = toCsv(makePoints(decay, 10, 2), "h");
    expect(
      csv.startsWith("\uFEFFtiempo_h,P(t),variacion,porcentaje_variacion"),
    ).toBe(true);
    const cells = csv.split("\r\n")[3].split(",").map(Number);
    expect(cells[0]).toBe(10);
    expect(cells[1]).toBeCloseTo(25, 10);
    expect(cells[2]).toBeCloseTo(-75, 10);
    expect(cells[3]).toBeCloseTo(-75, 10);
  });
  it.each([0, -1, NaN, Infinity])("rechaza horizonte %s", (horizon) =>
    expect(() => makePoints(growth, horizon, 10)).toThrow(),
  );
  it.each([0, 501, 1.5, NaN])("rechaza intervalos %s", (intervals) =>
    expect(() => makePoints(growth, 10, intervals)).toThrow(),
  );
});

describe("Estabilidad numérica", () => {
  it.each(["growth", "decay"] as const)("controla extremos para %s", (kind) => {
    const values =
      kind === "growth" ? ["1e-100", "1e100"] : ["1e100", "1e-100"];
    const model = solve(
      { p0: values[0], p1: values[1], t1: "1e-100", unit: "s" },
      kind,
    ).model!;
    expect(Number.isFinite(model.k)).toBe(true);
    const points = makePoints(model, defaultHorizon(model), 10);
    for (const point of points)
      expect(Object.values(point).every(Number.isFinite)).toBe(true);
    expect(population(model, model.t1) / model.p1).toBeCloseTo(1, 10);
  });
  it("rechaza el desbordamiento y el subdesbordamiento de manera explícita", () => {
    expect(() => population(growth, 100000)).toThrow(/rango numérico/);
    expect(() => population(decay, 100000)).toThrow(/rango numérico/);
    expect(() => makePoints(growth, Infinity, 10)).toThrow();
  });
  it("evita perder diferencias pequeñas por restar logaritmos", () => {
    const p1 = 100.00000000000001;
    const result = solve({ ...input, p1: String(p1) }, "growth");
    expect(result.model?.k).toBeGreaterThan(0);
    expect(result.model?.k).toBe(Math.log1p((p1 - 100) / 100) / 5);
  });
  it("respeta la frontera numérica al elegir el horizonte", () => {
    const model = solve(
      { p0: "1e99", p1: "1e100", t1: "5", unit: "h" },
      "growth",
    ).model as Model;
    expect(defaultHorizon(model)).toBeCloseTo(5, 8);
    expect(() => population(model, maximumTime(model))).not.toThrow();
  });
  it("mantiene visibles cantidades pequeñas con notación científica", () => {
    expect(format(1e-20)).toContain("e-20");
    expect(tex(1e100)).toBe("1\\times 10^{100}");
  });
});

describe("Verificaciones finales de consistencia matemática", () => {
  it("mantiene la ecuación P'(t) = kP(t) en ambos modelos", () => {
    for (const model of [growth, decay]) {
      for (const t of [0.5, 1, 2.5, 5, 8]) {
        const h = 0.00001;
        const derivative =
          (population(model, t + h) - population(model, t - h)) / (2 * h);
        const expected = model.k * population(model, t);
        expect(derivative / expected).toBeCloseTo(1, 8);
      }
    }
  });
  it("respeta duplicación, vida media y la dirección de la curva", () => {
    for (let t = 0; t <= 15; t += 1) {
      expect(population(growth, t + 5) / population(growth, t)).toBeCloseTo(2, 12);
      expect(population(decay, t + 5) / population(decay, t)).toBeCloseTo(0.5, 12);
      expect(population(growth, t + 1)).toBeGreaterThan(population(growth, t));
      expect(population(decay, t + 1)).toBeLessThan(population(decay, t));
    }
  });
  it("conserva valores de tabla, diferencias y porcentajes en cada instante", () => {
    for (const model of [growth, decay]) {
      for (const point of makePoints(model, 10, 20)) {
        expect(point.p).toBe(population(model, point.t));
        expect(point.delta).toBeCloseTo(point.p - model.p0, 12);
        expect(point.percent).toBeCloseTo(100 * (point.p - model.p0) / model.p0, 10);
      }
    }
  });
});
