// backend/controllers/categoriaControllers.js
import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from "../models/categoriaModels.js";

export const listCategories = async (req, res) => {
  try {
    const rows = await getAllCategorias();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await getCategoriaById(id);
    if (!cat) return res.status(404).json({ message: "Categoría no encontrada" });
    return res.json(cat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { nombreCategoria } = req.body;
    if (!nombreCategoria) return res.status(400).json({ message: "Falta nombreCategoria" });
    const cat = await createCategoria({ nombreCategoria });
    return res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCategoria } = req.body;
    const ok = await updateCategoria(id, { nombreCategoria });
    if (!ok) return res.status(404).json({ message: "Categoría no encontrada" });
    return res.json({ message: "Categoría actualizada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await deleteCategoria(id);
    if (!ok) return res.status(404).json({ message: "Categoría no encontrada" });
    return res.json({ message: "Categoría eliminada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};
