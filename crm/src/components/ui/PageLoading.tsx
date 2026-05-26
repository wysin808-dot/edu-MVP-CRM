"use client";

export default function PageLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Title skeleton */}
      <div className="h-7 w-40 rounded mb-1" style={{ background: "var(--surface-soft)" }} />
      <div className="h-4 w-60 rounded mb-6" style={{ background: "var(--surface-soft)" }} />

      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-36 rounded-xl"
            style={{ background: "var(--surface-soft)" }}
          />
        ))}
      </div>
    </div>
  );
}
