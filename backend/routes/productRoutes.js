import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByRestaurante,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkProductOwner } from "../middleware/checkProductOwner.js";

const router = express.Router();

/* 🔥 IMPORTANTE: ORDEN DE RUTAS */

// productos por restaurante (CATÁLOGO)
router.get(
  "/restaurante/:id",
  verifyToken,
  getProductsByRestaurante
);

// vendedor ve solo los suyos
router.get("/", verifyToken, getAllProducts);

// obtener uno
router.get("/:id", verifyToken, getProductById);

// crear
router.post("/", verifyToken, createProduct);

// editar / eliminar
router.put("/:id", verifyToken, checkProductOwner, updateProduct);
router.delete("/:id", verifyToken, checkProductOwner, deleteProduct);

export default router;
