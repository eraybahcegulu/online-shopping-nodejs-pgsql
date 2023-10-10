import postgresClient from '../../../config/db';

class CustomerHomeModel {
  public async getProducts(): Promise<any[]> {
    const result = await postgresClient.query('SELECT id, type, name, price, quantity, description, image FROM products');
    return result.rows;
  }

  public async getProductTypes(): Promise<any[]> {
    const result = await postgresClient.query('SELECT id, type FROM product_types');
    return result.rows;
  }

  public async getProductsByType(productType: string): Promise<any[]> {
    const result = await postgresClient.query('SELECT id, type, name, quantity, price, description, image FROM products WHERE type = $1', [productType]);
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
