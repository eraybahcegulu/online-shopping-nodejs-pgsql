import postgresClient from '../../../config/db';

class CustomerOrderModel {
  public async placeOrder(userId: number, userName: string, userEmail: string): Promise<any> {
    try {
      const cartItems = await postgresClient.query('SELECT * FROM carts WHERE customer_id = $1', [userId]);

      if (cartItems.rows.length === 0) {
        return { error: 'Cart is empty' };
      }

      const orderAmount = cartItems.rows.reduce((total, item) => total + parseFloat(item.products_price.replace(',', '')), 0);

      const orderResult = await postgresClient.query(
        'INSERT INTO orders (customer_id, customer_name, customer_email, order_amount) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, userName, userEmail, orderAmount]
      );

      const orderId = orderResult.rows[0].id;

      for (const item of cartItems.rows) {
        await postgresClient.query(
          'INSERT INTO order_items (order_id, products_id, products_type, products_name, products_price, products_description) VALUES ($1, $2, $3, $4, $5, $6)',
          [orderId, item.products_id, item.products_type, item.products_name, item.products_price, item.products_description]
        );
      }

      await postgresClient.query('DELETE FROM carts WHERE customer_id = $1', [userId]);

      return { success: true, orderId: orderId };
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Internal Server Error' };
    }
  }

  public async viewOrders(userId: number): Promise<any> {
    try {
      const ordersQuery = await postgresClient.query('SELECT * FROM orders WHERE customer_id = $1', [userId]);

      const orders = [];
      for (const order of ordersQuery.rows) {
        const orderItemsQuery = await postgresClient.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        const orderItems = orderItemsQuery.rows;

        orders.push({
          ...order,
          items: orderItems,
        });
      }

      return { orders };
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Internal Server Error' };
    }
  }
}

export default CustomerOrderModel;
