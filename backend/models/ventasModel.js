import pool from "../config/db.js";

/* =========================
   PEDIDOS
========================= */

export const getAllPedidos = async () => {
  const [rows] = await pool.query(`
    SELECT p.idPedido, p.id_usuario, p.direccion, p.fechaPedido,
           p.estado
    FROM pedidos p
    ORDER BY p.idPedido DESC
  `);
  return rows;
};

export const getPedidoById = async (id) => {
  const [pedidoRows] = await pool.query(
    "SELECT * FROM pedidos WHERE idPedido = ?",
    [id]
  );

  if (pedidoRows.length === 0) return null;
  const pedido = pedidoRows[0];

  const [detalles] = await pool.query(`
    SELECT d.idDetalle, d.id_producto, d.cantidad, d.precio
    FROM detalles_pedido d
    WHERE d.id_pedido = ?
  `, [id]);

  const [pago] = await pool.query(
    "SELECT * FROM pagos WHERE id_pedido = ?",
    [id]
  );

  return { ...pedido, detalles, pago: pago[0] || null };
};

export const createPedido = async ({ id_usuario, direccion, fechaPedido, estado = "pendiente" }) => {
  const [result] = await pool.query(`
    INSERT INTO pedidos (id_usuario, direccion, fechaPedido, estado)
    VALUES (?, ?, ?, ?)
  `, [id_usuario, direccion, fechaPedido, estado]);

  return { idPedido: result.insertId };
};

export const updatePedido = async (id, data) => {
  const [result] = await pool.query(
    "UPDATE pedidos SET ? WHERE idPedido = ?",
    [data, id]
  );
  return result.affectedRows > 0;
};

export const deletePedido = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pedidos WHERE idPedido = ?",
    [id]
  );
  return result.affectedRows > 0;
};

/* =========================
   DETALLES PEDIDO
========================= */

export const addDetallePedido = async (id_pedido, id_producto, cantidad) => {
  const [[producto]] = await pool.query(
    "SELECT precio FROM productos WHERE idProducto = ?",
    [id_producto]
  );

  if (!producto) throw new Error("Producto no encontrado");

  const [result] = await pool.query(`
    INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio)
    VALUES (?, ?, ?, ?)
  `, [id_pedido, id_producto, cantidad, producto.precio]);

  return { idDetalle: result.insertId };
};

export const deleteDetallesByPedido = async (id_pedido) => {
  const [result] = await pool.query(
    "DELETE FROM detalles_pedido WHERE id_pedido = ?",
    [id_pedido]
  );
  return result.affectedRows > 0;
};

export const getDetallePedidoByPedidoId = async (idPedido) => {
  const [rows] = await pool.query(`
    SELECT idDetalle, id_producto, cantidad, precio
    FROM detalles_pedido
    WHERE id_pedido = ?
  `, [idPedido]);

  return rows;
};

/* =========================
   PAGOS
========================= */

export const createPago = async ({ id_pedido, metodo, monto, fecha }) => {
  const [result] = await pool.query(`
    INSERT INTO pagos (id_pedido, metodo, monto, fecha)
    VALUES (?, ?, ?, ?)
  `, [id_pedido, metodo, monto, fecha]);

  return { idPago: result.insertId };
};

export const getPagoByPedido = async (id_pedido) => {
  const [rows] = await pool.query(
    "SELECT * FROM pagos WHERE id_pedido = ?",
    [id_pedido]
  );
  return rows[0] || null;
};

// ==========================
// PEDIDOS ADMIN
// ==========================
export const getAllPedidosAdmin = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.idPedido,
      u.nombre AS usuario,
      p.direccion,
      p.fechaPedido,
      p.estado
    FROM pedidos p
    JOIN usuarios u ON p.id_usuario = u.idUsuario
    ORDER BY p.idPedido DESC
  `);

  return rows;
};
