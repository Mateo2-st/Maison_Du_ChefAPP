import pool from "../config/db.js"


/*Obtener todos los roles*/
export const getAllRoles = async () => {
    const [rows] = await pool.query(`SELECT * FROM roles ORDER BY idRol ASC`);
    return rows;
};

/*Obtener rol por ID*/
export const getRoleById = async (id) => {
    const [rows] = await pool.query(
        `SELECT * FROM roles WHERE idRol = ?`,
        [id]
    );
    return rows[0];
};

/*Crear un rol*/
export const createRole = async (nombreRol) => {
    const [result] = await pool.query(
        `INSERT INTO roles (nombreRol) VALUES (?)`,
        [nombreRol]
    );

    return { id: result.insertId, nombreRol };
};

/* Actualizar un rol*/
export const updateRole = async (id, nombreRol) => {
    const [result] = await pool.query(
        `UPDATE roles SET nombreRol = ? WHERE idRol = ?`,
        [nombreRol, id]
    );

    return result.affectedRows > 0;
};

/* Eliminar un rol*/
export const deleteRole = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM roles WHERE idRol = ?`,
        [id]
    );

    return result.affectedRows > 0;
};

/* Obtener rol por nombre */
export const getRoleByName = async (nombreRol) => {
    const [rows] = await pool.query(
        "SELECT * FROM roles WHERE nombreRol = ?",
        [nombreRol]
    );
    return rows[0] || null;
};