-- Stock Management Functions
-- Functions for handling product stock updates

-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(stock - quantity, 0)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product stock (for refunds/returns)
CREATE OR REPLACE FUNCTION increment_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock + quantity
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if product has sufficient stock
CREATE OR REPLACE FUNCTION check_stock(product_id UUID, quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock
  FROM products
  WHERE id = product_id;
  
  RETURN current_stock >= quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Stock management functions created successfully!' AS status;
