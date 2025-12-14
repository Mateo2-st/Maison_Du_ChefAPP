import { Router } from "express";
import {
    listResenias,
    getResenia,
    addResenia,
    editResenia,
    removeResenia
} from "../controllers/reseniaController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", listResenias);
router.get("/:id", getResenia);
router.post("/",requireRole, addResenia);
router.put("/:id",verifyToken, requireRole, editResenia);
router.delete("/:id",verifyToken, requireRole, removeResenia);

export default router;
