import postgresClient from '../../../config/db';
class ProductModel {
  public async getAdminProducts(): Promise<any[]> {
    const result = await postgresClient.query('SELECT id, type, name, price, quantity , description, image FROM products');
    
    return result.rows;
  }

  public async getAllProductTypes(): Promise<any[]> {
    const result = await postgresClient.query('SELECT * FROM product_types');
    return result.rows;
  }

  public async addProduct(type: string, name: string, price: number, quantity: number, description: string, productImage: string): Promise<any> {
    const result = await postgresClient.query(
        'INSERT INTO products (type, name, price, quantity, description, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [type, name, price, quantity, description, productImage]
    );

    return result.rows[0];
}

  public async getProductById(productId: string): Promise<any> {
    const result = await postgresClient.query('SELECT * FROM products WHERE id = $1', [productId]);
    return result.rows[0];
  }

  public async updateProduct(productId: string, name: string, productType: string, price: number, quantity: number, description: string, productImage: string): Promise<any> {
    const result = await postgresClient.query(
      'UPDATE products SET name = $1, type = $2, price = $3, quantity = $4, description = $5, image = $6 WHERE id = $7 RETURNING *',
      [name, productType, price, quantity, description, productImage, productId]
    );

    return result.rows[0];
  }

  public async deleteProduct(productId: string): Promise<boolean> {
    const result = await postgresClient.query('DELETE FROM products WHERE id = $1', [productId]);
    return result.rowCount > 0;
  }
}

export default ProductModel;