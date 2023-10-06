import express from 'express';
import ProductTypeController from '../../controllers/admin/addProductTypeController';

const router = express.Router();
const productTypeController = new ProductTypeController();

router.get('/productTypeAdd', (req, res) => productTypeController.renderProductTypeAddPage(req, res));
router.post('/productTypeAdd', (req, res) => productTypeController.addProductType(req, res));

export default router;




