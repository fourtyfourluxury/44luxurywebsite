-- Migration: Enhanced Full-Text Search for Products
-- Description: Update search functionality to include all product fields
-- Date: Current

-- Drop existing search trigger and function if they exist
DROP TRIGGER IF EXISTS update_products_search_vector ON products;
DROP FUNCTION IF EXISTS update_product_search_vector();

-- Create enhanced function to update search_vector
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.sizes, ' '), '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.colors, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();

-- Update existing products with enhanced search_vector
UPDATE products
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(short_description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(sizes, ' '), '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(colors, ' '), '')), 'D');

-- Create enhanced search function for products
CREATE OR REPLACE FUNCTION search_products(
  search_query text,
  category_filter text DEFAULT NULL,
  min_price integer DEFAULT NULL,
  max_price integer DEFAULT NULL,
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  sku text,
  description text,
  short_description text,
  price integer,
  compare_price integer,
  category text,
  images text[],
  sizes text[],
  colors text[],
  stock integer,
  status text,
  is_new boolean,
  is_featured boolean,
  collection_id uuid,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.description,
    p.short_description,
    p.price,
    p.compare_price,
    p.category,
    p.images,
    p.sizes,
    p.colors,
    p.stock,
    p.status,
    p.is_new,
    p.is_featured,
    p.collection_id,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM products p
  WHERE 
    p.search_vector @@ plainto_tsquery('english', search_query)
    AND p.status = 'ACTIVE'
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for search suggestions (autocomplete)
CREATE OR REPLACE FUNCTION search_suggestions(
  search_query text,
  limit_count int DEFAULT 5
)
RETURNS TABLE (
  suggestion text,
  category text,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name as suggestion,
    p.category,
    COUNT(*) as count
  FROM products p
  WHERE 
    p.search_vector @@ plainto_tsquery('english', search_query)
    AND p.status = 'ACTIVE'
  GROUP BY p.name, p.category
  ORDER BY count DESC, p.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION products_search_vector_update IS 'Updates search vector with product name, description, category, sizes, and colors';
COMMENT ON FUNCTION search_products IS 'Search products with filters and ranking';
COMMENT ON FUNCTION search_suggestions IS 'Get search suggestions for autocomplete';

-- Verify migration
SELECT 'Enhanced full-text search migration completed successfully!' AS status;
