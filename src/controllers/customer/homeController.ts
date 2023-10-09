import { Request, Response } from 'express';
import CustomerHomeModel from '../../models/customer/homeModel';

class CustomerHomeController {
  private customerHomeModel: CustomerHomeModel;

  constructor() {
    this.customerHomeModel = new CustomerHomeModel();
  }

  public async viewCustomerHome(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }
    try {
      const products = await this.customerHomeModel.getProducts();
      const productTypes = await this.customerHomeModel.getProductTypes();

      const user = {
        userId: req.session.userId,
        userName: req.session.userName,
        userEmail: req.session.userEmail
      };

      const cartItems = await this.customerHomeModel.getCartItems(user.userId);
      const ordersItems = await this.customerHomeModel.getOrderItems(user.userId);

      res.render('customerHome', {
        user,
        products,
        productTypes,
        cartItems,
        cartItemCount: cartItems.length,
        ordersItems,
        orderItemCount: ordersItems.length
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public async viewCustomerHomeByProductType(req: Request, res: Response, productType: string): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'customer')) {
      return res.redirect('/');
    }

    try {
      const productTypes = await this.customerHomeModel.getProductTypes();


      const products = await this.customerHomeModel.getProductsByType(productType);

      const user = {
        userId: req.session.userId,
        userName: req.session.userName,
        userEmail: req.session.userEmail
      };

      const cartItems = await this.customerHomeModel.getCartItems(user.userId);
      const ordersItems = await this.customerHomeModel.getOrderItems(user.userId);

      res.render('customerHome', {
        user,
        productTypes,
        products,
        cartItems,
        cartItemCount: cartItems.length,
        ordersItems,
        orderItemCount: ordersItems.length
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

export default CustomerHomeController;
