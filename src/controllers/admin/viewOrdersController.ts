import { Request, Response } from 'express';
import AdminOrderModel from '../../models/admin/viewOrdersModel';

class AdminOrderController {
  private adminOrderModel: AdminOrderModel;

  constructor() {
    this.adminOrderModel = new AdminOrderModel();
  }

  public async viewOrders(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }

    try {
      const orders = await this.adminOrderModel.getOrders();

      const ordersWithDetails = [];
      for (const order of orders.rows) {
        const orderItems = await this.adminOrderModel.getOrderItems(order.id);
        const customer = await this.adminOrderModel.getCustomer(order.customer_id);

        ordersWithDetails.push({
          ...order,
          customer: customer.rows[0],
          items: orderItems.rows,
        });
      }

      res.render('viewsOrders', { orders: ordersWithDetails });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async removeOrder(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }

    const { orderId } = req.body;

    try {
      const removedOrder = await this.adminOrderModel.removeOrder(orderId);

      console.log('Removed order:', removedOrder);
      res.json({ success: true, message: 'Removed order', removedOrder: removedOrder.rows[0] });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AdminOrderController;
