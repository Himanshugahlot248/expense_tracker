export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-3 h-8 w-32" />
      <div className="skeleton mt-3 h-3 w-20" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="flex-1">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton mt-2 h-3 w-20" />
      </div>
      <div className="skeleton h-5 w-16" />
    </div>
  );
}

export function ChartSkeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton className="h-80 rounded-2xl" />
        <ChartSkeleton className="h-80 rounded-2xl" />
      </div>
      <div className="card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
