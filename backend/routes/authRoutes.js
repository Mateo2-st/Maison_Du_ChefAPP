import express from 'express'
import { login, register, getProfile, getAllUsers } from '../controllers/authControllers.js'
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get("/me", verifyToken, getProfile);

export default router;
