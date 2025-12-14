// controllers/ventasController.js
import {
    getAllPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido,
    addDetallePedido,
    deleteDetallesByPedido,
    createPago,
    getPagoByPedido
} from "../models/ventasModel.js";

// todos los pedidos
export const listPedidos = async (req, res) => {
    try {
        const pedidos = await getAllPedidos();
        return res.json(pedidos);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Pedido por id
export const getPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await getPedidoById(id);

        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        return res.json(pedido);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// crear pedido
export const addPedido = async (req, res) => {
    try {
        const { id_usuario, direccion, fechaPedido, detalles } = req.body;

        if (!id_usuario || !direccion || !fechaPedido || !Array.isArray(detalles)) {
            return res.status(400).json({ message: "Faltan campos obligatorios o detalles inválidos" });
        }

        // Crear pedido
        const pedido = await createPedido({ id_usuario, direccion, fechaPedido });

        // Insertar detalles
        for (const item of detalles) {
            const { id_producto, cantidad } = item;
            await addDetallePedido(pedido.idPedido, id_producto, cantidad);
        }

        return res.status(201).json({ message: "Pedido creado", pedido });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Actualizar pedido
export const editPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { direccion, fechaPedido, estado, detalles } = req.body;

        const updated = await updatePedido(id, { direccion, fechaPedido, estado });

        if (!updated) {
            return res.status(404).json({ message: "Pedido no encontrado o sin cambios" });
        }

        if (Array.isArray(detalles)) {
            // Borrar detalles antiguos y agregar nuevos
            await deleteDetallesByPedido(id);
            for (const item of detalles) {
                const { id_producto, cantidad } = item;
                await addDetallePedido(id, id_producto, cantidad);
            }
        }

        const pedidoActualizado = await getPedidoById(id);
        return res.json({ message: "Pedido actualizado", pedido: pedidoActualizado });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// eliminar pedido
export const removePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deletePedido(id);

        if (!deleted) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        return res.json({ message: "Pedido eliminado" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// registro pago
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

// obtener pago por pedido
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
