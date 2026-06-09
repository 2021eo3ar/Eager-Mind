export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
