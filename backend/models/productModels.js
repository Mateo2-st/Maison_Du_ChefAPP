import pool from "../config/db.js";

/* =========================
   TODOS LOS PRODUCTOS (PÚBLICO / ADMIN)
========================= */
export const getAllProductsDB = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.idProducto,
      p.nombreProducto,
      p.precio,
      p.id_restaurante,
      r.nombreRestaurante,
      c.nombreCategoria
    FROM productos p
    INNER JOIN restaurantes r ON p.id_restaurante = r.idRestaurante
    INNER JOIN categorias c ON p.id_categoria = c.idCategoria
    ORDER BY p.idProducto DESC
  `);
  return rows;
};

/* =========================
   PRODUCTOS POR DUEÑO (VENDEDOR)
========================= */
export const getProductsByDueno = async (idUsuario) => {
  const [rows] = await pool.query(`
    SELECT 
      p.idProducto,
      p.nombreProducto,
      p.precio,
      p.id_restaurante,
      r.nombreRestaurante,
      c.nombreCategoria
    FROM productos p
    INNER JOIN restaurantes r ON p.id_restaurante = r.idRestaurante
    INNER JOIN categorias c ON p.id_categoria = c.idCategoria
    WHERE r.id_usuario = ?
    ORDER BY p.idProducto DESC
  `, [idUsuario]);

  return rows;
};

/* =========================
   PRODUCTO POR ID
========================= */
export const getProductByIdDB = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM productos WHERE idProducto = ?",
    [id]
  );
  return rows[0];
};

/* =========================
   CREAR PRODUCTO
========================= */
export const createProductDB = async ({
  nombreProducto,
  precio,
  id_restaurante,
  id_categoria
}) => {
  const [result] = await pool.query(
    `INSERT INTO productos
     (nombreProducto, precio, disponible, id_restaurante, id_categoria)
     VALUES (?, ?, 1, ?, ?)`,
    [nombreProducto, precio, id_restaurante, id_categoria]
  );

  return {
    idProducto: result.insertId,
    nombreProducto,
    precio
  };
};

/* =========================
   ACTUALIZAR
========================= */
export const updateProductDB = async (id, data) => {
  const [result] = await pool.query(
    "UPDATE productos SET ? WHERE idProducto = ?",
    [data, id]
  );
  return result;
};

/* =========================
   ELIMINAR
========================= */
export const deleteProductDB = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM productos WHERE idProducto = ?",
    [id]
  );
  return result;
};
