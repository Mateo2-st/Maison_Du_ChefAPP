
import {
    getAllPagos,
    getPagoById,
    getPagoByPedido,
    createPago,
    updatePago,
    deletePago
} from "../models/pagoModels.js";

/* ----------------------- OBTENER TODOS LOS PAGOS ----------------------- */
export const listPagos = async (req, res) => {
    try {
        const pagos = await getAllPagos();
        return res.json(pagos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- OBTENER PAGO POR ID ----------------------- */
export const getPago = async (req, res) => {
    try {
        const { id } = req.params;
        const pago = await getPagoById(id);

        if (!pago) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }

        return res.json(pago);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- OBTENER PAGO POR PEDIDO ----------------------- */
export const getPagoPedido = async (req, res) => {
    try {
        const { id_pedido } = req.params;
        const pago = await getPagoByPedido(id_pedido);

        if (!pago) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }

        return res.json(pago);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- CREAR PAGO ----------------------- */
export const addPago = async (req, res) => {
    try {
        const { id_pedido, metodo, monto, fecha } = req.body;

        if (!id_pedido || !metodo || !monto || !fecha) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const pago = await createPago({ id_pedido, metodo, monto, fecha });
        return res.status(201).json({ message: "Pago registrado", pago });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- ACTUALIZAR PAGO ----------------------- */
export const editPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { metodo, monto, fecha } = req.body;

        const updated = await updatePago(id, { metodo, monto, fecha });

        if (!updated) {
            return res.status(404).json({ message: "Pago no encontrado o sin cambios" });
        }

        return res.json({ message: "Pago actualizado" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- ELIMINAR PAGO ----------------------- */
export const removePago = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await deletePago(id);

        if (!deleted) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }

        return res.json({ message: "Pago eliminado" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
