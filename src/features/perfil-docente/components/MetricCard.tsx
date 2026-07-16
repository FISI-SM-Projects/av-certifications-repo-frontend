type MetricCardProps = {
  label: string;
  value: string | number;
  tone?: "gold" | "green" | "neutral";
};

const toneClass: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  gold: "border-[rgba(201,168,93,0.38)] bg-[rgba(201,168,93,0.1)] text-[var(--gold-soft)]",
  green: "border-[rgba(79,155,97,0.42)] bg-[var(--green-soft)] text-[#b7efc1]",
  neutral: "border-[var(--border-soft)] bg-[rgba(27,5,12,0.65)] text-[var(--text)]",
};

export function MetricCard({ label, value, tone = "neutral" }: MetricCardProps) {
  return (
    <div className={`rounded-md border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] opacity-80">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
