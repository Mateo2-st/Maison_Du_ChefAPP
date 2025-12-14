// controllers/reseniaController.js
import pool from "../db.js";

/* ----------------------- OBTENER TODAS LAS RESEÑAS ----------------------- */
export const listResenas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre AS usuario, p.nombreProducto AS producto
            FROM resenas r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            INNER JOIN productos p ON r.id_producto = p.idProducto
            ORDER BY r.fecha DESC
        `);
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- OBTENER RESEÑA POR ID ----------------------- */
export const getResena = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre AS usuario, p.nombreProducto AS producto
            FROM resenas r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            INNER JOIN productos p ON r.id_producto = p.idProducto
            WHERE r.idResena = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/* ----------------------- CREAR RESEÑA ----------------------- */
export const addResena = async (req, res) => {
    try {
        const { id_usuario, id_producto, comentario, calificacion, fecha } = req.body;

        if (!id_usuario || !id_producto || !calificacion || !fecha) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const [result] = await pool.query(`
            INSERT INTO resenas (id_usuario, id_producto, comentario, calificacion, fecha)
            VALUES (?, ?, ?, ?, ?)
        `, [id_usuario, id_producto, comentario, calificacion, fecha]);

        const nuevaResena = {
            idResena: result.insertId,
            id_usuario,
            id_producto,
            comentario,
            calificacion,
            fecha
        };

        return res.status(201).json({ message: "Reseña creada", resena: nuevaResena });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// ACt reseña
export const editResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { comentario, calificacion } = req.body;

        const [result] = await pool.query(`
            UPDATE resenas
            SET comentario = ?, calificacion = ?
            WHERE idResena = ?
        `, [comentario, calificacion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Reseña no encontrada o sin cambios" });
        }

        const [rows] = await pool.query(`SELECT * FROM resenas WHERE idResena = ?`, [id]);
        return res.json({ message: "Reseña actualizada", resena: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// borrar reseña
export const removeResena = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(`
            DELETE FROM resenas WHERE idResena = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        return res.json({ message: "Reseña eliminada" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
