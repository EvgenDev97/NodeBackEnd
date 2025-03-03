import express from 'express';
import {authorizationController, registerController} from '../controllers/userController.js';

const router = express.Router();
router.post('/registration', registerController);
router.post("/login", authorizationController)
export default router;