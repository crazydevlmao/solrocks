export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  const showSkeleton = value === null || value === undefined;
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm p-5 hover:shadow-md transition">
      <div className="text-xs uppercase tracking-wider text-black/50 mb-2">{label}</div>
      {showSkeleton ? (
        <div className="h-8 w-32 bg-black/10 rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      )}
    </div>
  );
}
