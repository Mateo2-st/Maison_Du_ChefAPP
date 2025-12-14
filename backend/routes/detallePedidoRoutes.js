import { Router } from "express";
import {
    listDetalles,
    addDetalle,
    editDetalle,
    removeDetalle
} from "../controllers/detallePedidoControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/:id_pedido", listDetalles);
router.post("/",verifyToken, requireRole, addDetalle);
router.put("/:id",verifyToken, requireRole, editDetalle);
router.delete("/:id",verifyToken, requireRole, removeDetalle);         

export default router;
