import pool from "../config/db.js";

/* --------- QUERIES --------- */

export const findUserByEmail = async (correo) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.nombreRol AS rol
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.idRol
     WHERE u.correo = ?`,
    [correo]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT u.idUsuario, u.nombre, u.correo, r.nombreRol AS rol
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.idRol
     WHERE u.idUsuario = ?`,
    [id]
  );
  return rows[0] || null;
};

export const getAllUsers = async () => {
  const [rows] = await pool.query(`
    SELECT u.idUsuario, u.nombre, u.correo, r.nombreRol AS rol
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.idRol
    ORDER BY u.idUsuario ASC
  `);
  return rows;
};

export const createUser = async ({ nombre, correo, contrasena, id_rol }) => {
  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, id_rol)
     VALUES (?, ?, ?, ?)`,
    [nombre, correo, contrasena, id_rol]
  );
  return result.insertId;
};

export const updateUserRole = async (id, id_rol) => {
  await pool.query(
    `UPDATE usuarios SET id_rol = ? WHERE idUsuario = ?`,
    [id_rol, id]
  );
};

export const updateUserPassword = async (id, contrasena) => {
  await pool.query(
    `UPDATE usuarios SET contrasena = ? WHERE idUsuario = ?`,
    [contrasena, id]
  );
};

export const deleteUser = async (id) => {
  await pool.query(
    `DELETE FROM usuarios WHERE idUsuario = ?`,
    [id]
  );
};
