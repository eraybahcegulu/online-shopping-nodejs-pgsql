import { Request, Response } from 'express';
import CustomerCartModel from '../../models/customer/cartModel';

class CartController {
  private customerCartModel: CustomerCartModel;

  constructor() {
    this.customerCartModel = new CustomerCartModel();
  }

  public async addToCart(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }

    const { productId } = req.body;
    const userId = req.session.userId;

    const result = await this.customerCartModel.addToCart(userId, productId);

    if (result.error) {
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  }

  public async viewCart(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }

    const userId = req.session.userId;
    const userName = req.session.userName;
    const userEmail = req.session.userEmail;

    const result = await this.customerCartModel.viewCart(userId);

    if (result.error) {
      res.status(500).json(result);
    } else {
      const { cartItems } = result;
      res.render('myCart', {  userId, userName, cartItems, userEmail });
    }
  }

  public async removeCart(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }

    const { cartId } = req.body;
    const userId = req.session.userId;

    const result = await this.customerCartModel.removeCart(userId, cartId);

    if (result.error) {
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  }
}

export default CartController;
