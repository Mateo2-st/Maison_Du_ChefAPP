import pool from "../config/db.js"

/* Obtener todos los pagos con información del pedido */
export const getAllPagos = async () => {
    const [rows] = await pool.query(`
        SELECT pg.*, p.direccion, p.fechaPedido, p.estado
        FROM pagos pg
        INNER JOIN pedidos p ON pg.id_pedido = p.idPedido
        ORDER BY pg.idPago DESC
    `);

    return rows;
};

/* Obtener un pago por ID */
export const getPagoById = async (id) => {
    const [rows] = await pool.query(`
        SELECT pg.*, p.direccion, p.fechaPedido, p.estado
        FROM pagos pg
        INNER JOIN pedidos p ON pg.id_pedido = p.idPedido
        WHERE pg.idPago = ?
    `, [id]);

    return rows[0] || null;
};

/* Obtener pago por pedido */
export const getPagoByPedido = async (id_pedido) => {
    const [rows] = await pool.query(`
        SELECT * FROM pagos WHERE id_pedido = ?
    `, [id_pedido]);

    return rows[0] || null;
};

/* Crear un pago */
export const createPago = async ({ id_pedido, metodo, monto, fecha }) => {
    const [result] = await pool.query(`
        INSERT INTO pagos (id_pedido, metodo, monto, fecha)
        VALUES (?, ?, ?, ?)
    `, [id_pedido, metodo, monto, fecha]);

    return {
        idPago: result.insertId,
        id_pedido,
        metodo,
        monto,
        fecha
    };
};

/* Actualizar un pago */
export const updatePago = async (id, { metodo, monto, fecha }) => {
    const [result] = await pool.query(`
        UPDATE pagos
        SET metodo = ?, monto = ?, fecha = ?
        WHERE idPago = ?
    `, [metodo, monto, fecha, id]);

    return result.affectedRows > 0;
};

/* Eliminar un pago */
export const deletePago = async (id) => {
    const [result] = await pool.query(`
        DELETE FROM pagos WHERE idPago = ?
    `, [id]);

    return result.affectedRows > 0;
};
