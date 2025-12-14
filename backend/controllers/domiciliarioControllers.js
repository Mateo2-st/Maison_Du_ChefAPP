import pool from "../config/db.js";

/* Obtener pedidos disponibles para domiciliarios (con estado pendiente) */
export const getPedidosDisponibles = async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT 
        p.idPedido as id,
        p.id_usuario,
        p.direccion as direccion_entrega,
        p.fechaPedido,
        p.estado,
        u.nombre as nombre_cliente,
        u.correo as correo_cliente,
        GROUP_CONCAT(pr.nombreProducto SEPARATOR ', ') as producto,
        SUM(pr.precio * dp.cantidad) as total,
        r.nombreRestaurante as restaurante,
        pg.metodo as metodo_pago,
        '30 min' as tiempo_estimado
      FROM pedidos p
      INNER JOIN usuarios u ON p.id_usuario = u.idUsuario
      LEFT JOIN detalles_pedido dp ON p.idPedido = dp.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.idProducto
      LEFT JOIN restaurantes r ON pr.id_restaurante = r.idRestaurante
      LEFT JOIN pagos pg ON p.idPedido = pg.id_pedido
      WHERE p.estado = 'pendiente'
      GROUP BY p.idPedido, p.direccion, p.fechaPedido, p.estado, u.nombre, u.correo, r.nombreRestaurante, pg.metodo
      ORDER BY p.fechaPedido DESC
    `);

    return res.json(pedidos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

/* Obtener pedidos públicos (sin autenticación) */
export const getPedidosPublicos = async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT 
        p.idPedido as id,
        p.direccion as direccion_entrega,
        p.fechaPedido,
        GROUP_CONCAT(pr.nombreProducto SEPARATOR ', ') as producto,
        SUM(pr.precio * dp.cantidad) as total,
        r.nombreRestaurante as restaurante,
        pg.metodo as metodo_pago
      FROM pedidos p
      LEFT JOIN detalles_pedido dp ON p.idPedido = dp.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.idProducto
      LEFT JOIN restaurantes r ON pr.id_restaurante = r.idRestaurante
      LEFT JOIN pagos pg ON p.idPedido = pg.id_pedido
      WHERE p.estado = 'pendiente'
      GROUP BY p.idPedido, p.direccion, p.fechaPedido, r.nombreRestaurante, pg.metodo
      ORDER BY p.fechaPedido DESC
    `);

    return res.json(pedidos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al obtener pedidos públicos" });
  }
};

/* Aceptar un pedido (domiciliario asignado) */
export const aceptarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const domiciliarioId = req.user.id; // Del token JWT

    // Verificar que el pedido existe y está pendiente
    const [pedido] = await pool.query(
      `SELECT * FROM pedidos WHERE idPedido = ? AND estado = 'pendiente'`,
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado o ya asignado" });
    }

    // Actualizar estado a 'en_camino' y asignar domiciliario
    let result;
    try {
      [result] = await pool.query(
        `UPDATE pedidos SET estado = 'en_camino', id_domiciliario = ? WHERE idPedido = ?`,
        [domiciliarioId, id]
      );
    } catch (updateErr) {
      // Si la columna id_domiciliario no existe en este esquema, intentar crearla y reintentar
      if (updateErr && (updateErr.code === 'ER_BAD_FIELD_ERROR' || /Unknown column 'id_domiciliario'/.test(updateErr.message))) {
        console.warn('Columna id_domiciliario no encontrada, creando columna...');
        try {
          // Añadir la columna sin forzar la llave foránea para evitar errores en esquemas ligeros
          await pool.query(`ALTER TABLE pedidos ADD COLUMN id_domiciliario INT NULL`);
          // Reintentar la actualización
          const [retry] = await pool.query(
            `UPDATE pedidos SET estado = 'en_camino', id_domiciliario = ? WHERE idPedido = ?`,
            [domiciliarioId, id]
          );
          result = retry;
        } catch (mErr) {
          console.error('Error al añadir columna id_domiciliario o reintentar update:', mErr);
          throw mErr;
        }
      } else {
        throw updateErr;
      }
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo aceptar el pedido" });
    }

    return res.json({ 
      message: "Pedido aceptado correctamente",
      pedidoId: id 
    });
  } catch (err) {
    console.error(err.stack || err);
    return res.status(500).json({ message: "Error al aceptar pedido", error: err.message });
  }
};

/* Rechazar un pedido */
export const rechazarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el pedido existe y está pendiente
    const [pedido] = await pool.query(
      `SELECT * FROM pedidos WHERE idPedido = ? AND estado = 'pendiente'`,
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado o ya rechazado" });
    }

    // El pedido sigue con estado 'pendiente' para que otro domiciliario lo pueda aceptar
    return res.json({ 
      message: "Pedido rechazado correctamente",
      pedidoId: id 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al rechazar pedido" });
  }
};

/* Marcar un pedido como entregado (solo domiciliario asignado) */
export const entregadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const domiciliarioId = req.user.id;

    // Verificar que el pedido existe, está en camino y asignado al domiciliario
    const [pedido] = await pool.query(
      `SELECT * FROM pedidos WHERE idPedido = ? AND id_domiciliario = ? AND estado = 'en_camino'`,
      [id, domiciliarioId]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado o no asignado a ti" });
    }

    const [result] = await pool.query(
      `UPDATE pedidos SET estado = 'entregado' WHERE idPedido = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo marcar como entregado" });
    }

    return res.json({ message: "Pedido marcado como entregado", pedidoId: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al marcar pedido como entregado" });
  }
};

/* Obtener pedidos asignados al domiciliario autenticado */
export const getMisPedidos = async (req, res) => {
  try {
    const domiciliarioId = req.user.id;

    const [pedidos] = await pool.query(`
      SELECT 
        p.idPedido as id,
        p.id_usuario,
        p.direccion as direccion_entrega,
        p.fechaPedido,
        p.estado,
        u.nombre as nombre_cliente,
        u.correo as correo_cliente,
        u.id_rol,
        GROUP_CONCAT(pr.nombreProducto SEPARATOR ', ') as producto,
        SUM(pr.precio * dp.cantidad) as total,
        r.nombreRestaurante as restaurante,
        pg.metodo as metodo_pago
      FROM pedidos p
      INNER JOIN usuarios u ON p.id_usuario = u.idUsuario
      LEFT JOIN detalles_pedido dp ON p.idPedido = dp.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.idProducto
      LEFT JOIN restaurantes r ON pr.id_restaurante = r.idRestaurante
      LEFT JOIN pagos pg ON p.idPedido = pg.id_pedido
      WHERE p.id_domiciliario = ? AND p.estado IN ('en_camino', 'entregado')
      GROUP BY p.idPedido, p.direccion, p.fechaPedido, p.estado, u.nombre, u.correo, r.nombreRestaurante, pg.metodo
      ORDER BY p.fechaPedido DESC
    `, [domiciliarioId]);

    return res.json(pedidos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al obtener tus pedidos" });
  }
};
