// controllers/rolController.js
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from "../models/rolModels.js";

// Todos los roles
export const listRoles = async (req, res) => {
    try {
        const roles = await getAllRoles();
        return res.json(roles);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Rol por ID
export const getRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await getRoleById(id);

        if (!role) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }

        return res.json(role);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Crear rol
export const addRole = async (req, res) => {
    try {
        const { nombreRol } = req.body;

        if (!nombreRol) {
            return res.status(400).json({ message: "Falta el nombre del rol" });
        }

        const rol = await createRole(nombreRol);
        return res.status(201).json({ message: "Rol creado", rol });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Actualizar rol
export const editRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreRol } = req.body;

        const updated = await updateRole(id, nombreRol);

        if (!updated) {
            return res.status(404).json({ message: "Rol no encontrado o sin cambios" });
        }

        const rol = await getRoleById(id);
        return res.json({ message: "Rol actualizado", rol });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Eliminar rol
export const removeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteRole(id);

        if (!deleted) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }

        return res.json({ message: "Rol eliminado" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
