// controllers/productController.js
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../models/productModels.js";

/// Obtener all productos
export const listProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        return res.json(products);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Obtener producto ID
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        return res.json(product);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Crear producto
export const addProduct = async (req, res) => {
    try {
        const { nombreProducto, descripcion, precio, disponible, id_restaurante, id_categoria } = req.body;

        if (!nombreProducto || !precio || !id_restaurante || !id_categoria) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const product = await createProduct({
            nombreProducto,
            descripcion,
            precio,
            disponible,
            id_restaurante,
            id_categoria
        });

        return res.status(201).json({ message: "Producto creado", product });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Actualizar producto
export const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreProducto, descripcion, precio, disponible, id_restaurante, id_categoria } = req.body;

        const updated = await updateProduct(id, {
            nombreProducto,
            descripcion,
            precio,
            disponible,
            id_restaurante,
            id_categoria
        });

        if (!updated) {
            return res.status(404).json({ message: "Producto no encontrado o sin cambios" });
        }

        const productActualizado = await getProductById(id);
        return res.json({ message: "Producto actualizado", product: productActualizado });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

// Eliminar producto
export const removeProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await deleteProduct(id);

        if (!deleted) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        return res.json({ message: "Producto eliminado" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
