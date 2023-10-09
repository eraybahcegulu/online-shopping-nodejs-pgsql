import express from 'express';
import CustomerHomeController from '../../controllers/customer/homeController';

const router = express.Router();
const customerHomeController = new CustomerHomeController();

router.get('/customerHome', (req, res) => customerHomeController.viewCustomerHome(req, res));


router.get('/customerHome/productType/:productTypeId', async (req, res) => {
    const { productTypeId } = req.params;
  
    try {
      await customerHomeController.viewCustomerHomeByProductType(req, res, productTypeId);
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
export default router;
