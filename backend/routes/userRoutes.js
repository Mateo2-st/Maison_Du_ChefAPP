import express from "express";
import { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  updateUserAdmin, 
  deleteUserAdmin, 
  getProfile 
} from "../controllers/userControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { getUserById } from "../controllers/userControllers.js";




const router = express.Router();

// Registro y login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Rutas protegidas
router.get("/", verifyToken, getAllUsers);          // Lista todos los usuarios
router.get("/me", verifyToken, getProfile);        // Perfil del usuario
router.put("/:id", verifyToken, updateUserAdmin);  // Actualizar usuario
router.delete("/:id", verifyToken, deleteUserAdmin); // Eliminar usuario
router.get("/:id", verifyToken, getUserById); // Obtener un usuario específico


export default router;

 

