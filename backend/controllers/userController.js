import { 
    findUserById, 
    getAllUsers, 
    updateUser, 
    deleteUser 
} from "../models/userModels.js";

// usuario autenticado
export const profile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const { contrasena, ...safeUser } = user;
        return res.json({ user: safeUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error del servidor" });
    }
};


// Listar todos los usuarios
export const listUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error del servidor" });
    }
};


// Act usuario
export const updateUserController = async (req, res) => {
    try {
        const updated = await updateUser(req.params.id, req.body);

        if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: "Usuario actualizado" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error del servidor" });
    }
};


// Eliminar usuari
export const deleteUserController = async (req, res) => {
    try {
        const deleted = await deleteUser(req.params.id);

        if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: "Usuario eliminado" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error del servidor" });
    }
};
