/**
 * Background Removal Service
 *
 * Runs entirely in the browser (WASM + a bundled segmentation model via
 * @imgly/background-removal) — no API key, no per-image cost, no server
 * round-trip. First call in a session downloads the model (a few MB) and
 * caches it; later calls are fast.
 */

/**
 * Removes the background from an image, returning a transparent PNG Blob.
 * @param {string|Blob|File} input - Image URL, Blob, or File
 * @param {(ratio: number) => void} [onProgress] - Called with 0..1 progress
 * @returns {Promise<Blob>} PNG blob with a transparent background
 */
export async function removeImageBackground(input, onProgress) {
  const { removeBackground } = await import('@imgly/background-removal');

  return removeBackground(input, {
    progress: (key, current, total) => {
      if (onProgress && total > 0) onProgress(current / total);
    },
  });
}
