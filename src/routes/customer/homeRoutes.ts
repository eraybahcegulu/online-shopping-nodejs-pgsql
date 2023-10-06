import express from 'express';
import CustomerHomeController from '../../controllers/customer/homeController';

const router = express.Router();
const customerHomeController = new CustomerHomeController();

router.get('/customerHome', (req, res) => customerHomeController.viewCustomerHome(req, res));

export default router;
