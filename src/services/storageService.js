import { supabase } from '../lib/supabase';

/**
 * Supabase Storage Service
 * Handles all file upload/download/delete operations
 * Replaces Cloudinary
 */

// Storage bucket names
export const BUCKETS = {
  PRODUCTS: 'products',
  COLLECTIONS: 'collections',
  HOMEPAGE: 'homepage',
  HERO_SLIDES: 'hero-slides',
  VIDEOS: 'videos',
  GENERAL: 'general',
};

// Get bucket name based on context
export const getBucketForContext = (context) => {
  const contextMap = {
    product: BUCKETS.PRODUCTS,
    collection: BUCKETS.COLLECTIONS,
    homepage: BUCKETS.HOMEPAGE,
    editorial: BUCKETS.HOMEPAGE,
    hero: BUCKETS.HERO_SLIDES,
    video: BUCKETS.VIDEOS,
    general: BUCKETS.GENERAL,
  };

  return contextMap[context] || BUCKETS.GENERAL;
};

// Generate unique filename
export const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
};

// Upload file to Supabase Storage
export const uploadFile = async (file, options = {}) => {
  try {
    const {
      bucket = BUCKETS.GENERAL,
      folder = '',
      fileName = null,
      onProgress = null,
    } = options;

    // Generate filename if not provided
    const finalFileName = fileName || generateFileName(file.name);
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

    console.log('📤 Uploading file:', {
      bucket,
      filePath,
      size: file.size,
      type: file.type,
    });

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('✅ Upload successful:', publicUrl);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      bucket,
      error: null,
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return {
      success: false,
      url: null,
      path: null,
      bucket: null,
      error: error.message,
    };
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, options));
    const results = await Promise.all(uploadPromises);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      success: failed.length === 0,
      results: successful,
      failed,
      error: failed.length > 0 ? `${failed.length} uploads failed` : null,
    };
  } catch (error) {
    console.error('❌ Multiple upload failed:', error);
    return {
      success: false,
      results: [],
      failed: [],
      error: error.message,
    };
  }
};

// Delete file from Supabase Storage
export const deleteFile = async (filePath, bucket = BUCKETS.GENERAL) => {
  try {
    console.log('🗑️ Deleting file:', { bucket, filePath });

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }

    console.log('✅ Delete successful');

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('❌ Delete failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file by URL
export const deleteFileByUrl = async (url) => {
  try {
    // Extract bucket and path from URL
    // URL format: https://project.supabase.co/storage/v1/object/public/bucket/path
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      throw new Error('Invalid Supabase Storage URL');
    }

    const [bucket, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');

    return await deleteFile(filePath, bucket);
  } catch (error) {
    console.error('❌ Delete by URL failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// List files in a bucket
export const listFiles = async (bucket = BUCKETS.GENERAL, folder = '') => {
  try {
    console.log('📂 Listing files:', { bucket, folder });

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ List error:', error);
      throw error;
    }

    // Get public URLs for all files
    const filesWithUrls = data.map(file => {
      const filePath = folder ? `${folder}/${file.name}` : file.name;
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        ...file,
        url: publicUrl,
        path: filePath,
        bucket,
      };
    });

    console.log('✅ Listed files:', filesWithUrls.length);

    return {
      success: true,
      files: filesWithUrls,
      error: null,
    };
  } catch (error) {
    console.error('❌ List failed:', error);
    return {
      success: false,
      files: [],
      error: error.message,
    };
  }
};

// Get file info
export const getFileInfo = async (filePath, bucket = BUCKETS.GENERAL) => {
  try {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      bucket,
      error: null,
    };
  } catch (error) {
    console.error('❌ Get file info failed:', error);
    return {
      success: false,
      url: null,
      path: null,
      bucket: null,
      error: error.message,
    };
  }
};

// Move/rename file
export const moveFile = async (fromPath, toPath, bucket = BUCKETS.GENERAL) => {
  try {
    console.log('📦 Moving file:', { bucket, fromPath, toPath });

    const { data, error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      console.error('❌ Move error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(toPath);

    console.log('✅ Move successful');

    return {
      success: true,
      url: publicUrl,
      path: toPath,
      error: null,
    };
  } catch (error) {
    console.error('❌ Move failed:', error);
    return {
      success: false,
      url: null,
      path: null,
      error: error.message,
    };
  }
};

// Download file
export const downloadFile = async (filePath, bucket = BUCKETS.GENERAL) => {
  try {
    console.log('⬇️ Downloading file:', { bucket, filePath });

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error('❌ Download error:', error);
      throw error;
    }

    console.log('✅ Download successful');

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('❌ Download failed:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// Get signed URL (for private files)
export const getSignedUrl = async (filePath, bucket = BUCKETS.GENERAL, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Signed URL error:', error);
      throw error;
    }

    return {
      success: true,
      url: data.signedUrl,
      error: null,
    };
  } catch (error) {
    console.error('❌ Signed URL failed:', error);
    return {
      success: false,
      url: null,
      error: error.message,
    };
  }
};

// Helper: Check if URL is from Supabase Storage
export const isSupabaseStorageUrl = (url) => {
  return url && url.includes('/storage/v1/object/public/');
};

// Helper: Check if URL is from Cloudinary (for migration)
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

// Helper: Get file size in human-readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper: Validate file type
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) => {
  return allowedTypes.includes(file.type);
};

// Helper: Validate file size
export const validateFileSize = (file, maxSizeMB = 30) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Helper: Compress image before upload (optional)
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            }));
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteFileByUrl,
  listFiles,
  getFileInfo,
  moveFile,
  downloadFile,
  getSignedUrl,
  getBucketForContext,
  generateFileName,
  isSupabaseStorageUrl,
  isCloudinaryUrl,
  formatFileSize,
  validateFileType,
  validateFileSize,
  compressImage,
  BUCKETS,
};
