import pool from '../backend/config/db.js';

(async () => {
  try {
    const [rows] = await pool.query(`
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

    console.log('ROWS:', rows);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
})();
