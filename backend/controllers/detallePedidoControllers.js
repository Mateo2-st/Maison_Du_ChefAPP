

import {
    getDetallesByPedido,
    createDetallePedido,
    updateDetallePedido,
    deleteDetallePedido
} from "../models/detallePedidoModels.js";

// Obtener detalles de pedido
export const listDetalles = async (req, res) => {
    try {
        const { id_pedido } = req.params;

        const detalles = await getDetallesByPedido(id_pedido);
        return res.json(detalles);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Crear detalle
export const addDetalle = async (req, res) => {
    try {
        const { id_pedido, id_producto, cantidad } = req.body;

        if (!id_pedido || !id_producto || !cantidad) {
            return res.status(400).json({ message: "Faltan datos" });
        }

        const detalle = await createDetallePedido({ id_pedido, id_producto, cantidad });

        return res.status(201).json({
            message: "Detalle agregado",
            detalle
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Actualizar detalle de pedido
export const editDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;

        const updated = await updateDetallePedido(id, { cantidad });

        if (!updated) {
            return res.status(404).json({ message: "Detalle no encontrado o sin cambios" });
        }

        return res.json({ message: "Detalle actualizado" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Eliminar detalle
export const removeDetalle = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await deleteDetallePedido(id);

        if (!deleted) {
            return res.status(404).json({ message: "Detalle no encontrado" });
        }

        return res.json({ message: "Detalle eliminado" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
