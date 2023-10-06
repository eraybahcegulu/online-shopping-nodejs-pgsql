import express from 'express';
import CartController from '../../controllers/customer/cartController';

const router = express.Router();
const cartController = new CartController();

router.post('/addCart', (req, res) => cartController.addToCart (req, res));
router.get('/cart', (req, res) => cartController.viewCart (req, res));
router.post('/removeCart', (req, res) => cartController.removeCart (req, res));

export default router;
