import { QueryResult } from 'pg';
import postgresClient from '../../../config/db';

class AdminOrderModel {
  public async getOrders(): Promise<QueryResult<any>>  {
    const ordersQuery = await postgresClient.query('SELECT * FROM orders');
    return ordersQuery;
  }

  public async getOrderItems(orderId: number): Promise<QueryResult<any>> {
    const orderItemsQuery = await postgresClient.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    return orderItemsQuery;
  }

  public async getCustomer(customerId: number): Promise<QueryResult<any>> {
    const customerQuery = await postgresClient.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    return customerQuery;
  }

  public async removeOrder(orderId: number): Promise<QueryResult<any>> {

    const selectOrderItems = await postgresClient.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    console.log('Selected Order Items:', selectOrderItems.rows);

    for (const orderItem of selectOrderItems.rows) {
      const { products_id} = orderItem;

      const getProductResult = await postgresClient.query('SELECT * FROM products WHERE id = $1', [products_id]);
      const product = getProductResult.rows[0];
      if (product) {
        await postgresClient.query('UPDATE products SET quantity = quantity + 1 WHERE id = $1', [products_id]);
      } else {
        console.error(`${products_id} not found.`);
      }
    }

    const removeOrder = await postgresClient.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
    return removeOrder;
  }
}

export default AdminOrderModel;
