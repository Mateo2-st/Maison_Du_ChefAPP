import pool from "../config/db.js";

/* =========================
   LISTAR PRODUCTOS DEL VENDEDOR
========================= */
export const getAllProducts = async (req, res) => {
  try {
    const idUsuario = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        p.idProducto,
        p.nombreProducto,
        p.precio,
        c.nombreCategoria,
        r.nombreRestaurante
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.idCategoria
       JOIN restaurantes r ON p.id_restaurante = r.idRestaurante
       WHERE r.id_usuario = ?`,
      [idUsuario]
    );

    res.json(rows);
  } catch (error) {
    console.error("ERROR GET PRODUCTS:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

/* =========================
   OBTENER PRODUCTO POR ID
========================= */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM productos WHERE idProducto = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("ERROR GET PRODUCT:", error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};

/* =========================
   PRODUCTOS POR RESTAURANTE (CATÁLOGO)
========================= */
export const getProductsByRestaurante = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        idProducto,
        nombreProducto,
        precio
       FROM productos
       WHERE id_restaurante = ?
         AND disponible = 1`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error("ERROR GET PRODUCTS BY RESTAURANTE:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

/* =========================
   CREAR PRODUCTO
========================= */
export const createProduct = async (req, res) => {
  try {
    const { nombreProducto, precio, id_categoria, id_restaurante } = req.body;

    const [rest] = await pool.query(
      `SELECT idRestaurante FROM restaurantes
       WHERE idRestaurante = ? AND id_usuario = ?`,
      [id_restaurante, req.user.id]
    );

    if (rest.length === 0) {
      return res.status(403).json({
        message: "No puedes agregar productos a un restaurante que no es tuyo"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO productos
       (nombreProducto, precio, id_categoria, id_restaurante, disponible)
       VALUES (?, ?, ?, ?, 1)`,
      [nombreProducto, precio, id_categoria, id_restaurante]
    );

    res.status(201).json({
      idProducto: result.insertId,
      nombreProducto,
      precio
    });
  } catch (error) {
    console.error("ERROR CREATE PRODUCT:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

/* =========================
   ACTUALIZAR PRODUCTO
========================= */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreProducto, precio, id_categoria } = req.body;

    const [result] = await pool.query(
      `UPDATE productos
       SET nombreProducto = ?, precio = ?, id_categoria = ?
       WHERE idProducto = ?`,
      [nombreProducto, precio, id_categoria, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no actualizado" });
    }

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("ERROR UPDATE PRODUCT:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

/* =========================
   ELIMINAR PRODUCTO
========================= */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM productos WHERE idProducto = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("ERROR DELETE PRODUCT:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};
