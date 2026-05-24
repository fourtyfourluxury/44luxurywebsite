/**
 * Performance Monitoring Utilities
 * Provides tools for measuring and optimizing performance
 */

/**
 * Measure component render time
 * @param {string} componentName - Name of the component
 * @param {Function} callback - Function to measure
 * @returns {any} Result of callback
 */
export function measureRenderTime(componentName, callback) {
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load component
 * @param {Function} importFunc - Dynamic import function
 * @param {number} delay - Minimum delay in milliseconds
 * @returns {Promise} Lazy loaded component
 */
export function lazyLoadComponent(importFunc, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      importFunc().then(resolve);
    }, delay);
  });
}

/**
 * Measure API call time
 * @param {string} apiName - Name of the API
 * @param {Function} apiCall - API call function
 * @returns {Promise<any>} API response
 */
export async function measureApiCall(apiName, apiCall) {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (import.meta.env.DEV) {
      console.log(`[API] ${apiName} completed in ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (import.meta.env.DEV) {
      console.error(`[API] ${apiName} failed after ${duration.toFixed(2)}ms`, error);
    }

    throw error;
  }
}

/**
 * Get page load metrics
 * @returns {Object} Page load metrics
 */
export function getPageLoadMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0];
  
  if (!navigation) return null;

  return {
    // DNS lookup time
    dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
    
    // TCP connection time
    tcpTime: navigation.connectEnd - navigation.connectStart,
    
    // Request time
    requestTime: navigation.responseStart - navigation.requestStart,
    
    // Response time
    responseTime: navigation.responseEnd - navigation.responseStart,
    
    // DOM processing time
    domProcessingTime: navigation.domComplete - navigation.domInteractive,
    
    // Total load time
    loadTime: navigation.loadEventEnd - navigation.fetchStart,
    
    // DOM content loaded time
    domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    
    // Time to first byte
    ttfb: navigation.responseStart - navigation.requestStart,
  };
}

/**
 * Log page load metrics
 */
export function logPageLoadMetrics() {
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = getPageLoadMetrics();
        if (metrics) {
          console.log('[Performance] Page Load Metrics:', metrics);
        }
      }, 0);
    });
  }
}

/**
 * Measure memory usage
 * @returns {Object|null} Memory usage info
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !performance.memory) {
    return null;
  }

  return {
    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
  };
}

/**
 * Log memory usage
 */
export function logMemoryUsage() {
  if (import.meta.env.DEV) {
    const memory = getMemoryUsage();
    if (memory) {
      console.log('[Performance] Memory Usage:', memory);
    }
  }
}

/**
 * Create performance mark
 * @param {string} name - Mark name
 */
export function mark(name) {
  if (typeof window !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure performance between two marks
 * @param {string} name - Measure name
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 * @returns {number|null} Duration in milliseconds
 */
export function measure(name, startMark, endMark) {
  if (typeof window === 'undefined' || !performance.measure) {
    return null;
  }

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    }

    return measure.duration;
  } catch (error) {
    console.error('Error measuring performance:', error);
    return null;
  }
}

/**
 * Clear performance marks and measures
 */
export function clearPerformanceData() {
  if (typeof window !== 'undefined' && performance.clearMarks) {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Check if browser supports Web Vitals
 * @returns {boolean}
 */
export function supportsWebVitals() {
  return typeof window !== 'undefined' && 'PerformanceObserver' in window;
}

/**
 * Measure Largest Contentful Paint (LCP)
 * @param {Function} callback - Callback with LCP value
 */
export function measureLCP(callback) {
  if (!supportsWebVitals()) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback(lastEntry.renderTime || lastEntry.loadTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.error('Error measuring LCP:', error);
  }
}

/**
 * Measure First Input Delay (FID)
 * @param {Function} callback - Callback with FID value
 */
export function measureFID(callback) {
  if (!supportsWebVitals()) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        callback(entry.processingStart - entry.startTime);
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    console.error('Error measuring FID:', error);
  }
}

/**
 * Measure Cumulative Layout Shift (CLS)
 * @param {Function} callback - Callback with CLS value
 */
export function measureCLS(callback) {
  if (!supportsWebVitals()) return;

  let clsValue = 0;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          callback(clsValue);
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    console.error('Error measuring CLS:', error);
  }
}

/**
 * Log all Web Vitals
 */
export function logWebVitals() {
  if (import.meta.env.DEV) {
    measureLCP((lcp) => console.log('[Web Vitals] LCP:', lcp.toFixed(2) + 'ms'));
    measureFID((fid) => console.log('[Web Vitals] FID:', fid.toFixed(2) + 'ms'));
    measureCLS((cls) => console.log('[Web Vitals] CLS:', cls.toFixed(4)));
  }
}

/**
 * Optimize images by preloading critical images
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 */
export function preloadCriticalImages(imageUrls) {
  if (typeof window === 'undefined') return;

  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch page
 * @param {string} url - URL to prefetch
 */
export function prefetchPage(url) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get connection speed
 * @returns {string|null} Connection speed (slow-2g, 2g, 3g, 4g)
 */
export function getConnectionSpeed() {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return null;
  }

  return navigator.connection.effectiveType;
}

/**
 * Check if connection is slow
 * @returns {boolean}
 */
export function isSlowConnection() {
  const speed = getConnectionSpeed();
  return speed === 'slow-2g' || speed === '2g';
}

/**
 * Optimize for slow connections
 * @returns {Object} Optimization settings
 */
export function getOptimizationSettings() {
  const isSlow = isSlowConnection();
  
  return {
    shouldLazyLoad: true,
    shouldPreload: !isSlow,
    imageQuality: isSlow ? 'low' : 'good',
    shouldUseBlur: !isSlow,
    shouldUseWebP: !isSlow,
  };
}

export default {
  measureRenderTime,
  debounce,
  throttle,
  lazyLoadComponent,
  measureApiCall,
  getPageLoadMetrics,
  logPageLoadMetrics,
  getMemoryUsage,
  logMemoryUsage,
  mark,
  measure,
  clearPerformanceData,
  measureLCP,
  measureFID,
  measureCLS,
  logWebVitals,
  preloadCriticalImages,
  prefetchPage,
  prefersReducedMotion,
  getConnectionSpeed,
  isSlowConnection,
  getOptimizationSettings,
};
