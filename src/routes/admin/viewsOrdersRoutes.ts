import express from 'express';
import AdminOrderController from '../../controllers/admin/viewOrdersController';

const router = express.Router();
const adminOrderController = new AdminOrderController();

router.get('/viewOrders', (req, res) => adminOrderController.viewOrders(req, res));
router.post('/removeOrder', (req, res) => adminOrderController.removeOrder(req, res));

export default router;
