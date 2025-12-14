import pool from "../config/db.js";

/* =========================
   OBTENER TODOS
========================= */
export const getAllRestaurantes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM restaurantes");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener restaurantes" });
  }
};

/* =========================
   OBTENER POR DUEÑO
========================= */
export const getRestaurantesByDueno = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM restaurantes WHERE id_usuario = ?",
      [id_usuario]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener restaurantes del dueño" });
  }
};

/* =========================
   CREAR
========================= */
export const createRestaurante = async (req, res) => {
  try {
    const { nombreRestaurante, direccion, telefono, id_usuario, imagen } = req.body;

    const [result] = await pool.query(
      `INSERT INTO restaurantes
       (nombreRestaurante, direccion, telefono, id_usuario, imagen)
       VALUES (?, ?, ?, ?, ?)`,
      [nombreRestaurante, direccion, telefono, id_usuario, imagen || null]
    );

    res.status(201).json({
      idRestaurante: result.insertId,
      nombreRestaurante,
      direccion,
      telefono,
      id_usuario
    });
  } catch (error) {
    console.error("ERROR CREAR:", error);
    res.status(500).json({ message: "Error al crear restaurante" });
  }
};

/* =========================
   ACTUALIZAR (EDITAR) ✅
========================= */
export const updateRestaurante = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreRestaurante, direccion, telefono, imagen } = req.body;

    console.log("EDITANDO RESTAURANTE ID:", id);
    console.log("DATA:", req.body);

    const [result] = await pool.query(
      `UPDATE restaurantes
       SET nombreRestaurante = ?,
           direccion = ?,
           telefono = ?,
           imagen = ?
       WHERE idRestaurante = ?`,
      [nombreRestaurante, direccion, telefono, imagen || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No se actualizó ningún restaurante"
      });
    }

    res.json({ message: "Restaurante actualizado correctamente" });
  } catch (error) {
    console.error("ERROR UPDATE:", error);
    res.status(500).json({ message: "Error al actualizar restaurante" });
  }
};

/* =========================
   ELIMINAR
========================= */
export const deleteRestaurante = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM restaurantes WHERE idRestaurante = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Restaurante no encontrado"
      });
    }

    res.json({ message: "Restaurante eliminado correctamente" });
  } catch (error) {
    console.error("ERROR DELETE:", error);
    res.status(500).json({ message: "Error al eliminar restaurante" });
  }
};
