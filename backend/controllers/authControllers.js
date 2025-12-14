import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { findUserByEmail, createUser } from "../models/userModels.js";
import { getRoleByName } from "../models/rolModels.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const SALT_ROUNDS = 10;

// Registro
export const register = async (req, res) => {
    try {
        const { nombre, correo, contrasena, role } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        // Rol por defecto
        const roleName = role || "usuario"; 
        const roleObj = await getRoleByName(roleName);

        if (!roleObj) {
            return res.status(400).json({ message: "Rol no encontrado" });
        }

        // Verificar si existe el correo
        const existing = await findUserByEmail(correo);
        if (existing) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Encriptar contraseña
        const hashed = await bcrypt.hash(contrasena, SALT_ROUNDS);

        // Crear usuario
        const id = await createUser({
            nombre,
            correo,
            contrasena: hashed,
            id_rol: roleObj.idRol
        });

        return res.status(201).json({ message: "Usuario creado", id });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};


// Login
export const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ message: "Faltan campos" });
        }

        // Buscar usuario
        const user = await findUserByEmail(correo);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Comparar contraseñas
        const match = await bcrypt.compare(contrasena, user.contrasena);
        if (!match) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Crear JWT
        const token = jwt.sign(
            {
                id: user.idUsuario,
                rol: user.id_rol
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.idUsuario,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.id_rol
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
