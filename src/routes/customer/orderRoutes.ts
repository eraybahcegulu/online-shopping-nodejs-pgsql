import express from 'express';
import CustomerOrderController from '../../controllers/customer/orderController';

const router = express.Router();
const customerOrderController = new CustomerOrderController();

router.post('/Order', (req, res) => customerOrderController.placeOrder (req, res));
router.get('/myOrders', (req, res) => customerOrderController.viewOrders (req, res));

export default router;
