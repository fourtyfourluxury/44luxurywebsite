/**
 * Loading State Components
 * Provides various loading indicators and skeleton screens
 */

/**
 * Spinner Component
 */
export function Spinner({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-zinc-700 border-t-white rounded-full animate-spin ${className}`}
    />
  );
}

/**
 * Full Page Loading
 */
export function PageLoading({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-[#fcf9f3] flex items-center justify-center">
      <div className="text-center">
        <Spinner size="large" className="mx-auto mb-4" />
        <p className="font-grotesk text-sm text-[#5f5e5e] uppercase tracking-widest">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Section Loading
 */
export function SectionLoading({ message = 'Loading...' }) {
  return (
    <div className="py-32 text-center">
      <Spinner size="large" className="mx-auto mb-4" />
      <p className="font-grotesk text-sm text-[#5f5e5e] uppercase tracking-widest">
        {message}
      </p>
    </div>
  );
}

/**
 * Inline Loading
 */
export function InlineLoading({ message = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3">
      <Spinner size="small" />
      <span className="font-plex text-sm text-[#5f5e5e]">{message}</span>
    </div>
  );
}

/**
 * Button Loading
 */
export function ButtonLoading() {
  return <Spinner size="small" className="border-white border-t-transparent" />;
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-zinc-800 mb-4" />
      <div className="h-4 bg-zinc-800 rounded mb-2 w-3/4" />
      <div className="h-3 bg-zinc-800 rounded w-1/2" />
    </div>
  );
}

/**
 * Product Grid Skeleton
 */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Order Card Skeleton
 */
export function OrderCardSkeleton() {
  return (
    <div className="border border-[#1c1c18]/10 bg-white p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-zinc-200 rounded w-32 mb-2" />
          <div className="h-3 bg-zinc-200 rounded w-24" />
        </div>
        <div className="h-6 bg-zinc-200 rounded w-20" />
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-zinc-200 rounded w-full" />
        <div className="h-3 bg-zinc-200 rounded w-3/4" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-zinc-200 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 mb-3"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-zinc-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-3 bg-zinc-200 rounded w-24 mb-2" />
          <div className="h-12 bg-zinc-200 rounded w-full" />
        </div>
      ))}
      <div className="h-12 bg-zinc-800 rounded w-32" />
    </div>
  );
}

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white border border-[#1c1c18]/10 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-zinc-200 rounded w-24" />
        <div className="w-8 h-8 bg-zinc-200 rounded" />
      </div>
      <div className="h-8 bg-zinc-200 rounded w-20 mb-2" />
      <div className="h-3 bg-zinc-200 rounded w-32" />
    </div>
  );
}

/**
 * Image Skeleton
 */
export function ImageSkeleton({ aspectRatio = '4/5', className = '' }) {
  return (
    <div
      className={`bg-zinc-800 animate-pulse ${className}`}
      style={{ aspectRatio }}
    />
  );
}

/**
 * Text Skeleton
 */
export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-zinc-200 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar Skeleton
 */
export function AvatarSkeleton({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} bg-zinc-200 rounded-full animate-pulse`} />
  );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <AvatarSkeleton />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-200 rounded w-3/4" />
            <div className="h-3 bg-zinc-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Progress Bar
 */
export function ProgressBar({ progress = 0, className = '' }) {
  return (
    <div className={`w-full bg-zinc-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="bg-[#1c1c18] h-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

/**
 * Pulse Dot
 */
export function PulseDot({ className = '' }) {
  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4b0e1e] opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4b0e1e]" />
    </span>
  );
}

/**
 * Loading Overlay
 */
export function LoadingOverlay({ message = 'Loading...', show = true }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
        <Spinner size="large" className="mx-auto mb-4" />
        <p className="font-grotesk text-sm text-[#1c1c18] uppercase tracking-widest text-center">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Shimmer Effect
 */
export function Shimmer({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-zinc-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

// Add shimmer animation to global CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}

export default {
  Spinner,
  PageLoading,
  SectionLoading,
  InlineLoading,
  ButtonLoading,
  ProductCardSkeleton,
  ProductGridSkeleton,
  OrderCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardCardSkeleton,
  ImageSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  ListSkeleton,
  ProgressBar,
  PulseDot,
  LoadingOverlay,
  Shimmer,
};
