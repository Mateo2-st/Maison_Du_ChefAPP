import { Router } from "express";
import {
  listPedidos,
  getPedido,
  addPedido,
  editPedido,
  removePedido
} from "../controllers/pedidoControllers.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// ADMIN
router.get(
  "/admin",
  verifyToken,
  requireRole(1),
  listPedidos
);

// GENERALES
router.get("/", listPedidos);
router.get("/:id", getPedido);
router.post("/", verifyToken, requireRole(1, 2, 3), addPedido);
router.put("/:id", verifyToken, requireRole(1, 3), editPedido);
router.delete("/:id", verifyToken, requireRole(1), removePedido);

export default router;
