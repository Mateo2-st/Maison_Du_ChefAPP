import pool from "../config/db.js"

/* Obtener todas las categorías */
export const getAllCategorias = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM categorias ORDER BY idCategoria DESC"
    );
    return rows;
};

/* Obtener una categoría por ID */
export const getCategoriaById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM categorias WHERE idCategoria = ?",
        [id]
    );
    return rows[0] || null;
};

/* Crear una nueva categoría */
export const createCategoria = async ({ nombreCategoria }) => {
    const [result] = await pool.query(
        "INSERT INTO categorias (nombreCategoria) VALUES (?)",
        [nombreCategoria]
    );

    return { idCategoria: result.insertId, nombreCategoria };
};

/* Actualizar una categoría */
export const updateCategoria = async (id, { nombreCategoria }) => {
    const [result] = await pool.query(
        "UPDATE categorias SET nombreCategoria = ? WHERE idCategoria = ?",
        [nombreCategoria, id]
    );

    return result.affectedRows > 0;
};

/* Eliminar una categoría */
export const deleteCategoria = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM categorias WHERE idCategoria = ?",
        [id]
    );

    return result.affectedRows > 0;
};
