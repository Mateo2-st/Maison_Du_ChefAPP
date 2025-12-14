import pool from "../config/db.js"

/* Obtener todos los pedidos con información del usuario */
export const getAllPedidos = async () => {
    const [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombreUsuario, u.correo AS correoUsuario
        FROM pedidos p
        INNER JOIN usuarios u ON p.id_usuario = u.idUsuario
        ORDER BY p.idPedido DESC
    `);

    return rows;
};

/* Obtener un pedido por ID */
export const getPedidoById = async (id) => {
    const [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombreUsuario, u.correo AS correoUsuario
        FROM pedidos p
        INNER JOIN usuarios u ON p.id_usuario = u.idUsuario
        WHERE p.idPedido = ?
    `, [id]);

    return rows[0] || null;
};

/* Crear un pedido */
export const createPedido = async ({ id_usuario, direccion, fechaPedido, estado = "pendiente" }) => {
    const [result] = await pool.query(`
        INSERT INTO pedidos (id_usuario, direccion, fechaPedido, estado)
        VALUES (?, ?, ?, ?)
    `, [id_usuario, direccion, fechaPedido, estado]);

    return {
        idPedido: result.insertId,
        id_usuario,
        direccion,
        fechaPedido,
        estado
    };
};

/* Actualizar un pedido */
export const updatePedido = async (id, { direccion, fechaPedido, estado }) => {
    const [result] = await pool.query(`
        UPDATE pedidos
        SET direccion = ?, fechaPedido = ?, estado = ?
        WHERE idPedido = ?
    `, [direccion, fechaPedido, estado, id]);

    return result.affectedRows > 0;
};

/* Eliminar un pedido */
export const deletePedido = async (id) => {
    const [result] = await pool.query(`
        DELETE FROM pedidos WHERE idPedido = ?
    `, [id]);

    return result.affectedRows > 0;
};

