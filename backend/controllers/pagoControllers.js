// controllers/pagoControllers.js
import { createPago, getPagoByPedido } from "../models/ventasModel.js";

// Registro pago
export const addPago = async (req, res) => {
    try {
        const { id_pedido, metodo, monto, fecha } = req.body;

        if (!id_pedido || !metodo || !monto || !fecha) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const pago = await createPago({ id_pedido, metodo, monto, fecha });
        return res.status(201).json({ message: "Pago registrado", pago });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Pago por pedido
export const getPago = async (req, res) => {
    try {
        const { id_pedido } = req.params;

        const pago = await getPagoByPedido(id_pedido);

        if (!pago) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }

        return res.json(pago);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
