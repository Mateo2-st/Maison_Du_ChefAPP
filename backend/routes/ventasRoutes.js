import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

import {
  listPedidos,
  getPedido,
  addPedido,
  addPago,
  getMisPedidos,
  getPedidosRestaurante,
  getTodosLosPedidosAdmin
} from "../controllers/ventasController.js";

const router = express.Router();

router.get("/restaurante", verifyToken, getPedidosRestaurante);
router.get("/mios", verifyToken, getMisPedidos);
router.get("/mis-pedidos", verifyToken, getMisPedidos);
router.get("/admin", verifyToken, getTodosLosPedidosAdmin);
router.get("/", verifyToken, listPedidos);
router.get("/:id", verifyToken, getPedido);
router.post("/", verifyToken, addPedido);
router.post("/pago", verifyToken, addPago);

export default router;
