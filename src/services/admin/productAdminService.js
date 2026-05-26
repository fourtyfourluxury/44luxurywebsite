import { supabase } from '../../lib/supabase';
import { deleteFileByUrl, isSupabaseStorageUrl } from '../storageService';

/**
 * Admin Product Service
 * Handles product management operations for admin
 */

// Get all products (admin view - includes drafts)
export const getAllProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.collectionId) {
      query = query.eq('collection_id', filters.collectionId);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get all products error:', error);
    return { products: [], error: error.message };
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .single();

    if (error) throw error;

    return { product: data, error: null };
  } catch (error) {
    console.error('Create product error:', error);
    return { product: null, error: error.message };
  }
};

// Update product
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .single();

    if (error) throw error;

    return { product: data, error: null };
  } catch (error) {
    console.error('Update product error:', error);
    return { product: null, error: error.message };
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    // Fetch product to get images before deleting
    const { data: product } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    // Delete images from Supabase Storage
    if (product?.images && Array.isArray(product.images)) {
      for (const imageUrl of product.images) {
        if (isSupabaseStorageUrl(imageUrl)) {
          const deleteResult = await deleteFileByUrl(imageUrl);
          if (!deleteResult.success) {
            console.warn(`⚠️ Failed to delete product image from storage: ${imageUrl}`, deleteResult.error);
          }
        }
      }
      console.log('✅ Product images deleted from storage');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: error.message };
  }
};

// Bulk delete products
export const bulkDeleteProducts = async (productIds) => {
  try {
    // Fetch products to get images before deleting
    const { data: products } = await supabase
      .from('products')
      .select('images')
      .in('id', productIds);

    // Collect all image URLs
    const allImages = [];
    if (products) {
      products.forEach(product => {
        if (product.images && Array.isArray(product.images)) {
          allImages.push(...product.images);
        }
      });
    }

    // Delete images from Supabase Storage
    for (const imageUrl of allImages) {
      if (isSupabaseStorageUrl(imageUrl)) {
        const deleteResult = await deleteFileByUrl(imageUrl);
        if (!deleteResult.success) {
          console.warn(`⚠️ Failed to delete product image from storage: ${imageUrl}`, deleteResult.error);
        }
      }
    }
    if (allImages.length > 0) {
      console.log(`✅ ${allImages.length} product images deleted from storage`);
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Bulk delete products error:', error);
    return { success: false, error: error.message };
  }
};

// Update product status
export const updateProductStatus = async (productId, status) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return { product: data, error: null };
  } catch (error) {
    console.error('Update product status error:', error);
    return { product: null, error: error.message };
  }
};

// Update product stock
export const updateProductStock = async (productId, stock) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return { product: data, error: null };
  } catch (error) {
    console.error('Update product stock error:', error);
    return { product: null, error: error.message };
  }
};

// Duplicate product
export const duplicateProduct = async (productId) => {
  try {
    // Get original product
    const { data: original, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    // Create duplicate with modified name and SKU
    const duplicate = {
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      sku: original.sku ? `${original.sku}-COPY` : null,
      status: 'DRAFT',
      created_at: undefined,
      updated_at: undefined,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(duplicate)
      .select()
      .single();

    if (error) throw error;

    return { product: data, error: null };
  } catch (error) {
    console.error('Duplicate product error:', error);
    return { product: null, error: error.message };
  }
};

// Get product statistics
export const getProductStats = async () => {
  try {
    // Total products
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Active products
    const { count: activeCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    // Low stock products
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock', 10)
      .eq('status', 'ACTIVE');

    // Out of stock products
    const { count: outOfStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('stock', 0)
      .eq('status', 'ACTIVE');

    return {
      stats: {
        total: totalCount || 0,
        active: activeCount || 0,
        lowStock: lowStockCount || 0,
        outOfStock: outOfStockCount || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get product stats error:', error);
    return { stats: null, error: error.message };
  }
};

// Upload product image to Cloudinary
export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', '44luxury_products');
    formData.append('folder', '44luxury/products');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      error: null,
    };
  } catch (error) {
    console.error('Upload product image error:', error);
    return { url: null, publicId: null, error: error.message };
  }
};

// Delete image from Cloudinary
export const deleteProductImage = async (publicId) => {
  try {
    // This would typically be done via a backend endpoint
    // For now, we'll just remove it from the product
    // Actual deletion from Cloudinary should be done server-side
    return { success: true, error: null };
  } catch (error) {
    console.error('Delete product image error:', error);
    return { success: false, error: error.message };
  }
};

// Generate SKU
export const generateSKU = (productName, category) => {
  const prefix = category === 'men' ? 'M' : category === 'women' ? 'W' : 'U';
  const namePart = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `LUX-${prefix}${namePart}-${randomPart}`;
};

// Validate product data
export const validateProductData = (productData) => {
  const errors = {};

  if (!productData.name || productData.name.trim() === '') {
    errors.name = 'Product name is required';
  }

  if (!productData.price || productData.price <= 0) {
    errors.price = 'Valid price is required';
  }

  if (!productData.category) {
    errors.category = 'Category is required';
  }

  if (!productData.images || productData.images.length === 0) {
    errors.images = 'At least one image is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
