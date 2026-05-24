export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-[#e8e5de] mb-4" />
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <div className="h-3 bg-[#e8e5de] w-3/4 mb-2" />
          <div className="h-2.5 bg-[#e8e5de] w-1/2" />
        </div>
        <div className="h-3 bg-[#e8e5de] w-16" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PDPSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="lg:w-[55%] aspect-[4/5] bg-[#e8e5de]" />
        <div className="lg:w-[45%] flex flex-col gap-6 pt-4">
          <div className="h-4 bg-[#e8e5de] w-1/3" />
          <div className="h-14 bg-[#e8e5de] w-full" />
          <div className="h-8 bg-[#e8e5de] w-1/4" />
          <div className="flex gap-2 mt-4">
            {[1,2,3].map(i => <div key={i} className="h-10 w-20 bg-[#e8e5de]" />)}
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-11 bg-[#e8e5de]" />)}
          </div>
          <div className="h-14 bg-[#e8e5de] w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
