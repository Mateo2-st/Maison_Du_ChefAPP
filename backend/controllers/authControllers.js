import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* =========================
   REGISTRO
========================= */
export const register = async (req, res) => {
  try {
    let { nombre, correo, contrasena, role } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        message: "Faltan campos obligatorios"
      });
    }

    if (!role) role = "usuario"; // rol por defecto

    // Verificar si el correo ya existe
    const [existe] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existe.length > 0) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      });
    }

    // Obtener ID del rol
    const [rolData] = await pool.query(
      "SELECT idRol FROM roles WHERE nombreRol = ?",
      [role]
    );

    if (rolData.length === 0) {
      return res.status(400).json({
        message: "Rol inválido"
      });
    }

    const id_rol = rolData[0].idRol;

    // Encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar usuario
    await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, id_rol)
       VALUES (?, ?, ?, ?)`,
      [nombre, correo, hash, id_rol]
    );

    res.status(201).json({
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.error("ERROR REGISTRO:", error);
    res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message
    });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        message: "Faltan credenciales"
      });
    }

    const [rows] = await pool.query(
      `SELECT u.*, r.nombreRol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.idRol
       WHERE correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    const user = rows[0];

    // Comparar contraseñas
    const valido = await bcrypt.compare(contrasena, user.contrasena);

    if (!valido) {
      return res.status(401).json({
        message: "Contraseña incorrecta"
      });
    }

    // Crear token
    const token = jwt.sign(
      { id: user.idUsuario, rol: user.nombreRol },
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
        rol: user.nombreRol
      }
    });

  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({
      message: "Error en login",
      error: error.message
    });
  }
};

/* =========================
   PERFIL (AUTH / ME)
========================= */
export const getProfile = async (req, res) => {
  try {
    const idUsuario = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.idUsuario, u.nombre, u.correo, u.id_rol, r.nombreRol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.idRol
      WHERE u.idUsuario = ?`,
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error("ERROR PROFILE:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

/* =========================
   OBTENER TODOS LOS USUARIOS
   (PARA ADMIN_PERSONAL.HTML)
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.idUsuario,
        u.nombre,
        u.correo,
        r.nombreRol AS rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.idRol
    `);

    res.json(rows);

  } catch (error) {
    console.error("ERROR GET USERS:", error);
    res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message
    });
  }
};
