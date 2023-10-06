import express from 'express';
import CustomerController from '../../controllers/admin/customerController';

const router = express.Router();
const customerController = new CustomerController();

router.get('/customerAdd', (req, res) => customerController.renderCustomerAddPage(req, res));
router.post('/customerAdd', (req, res) => customerController.addCustomer(req, res));

export default router;