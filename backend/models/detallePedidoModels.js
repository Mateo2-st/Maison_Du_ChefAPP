import pool from "../config/db.js"

/* Obtener detalles de un pedido */
export const getDetallesByPedido = async (id_pedido) => {
    const [rows] = await pool.query(`
        SELECT d.*, 
        p.nombreProducto, 
        p.precio
        FROM detalles_pedido d
        INNER JOIN productos p ON d.id_producto = p.idProducto
        WHERE d.id_pedido = ?
    `, [id_pedido]);

    return rows;
};

/* Agregar un producto al pedido */
export const createDetallePedido = async ({ id_pedido, id_producto, cantidad }) => {
    const [result] = await pool.query(`
        INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad)
        VALUES (?, ?, ?)
    `, [id_pedido, id_producto, cantidad]);

    return {
        idDetalle: result.insertId,
        id_pedido,
        id_producto,
        cantidad
    };
};

/* Actualizar un detalle del pedido */
export const updateDetallePedido = async (id, { cantidad }) => {
    const [result] = await pool.query(`
        UPDATE detalles_pedido 
        SET cantidad = ?
        WHERE idDetalle = ?
    `, [cantidad, id]);

    return result.affectedRows > 0;
};

/* Eliminar un detalle */
export const deleteDetallePedido = async (id) => {
    const [result] = await pool.query(`
        DELETE FROM detalles_pedido WHERE idDetalle = ?
    `, [id]);

    return result.affectedRows > 0;
};

/* Eliminar todos los detalles de un pedido */
export const deleteDetallesByPedido = async (id_pedido) => {
    const [result] = await pool.query(`
        DELETE FROM detalles_pedido WHERE id_pedido = ?
    `, [id_pedido]);

    return result.affectedRows > 0;
};
