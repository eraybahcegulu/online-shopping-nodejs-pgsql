import express from 'express';
import ProductController from '../../controllers/admin/productController';

const router = express.Router();
const productController = new ProductController();

router.get('/productAdd', (req, res) => productController.renderProductAddPage(req, res));
router.post('/productAdd', (req, res) => productController.addProduct(req, res));
router.get('/productUpdate/:id',(req, res) => productController.renderProductUpdatePage(req, res));
router.patch('/updateProduct/:id',(req, res) => productController.updateProduct(req, res));
router.delete('/deleteProduct/:id', (req, res) =>productController.deleteProduct(req, res));
router.get('/adminProducts', (req, res) =>productController.viewAdminProducts(req, res));

export default router;
