import pool from "../config/db.js"


    // Obtener todas las reseñas con usuario y producto
    export const getAllResenias = async () => {
        const [rows] = await pool.query(`
            SELECT r.*, 
            u.nombre AS nombreUsuario,
            p.nombreProducto
            FROM resenas r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            INNER JOIN productos p ON r.id_producto = p.idProducto
            ORDER BY r.idResena DESC
        `);

        return rows;
    };

    // Obtener reseñas por producto 
    export const getReseniasByProducto = async (id_producto) => {
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre AS nombreUsuario
            FROM resenas r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            WHERE r.id_producto = ?
            ORDER BY r.fecha DESC
        `, [id_producto]);

        return rows;
    };

    // Obtener una reseña por ID 
    export const getReseniaById = async (id) => {
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre AS nombreUsuario, p.nombreProducto
            FROM resenas r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            INNER JOIN productos p ON r.id_producto = p.idProducto
            WHERE r.idResena = ?
        `, [id]);

        return rows[0] || null;
    };

    // Crear una reseña 
    export const createResenia = async ({ id_usuario, id_producto, comentario, calificacion, fecha }) => {
        const [result] = await pool.query(`
            INSERT INTO resenas (id_usuario, id_producto, comentario, calificacion, fecha)
            VALUES (?, ?, ?, ?, ?)
        `, [id_usuario, id_producto, comentario, calificacion, fecha]);

        return {
            idResena: result.insertId,
            id_usuario,
            id_producto,
            comentario,
            calificacion,
            fecha
        };
    };

    // Actualizar reseña
    export const updateResenia = async (id, data) => {
        const { comentario, calificacion } = data;

        const [result] = await pool.query(`
            UPDATE resenas
            SET comentario = ?, calificacion = ?
            WHERE idResena = ?
        `, [comentario, calificacion, id]);

        return result.affectedRows > 0;
    };

    // Eliminar reseña
    export const deleteResenia = async (id) => {
        const [result] = await pool.query(`
            DELETE FROM resenas WHERE idResena = ?
        `, [id]);

        return result.affectedRows > 0;
    };
