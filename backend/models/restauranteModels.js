import express from "express";
import {
  getAllRestaurantes,
  getRestaurantesByDueno,
  createRestaurante,
  updateRestaurante,
  deleteRestaurante
} from "../controllers/restauranteControllers.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ⚠️ SOLO verifyToken, NADA MÁS
router.get("/", verifyToken, getAllRestaurantes);
router.get("/dueno/:id_usuario", verifyToken, getRestaurantesByDueno);
router.post("/", verifyToken, createRestaurante);
router.put("/:id", verifyToken, updateRestaurante);
router.delete("/:id", verifyToken, deleteRestaurante);

export default router;

