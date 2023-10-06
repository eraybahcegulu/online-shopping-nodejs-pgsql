import { QueryResult } from 'pg';
import postgresClient from '../../../config/db';

class AuthModel {

  async getUserByEmailAndPassword(email: string, password: string): Promise<QueryResult> {
    return postgresClient.query(
      `SELECT id, name, email, user_type
      FROM (
          SELECT id, name, email, 'customer' AS user_type, password FROM customers
          UNION ALL
          SELECT id, name, email, 'admin' AS user_type, password FROM admins
      ) AS combined_users
      WHERE email = $1 AND password = $2`,
      [email, password]
    );
  }
}

export default AuthModel;
