export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div
        className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <span className="relative inline-flex h-4 w-4">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          Yükleniyor...
        </span>
      </div>
    </div>
  );
}
