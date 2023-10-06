import express from 'express';
import AuthController from '../../controllers/auth/authController';

const router = express.Router();
const authController = new AuthController();

router.post('/login', (req, res) => authController.login(req, res));

export default router;
