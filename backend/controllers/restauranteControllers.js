// controllers/restauranteController.js
import pool from "../db.js";

// Obtener all restaurantes
export const listRestaurantes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre AS propietario
            FROM restaurantes r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            ORDER BY r.idRestaurante DESC
        `);
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Obtener restaurante por ID
export const getRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre AS propietario
            FROM restaurantes r
            INNER JOIN usuarios u ON r.id_usuario = u.idUsuario
            WHERE r.idRestaurante = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Create restaurante
export const addRestaurante = async (req, res) => {
    try {
        const { nombreRestaurante, direccion, telefono, id_usuario } = req.body;

        if (!nombreRestaurante || !direccion || !telefono || !id_usuario) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const [result] = await pool.query(`
            INSERT INTO restaurantes (nombreRestaurante, direccion, telefono, id_usuario)
            VALUES (?, ?, ?, ?)
        `, [nombreRestaurante, direccion, telefono, id_usuario]);

        const nuevoRestaurante = {
            idRestaurante: result.insertId,
            nombreRestaurante,
            direccion,
            telefono,
            id_usuario
        };

        return res.status(201).json({ message: "Restaurante creado", restaurante: nuevoRestaurante });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Actualizar restaurante
export const editRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreRestaurante, direccion, telefono } = req.body;

        const [result] = await pool.query(`
            UPDATE restaurantes
            SET nombreRestaurante = ?, direccion = ?, telefono = ?
            WHERE idRestaurante = ?
        `, [nombreRestaurante, direccion, telefono, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Restaurante no encontrado o sin cambios" });
        }

        const [rows] = await pool.query(`SELECT * FROM restaurantes WHERE idRestaurante = ?`, [id]);
        return res.json({ message: "Restaurante actualizado", restaurante: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Eliminar restaurante
export const removeRestaurante = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(`
            DELETE FROM restaurantes WHERE idRestaurante = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        return res.json({ message: "Restaurante eliminado" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
