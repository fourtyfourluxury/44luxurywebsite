import { useState, useEffect, useRef } from 'react';
import { getCloudinaryUrl, getBlurPlaceholderUrl, getResponsiveSrcSet } from '../../utils/cloudinary';

/**
 * OptimizedImage Component
 * Provides lazy loading, blur placeholder, and responsive images
 */
export default function OptimizedImage({
  src,
  alt = '',
  transformation,
  className = '',
  width,
  height,
  lazy = true,
  blur = true,
  responsive = false,
  responsiveWidths = [400, 800, 1200, 1600],
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Get optimized image URL
  const imageUrl = transformation 
    ? getCloudinaryUrl(src, transformation)
    : src;

  // Get blur placeholder URL
  const placeholderUrl = blur && src ? getBlurPlaceholderUrl(src) : null;

  // Get responsive srcset
  const srcSet = responsive && src ? getResponsiveSrcSet(src, responsiveWidths) : null;

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = (e) => {
    setError(true);
    if (onError) onError(e);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur Placeholder */}
      {blur && placeholderUrl && !isLoaded && !error && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      {isInView && !error && (
        <img
          src={imageUrl}
          srcSet={srcSet || undefined}
          sizes={responsive ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}

      {/* Error Placeholder */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="text-center text-zinc-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {!isLoaded && !error && !blur && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
    </div>
  );
}
