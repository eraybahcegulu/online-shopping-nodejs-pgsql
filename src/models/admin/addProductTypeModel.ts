import postgresClient from '../../../config/db';

class ProductTypeModel {
  public async getAllProductTypes(): Promise<any[]> {
    const result = await postgresClient.query('SELECT * FROM product_types');
    return result.rows;
  }

  public async addProductType(type: string): Promise<void> {
    await postgresClient.query('INSERT INTO product_types (type) VALUES ($1)', [type]);
  }
}

export default ProductTypeModel;
