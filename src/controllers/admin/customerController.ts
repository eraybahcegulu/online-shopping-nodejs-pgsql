import { Request, Response } from 'express';
import CustomerModel from '../../models/admin/addCustomerModel';

class CustomerController {
  private customerModel: CustomerModel;

  constructor() {
    this.customerModel = new CustomerModel();
  }

  public async renderCustomerAddPage(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }

    try {
      const customers = await this.customerModel.getCustomers();
      res.render('addCustomer', { customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public async addCustomer(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }

    const { name, surname, email, password } = req.body;

    try {
      const newCustomer = await this.customerModel.addCustomer(name, surname, email, password);
      res.json({ newCustomer });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(400).json({ error: 'This email address is already registered' });
      } else {
        console.error('Error adding customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

export default CustomerController;
