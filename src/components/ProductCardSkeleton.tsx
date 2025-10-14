export default function ProductCardSkeleton() {
  return (
    <div className="border border-neutral-800 animate-pulse">
      <div className="w-full h-80 bg-neutral-800"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
        <div className="h-3 bg-neutral-800 rounded w-1/4"></div>
        <div className="h-8 bg-neutral-800 rounded w-1/2"></div>
      </div>
    </div>
  );
}
