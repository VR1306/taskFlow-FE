import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <output
      aria-label="Loading workspace dashboard"
      data-testid="dashboard-skeleton"
      className="block space-y-6 animate-pulse"
    >
      {/* 4 Stat Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-36"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
                <div className="h-7 w-16 bg-slate-200 rounded-md" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="h-3 w-28 bg-slate-200 rounded-md" />
              <div className="h-4 w-14 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 Chart Cards Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Distribution Card Skeleton (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-96">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-3 w-40 bg-slate-100 rounded-md" />
              </div>
              <div className="h-7 w-28 bg-slate-100 rounded-lg" />
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              <div className="w-44 h-44 rounded-full border-8 border-slate-100 bg-slate-50 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 w-36 bg-slate-200 rounded-md" />
            <div className="h-3 w-20 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Workspace Trends Card Skeleton (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-96">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="h-4 w-44 bg-slate-200 rounded-md" />
                <div className="h-3 w-56 bg-slate-100 rounded-md" />
              </div>
              <div className="h-7 w-36 bg-slate-100 rounded-lg" />
            </div>

            <div className="py-6 flex items-end justify-between gap-3 h-52 px-4">
              {[40, 65, 30, 85, 50, 95].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <div
                    className="w-full max-w-[36px] bg-slate-100 rounded-t-md"
                    style={{ height: `${h}%` }}
                  />
                  <div className="h-3 w-7 bg-slate-200 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 w-40 bg-slate-200 rounded-md" />
            <div className="h-3 w-24 bg-slate-200 rounded-md" />
          </div>
        </div>
      </div>

      {/* 2 Widget Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((w) => (
          <div
            key={w}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                  <div className="h-3 w-32 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="h-3 w-14 bg-slate-200 rounded-md" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div className="space-y-1">
                      <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
                      <div className="h-2.5 w-40 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </output>
  );
};
