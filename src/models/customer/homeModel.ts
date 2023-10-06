import postgresClient from '../../../config/db';

class CustomerHomeModel {
  public async getProducts(): Promise<any[]> {
    const result = await postgresClient.query('SELECT id, type, name, price, description FROM products');
    return result.rows;
  }

  public async getCartItems(customerId: number): Promise<any[]> {
    const result = await postgresClient.query('SELECT * FROM carts WHERE customer_id = $1', [customerId]);
    return result.rows;
  }

  public async getOrderItems(customerId: number): Promise<any[]> {
    const result = await postgresClient.query('SELECT * FROM orders WHERE customer_id = $1', [customerId]);
    return result.rows;
  }
}

export default CustomerHomeModel;
