import postgresClient from '../../../config/db';

class CustomerModel {
  public async getCustomers(): Promise<any[]> {
    const customersQuery = await postgresClient.query('SELECT * FROM customers');
    return customersQuery.rows;
  }

  public async addCustomer(name: string, surname: string, email: string, password: string): Promise<any> {
    try {
      const result = await postgresClient.query(
        'INSERT INTO customers (name, surname, email, password, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, surname, email, password, 'customer']
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default CustomerModel;
