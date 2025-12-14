// controllers/categoriaControllers.js
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../models/categoriaModels.js";

// Obtener todas las categorias
export const listCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        return res.json(categories);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Obtener categoria por ID
export const getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await getCategoryById(id);

        if (!category) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        return res.json(category);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Crear categoria
export const addCategory = async (req, res) => {
    try {
        const { nombreCategoria } = req.body;

        if (!nombreCategoria) {
            return res.status(400).json({ message: "Falta el nombre de la categoría" });
        }

        const id = await createCategory({ nombreCategoria });
        return res.status(201).json({ message: "Categoría creada", id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Actualizar
export const editCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCategoria } = req.body;

        const updated = await updateCategory(id, { nombreCategoria });

        if (!updated) {
            return res.status(404).json({ message: "Categoría no encontrada o sin cambios" });
        }

        return res.json({ message: "Categoría actualizada" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Eliminar
export const removeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await deleteCategory(id);

        if (!deleted) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        return res.json({ message: "Categoría eliminada" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
