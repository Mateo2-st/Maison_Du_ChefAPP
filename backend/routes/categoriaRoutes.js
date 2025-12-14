// backend/routes/categoriaRoutes.js
import express from "express";
import {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory
} from "../controllers/categoriaControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", verifyToken, requireRole('admin'), addCategory);
router.put("/:id", verifyToken, requireRole('admin'), editCategory);
router.delete("/:id", verifyToken, requireRole('admin'), removeCategory);

export default router;
