import express from 'express';
import AdminHomeController from '../../controllers/admin/homeController';

const router = express.Router();
const adminHomeController = new AdminHomeController();

router.get('/adminHome', (req, res) => adminHomeController.viewAdminHome (req, res));

export default router;
