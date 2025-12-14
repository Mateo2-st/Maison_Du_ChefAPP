import pool from "../config/db.js";

export const checkProductOwner = async (req, res, next) => {
  try {
    const idProducto = req.params.id;
    const idUsuario = req.user.id;

    const [rows] = await pool.query(
      `SELECT r.id_usuario
       FROM productos p
       JOIN restaurantes r ON p.id_restaurante = r.idRestaurante
       WHERE p.idProducto = ?`,
      [idProducto]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (rows[0].id_usuario !== idUsuario) {
      return res.status(403).json({
        message: "No puedes modificar productos de otro restaurante"
      });
    }

    next();
  } catch (error) {
    console.error("checkProductOwner:", error);
    res.status(500).json({ message: "Error de permisos del producto" });
  }
};
