import { useMemo } from "react";
import katex from "katex";

export function Formula({
  math,
  block = false,
}: {
  math: string;
  block?: boolean;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "htmlAndMathml",
      }),
    [math, block],
  );
  return (
    <span
      className={`formula ${block ? "formula-block" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
