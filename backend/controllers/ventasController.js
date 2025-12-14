import pool from "../config/db.js";

import {
  getAllPedidos,
  getPedidoById,
  createPedido,
  addDetallePedido,
  createPago
} from "../models/ventasModel.js";

/* =========================
   LISTAR
========================= */
export const listPedidos = async (req, res) => {
  try {
    res.json(await getAllPedidos());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/* =========================
   OBTENER
========================= */
export const getPedido = async (req, res) => {
  const pedido = await getPedidoById(req.params.id);
  if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });
  res.json(pedido);
};

/* =========================
   CREAR PEDIDO
========================= */
export const addPedido = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { direccion, fechaPedido, detalles } = req.body;

    if (!direccion || !fechaPedido || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const pedido = await createPedido({ id_usuario, direccion, fechaPedido });

    for (const item of detalles) {
      await addDetallePedido(pedido.idPedido, item.id_producto, item.cantidad);
    }

    res.status(201).json({ message: "Pedido creado", pedido });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/* =========================
   REGISTRAR PAGO
========================= */
export const addPago = async (req, res) => {
  try {
    const pago = await createPago(req.body);
    res.status(201).json({ message: "Pago registrado", pago });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/* =========================
   MIS PEDIDOS (USUARIO LOGUEADO)
========================= */
export const getMisPedidos = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        p.idPedido,
        p.fechaPedido,
        p.estado,
        r.nombreRestaurante,
        d.cantidad,
        d.precio,
        pr.nombreProducto
      FROM pedidos p
      INNER JOIN detalles_pedido d ON p.idPedido = d.id_pedido
      INNER JOIN productos pr ON d.id_producto = pr.idProducto
      INNER JOIN restaurantes r ON pr.id_restaurante = r.idRestaurante
      WHERE p.id_usuario = ?
      ORDER BY p.idPedido DESC
    `, [id_usuario]);

    res.json(rows);

  } catch (err) {
    console.error("ERROR getMisPedidos:", err);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

export const getPedidosRestaurante = async (req, res) => {
  try {
    const idVendedor = req.user.id; // viene del token

    const [rows] = await pool.query(`
      SELECT
        p.idPedido,
        p.estado,
        u.nombre AS cliente,
        pr.nombreProducto,
        d.cantidad,
        d.precio
      FROM pedidos p
      INNER JOIN usuarios u ON p.id_usuario = u.idUsuario
      INNER JOIN detalles_pedido d ON p.idPedido = d.id_pedido
      INNER JOIN productos pr ON d.id_producto = pr.idProducto
      INNER JOIN restaurantes r ON pr.id_restaurante = r.idRestaurante
      WHERE r.id_usuario = ?
      ORDER BY p.idPedido DESC
    `, [idVendedor]);

    res.json(rows);

  } catch (err) {
    console.error("ERROR pedidos restaurante:", err);
    res.status(500).json({ message: "Error al obtener pedidos del restaurante" });
  }
};

export const getTodosLosPedidosAdmin = async (req, res) => {
  try {
    // Seguridad: solo admin
    if (req.user.rol !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const [rows] = await pool.query(`
      SELECT
        p.idPedido,
        p.direccion,
        p.fechaPedido,
        p.estado,
        u.nombre AS usuario,
        r.nombreRestaurante,
        pr.nombreProducto,
        d.cantidad,
        d.precio
      FROM pedidos p
      INNER JOIN usuarios u ON p.id_usuario = u.idUsuario
      INNER JOIN detalles_pedido d ON p.idPedido = d.id_pedido
      INNER JOIN productos pr ON d.id_producto = pr.idProducto
      INNER JOIN restaurantes r ON pr.id_restaurante = r.idRestaurante
      ORDER BY p.idPedido DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("Error admin pedidos:", err);
    res.status(500).json({ message: "Error al obtener pedidos (admin)" });
  }
};

