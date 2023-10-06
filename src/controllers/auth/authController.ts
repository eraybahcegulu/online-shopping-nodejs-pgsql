import { Request, Response } from 'express';
import AuthModel from '../../models/auth/authModel';

class AuthController {
  private authModel: AuthModel;

  constructor() {
    this.authModel = new AuthModel();
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const result = await this.authModel.getUserByEmailAndPassword(email, password);

      if (result.rows.length > 0) {
        const user = result.rows[0];

        if (user.user_type === 'admin' && req.session.userId === user.id) {
          res.render('login', { error: 'This admin is already logged in' });
          return;
        }

        if (user.user_type === 'customer' && req.session.userId === user.id) {
          res.render('login', { error: 'This customer is already logged in' });
          return;
        }

        req.session.userId = user.id;
        req.session.userType = user.user_type;
        req.session.userEmail = user.email;
        req.session.userName = user.name;

        console.log('Login Attempt:', email, password);
        console.log('User ID:', user.id);
        console.log('User Type:', user.user_type);

        if (req.session.userId && req.session.userType === 'customer') {
          res.redirect('/customerHome');
        } else if (req.session.userId && req.session.userType === 'admin') {
          res.redirect('/adminHome');
        } else {
          res.render('login', { error: 'Invalid email or password' });
        }
      } else {
        res.render('login', { error: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('error', error);
      res.status(500).json({ error: 'error' });
    }
  }
}

export default AuthController;
