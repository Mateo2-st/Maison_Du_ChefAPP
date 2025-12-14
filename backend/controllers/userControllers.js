import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/* =========================
   REGISTRO
========================= */
export const registerUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena)
      return res.status(400).json({ message: "Faltan campos obligatorios" });

    const [existe] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existe.length > 0)
      return res.status(400).json({ message: "El correo ya está registrado" });

    const [rolData] = await pool.query(
      "SELECT idRol FROM roles WHERE nombreRol = ?",
      [rol || "usuario"]
    );

    if (rolData.length === 0)
      return res.status(400).json({ message: "Rol inválido" });

    const hash = await bcrypt.hash(contrasena, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)",
      [nombre, correo, hash, rolData[0].idRol]
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("ERROR REGISTRO:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena)
      return res.status(400).json({ message: "Faltan credenciales" });

    const [rows] = await pool.query(
      `SELECT u.*, r.nombreRol AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.idRol
       WHERE correo = ?`,
      [correo]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const user = rows[0];

    const valido = await bcrypt.compare(contrasena, user.contrasena);
    if (!valido)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.idUsuario, rol: user.rol, id_rol: user.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login correcto",
      token,
      user: {
        id: user.idUsuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({ message: "Error en login" });
  }
};

/* =========================
   PERFIL
========================= */
export const getProfile = async (req, res) => {
  try {
    const idUsuario = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.idUsuario, u.nombre, u.correo, u.id_rol, r.nombreRol AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.idRol
       WHERE u.idUsuario = ?`,
      [idUsuario]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("ERROR PROFILE:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/* =========================
   OBTENER TODOS (ADMIN)
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.idUsuario, u.nombre, u.correo, r.nombreRol AS rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.idRol
    `);

    res.json(rows);
  } catch (error) {
    console.error("ERROR GET USERS:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

/* =========================
   OBTENER POR ID (ADMIN)
========================= */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT u.idUsuario, u.nombre, u.correo, r.nombreRol AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.idRol
       WHERE u.idUsuario = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("ERROR GET USER BY ID:", error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

/* =========================
   ACTUALIZAR (ADMIN)
========================= */
export const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, password } = req.body;

    const [exists] = await pool.query(
      "SELECT * FROM usuarios WHERE idUsuario = ?",
      [id]
    );

    if (exists.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (rol) {
      const [rolData] = await pool.query(
        "SELECT idRol FROM roles WHERE nombreRol = ?",
        [rol]
      );

      if (rolData.length === 0)
        return res.status(400).json({ message: "Rol inválido" });

      await pool.query(
        "UPDATE usuarios SET id_rol = ? WHERE idUsuario = ?",
        [rolData[0].idRol, id]
      );
    }

    if (password && password.trim() !== "") {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE usuarios SET contrasena = ? WHERE idUsuario = ?",
        [hash, id]
      );
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("ERROR UPDATE USER:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

/* =========================
   ELIMINAR (ADMIN)
========================= */
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [exists] = await pool.query(
      "SELECT * FROM usuarios WHERE idUsuario = ?",
      [id]
    );

    if (exists.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    await pool.query("DELETE FROM usuarios WHERE idUsuario = ?", [id]);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("ERROR DELETE USER:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
