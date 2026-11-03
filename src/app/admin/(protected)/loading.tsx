/** Shown inside the admin frame while a page's data loads. */
export default function AdminPageLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="max-w-5xl">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
