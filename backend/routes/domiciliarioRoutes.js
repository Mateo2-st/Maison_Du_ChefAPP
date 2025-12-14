import { Router } from "express";
import {
  getPedidosDisponibles,
  getPedidosPublicos,
  aceptarPedido,
  rechazarPedido,
  getMisPedidos,
  entregadoPedido
} from "../controllers/domiciliarioControllers.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// Solo domiciliarios (rol 4) pueden ver pedidos disponibles
router.get(
  "/pedidos",
  verifyToken,
  requireRole(4),
  getPedidosDisponibles
);

// Endpoint público (solo lista, sin acciones)
router.get(
  "/public",
  getPedidosPublicos
);

// Domiciliarios aceptan un pedido
router.post(
  "/aceptar/:id",
  verifyToken,
  requireRole(4),
  aceptarPedido
);

// Domiciliarios rechazan un pedido
router.post(
  "/rechazar/:id",
  verifyToken,
  requireRole(4),
  rechazarPedido
);

// Marcar pedido como entregado (solo domiciliario asignado)
router.post(
  "/entregado/:id",
  verifyToken,
  requireRole(4),
  entregadoPedido
);

// Ver mis pedidos asignados
router.get(
  "/mis-pedidos",
  verifyToken,
  requireRole(4),
  getMisPedidos
);

export default router;
