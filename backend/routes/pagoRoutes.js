import express from "express";
import {
  listPagos,
  getPago,
  getPagoPedido,
  addPago,
  editPago,
  removePago
} from "../controllers/pagoControllers.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/* =========================
   PAGOS
========================= */

// listar todos
router.get("/", verifyToken, listPagos);

// obtener pago por ID
router.get("/:id", verifyToken, getPago);

// obtener pago por pedido
router.get("/pedido/:id_pedido", verifyToken, getPagoPedido);

// crear pago
router.post("/", verifyToken, addPago);

// actualizar pago
router.put("/:id", verifyToken, editPago);

// eliminar pago
router.delete("/:id", verifyToken, removePago);

export default router;
