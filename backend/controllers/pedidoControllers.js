import {
  getAllPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  deletePedido,
  addDetallePedido,
  deleteDetallesByPedido,
  getDetallePedidoByPedidoId
} from "../models/ventasModel.js";

/* ----------------------- OBTENER TODOS LOS PEDIDOS ----------------------- */
export const listPedidos = async (req, res) => {
  try {
    const pedidos = await getAllPedidos();
    return res.json(pedidos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

/* ----------------------- OBTENER PEDIDO POR ID ----------------------- */
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

/* ----------------------- CREAR PEDIDO ----------------------- */
export const addPedido = async (req, res) => {
  try {
    const { id_usuario, direccion, fechaPedido, estado, detalles } = req.body;

    if (!id_usuario || !direccion || !fechaPedido || !Array.isArray(detalles)) {
      return res.status(400).json({
        message: "Faltan campos o detalles incorrectos"
      });
    }

    const pedido = await createPedido({
      id_usuario,
      direccion,
      fechaPedido,
      estado
    });

    for (const item of detalles) {
      const { id_producto, cantidad } = item;
      if (!id_producto || !cantidad) continue;
      await addDetallePedido(pedido.idPedido, id_producto, cantidad);
    }

    const nuevoPedido = await getPedidoById(pedido.idPedido);

    return res.status(201).json({
      message: "Pedido creado",
      pedido: nuevoPedido
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

/* ----------------------- ACTUALIZAR PEDIDO ----------------------- */
export const editPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { direccion, fechaPedido, estado, detalles } = req.body;

    const updated = await updatePedido(id, {
      direccion,
      fechaPedido,
      estado
    });

    if (!updated) {
      return res.status(404).json({
        message: "Pedido no encontrado o sin cambios"
      });
    }

    if (detalles && Array.isArray(detalles)) {
      await deleteDetallesByPedido(id);

      for (const item of detalles) {
        const { id_producto, cantidad } = item;
        if (!id_producto || !cantidad) continue;
        await addDetallePedido(id, id_producto, cantidad);
      }
    }

    const pedidoActualizado = await getPedidoById(id);

    return res.json({
      message: "Pedido actualizado",
      pedido: pedidoActualizado
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

/* ----------------------- ELIMINAR PEDIDO ----------------------- */
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

/* ----------------------- DETALLE PEDIDO (ADMIN) ----------------------- */
export const getDetallePedidoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const detalles = await getDetallePedidoByPedidoId(id);
    if (!detalles || detalles.length === 0) {
      return res.status(404).json({
        message: "No hay detalles para este pedido"
      });
    }

    return res.json({
      idPedido: id,
      totalItems: detalles.length,
      detalles
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

/* =========================
   PEDIDOS - ADMIN
========================= */
export const getPedidosAdmin = async (req, res) => {
  try {
    const pedidos = await getAllPedidos();
    return res.json(pedidos);
  } catch (error) {
    console.error("ERROR ADMIN PEDIDOS:", error);
    return res.status(500).json({
      message: "Error al obtener pedidos (admin)"
    });
  }
};

