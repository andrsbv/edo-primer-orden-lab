import type { ReactNode } from "react";
export function SectionTitle({
  number,
  title,
  subtitle,
  action,
}: {
  number: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div className="section-title-main">
        <span className="step-number">{number}</span>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
