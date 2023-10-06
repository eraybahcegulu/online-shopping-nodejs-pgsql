import { Request, Response } from 'express';
import CustomerOrderModel from '../../models/customer/orderModel';

class CustomerOrderController {
  private customerOrderModel: CustomerOrderModel;

  constructor() {
    this.customerOrderModel = new CustomerOrderModel();
  }

  public async placeOrder(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }

    const userId = req.session.userId;
    const userName = req.session.userName || ''; //undefined olması durumu için boş string atıyoruz
    const userEmail = req.session.userEmail || '';  //undefined olması durumu için boş string atıyoruz

    const result = await this.customerOrderModel.placeOrder(userId, userName, userEmail);

    if (result.error) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  }

  public async viewOrders(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }

    const userId = req.session.userId;

    const result = await this.customerOrderModel.viewOrders(userId);

    if (result.error) {
      res.status(500).json(result);
    } else {
      const { orders } = result;
      res.render('myOrders', { orders });
    }
  }
}

export default CustomerOrderController;
