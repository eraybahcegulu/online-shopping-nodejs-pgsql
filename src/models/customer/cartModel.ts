import postgresClient from '../../../config/db';

class CustomerCartModel {
  public async addToCart(userId: number, productId: number): Promise<any> {
    try {
      const productResult = await postgresClient.query('SELECT * FROM products WHERE id = $1', [productId]);

      if (productResult.rows.length === 0) {
        return { error: 'Product not found' };
      }

      const selectedProduct = productResult.rows[0];

      const insertResult = await postgresClient.query(
        'INSERT INTO carts (customer_id, products_id, products_type, products_name, products_price, products_description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, selectedProduct.id, selectedProduct.type, selectedProduct.name, selectedProduct.price, selectedProduct.description]
      );

      const addedToCartProduct = insertResult.rows[0];
      console.log('Added to cart:', addedToCartProduct);

      await postgresClient.query('UPDATE products SET quantity = quantity - 1 WHERE id = $1', [productId]);

      return { success: true, message: 'Product successfully added to your cart', addedToCartProduct };
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Internal Server Error' };
    }
  }

  public async viewCart(userId: number): Promise<any> {
    try {
      const result = await postgresClient.query('SELECT * FROM carts WHERE customer_id = $1', [userId]);
      const cartItems = result.rows;

      return { cartItems };
    } catch (error) {
      console.error('Error fetching cart details:', error);
      return { error: 'Internal Server Error' };
    }
  }

  public async removeCart(userId: number, cartId: number): Promise<any> {
    try {
      const result = await postgresClient.query('SELECT * FROM carts WHERE id = $1', [cartId]);
      
      if (result.rows.length === 0) {
        return { error: 'Product not found' };
      }

      const selectedCart = result.rows[0];

      const deleteResult = await postgresClient.query(
        'DELETE FROM carts WHERE customer_id = $1 AND id = $2 RETURNING *',
        [userId, selectedCart.id]
      );

      const removedCartProduct = deleteResult.rows[0];
      console.log('Removed from cart:', removedCartProduct);

      await postgresClient.query('UPDATE products SET quantity = quantity + 1 WHERE id = $1', [removedCartProduct.products_id]);
      return { success: true, message: 'Product successfully removed from your cart', removedCartProduct };
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Internal Server Error' };
    }
  }
}

export default CustomerCartModel;
