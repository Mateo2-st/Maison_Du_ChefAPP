import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from 'url';


import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import restaurantesRoutes from "./routes/restaurantesRoutes.js";
import pedidosRoutes from './routes/pedidosRoutes.js';
import categoriaRoutes from "./routes/categoriaRoutes.js";
import detallePedidoRoutes from "./routes/detallePedidoRoutes.js";
import pagoRoutes from './routes/pagoRoutes.js';
import reseniaRoutes from './routes/reseniaRoutes.js';
import ventasRoutes from './routes/ventasRoutes.js';
import domiciliarioRoutes from './routes/domiciliarioRoutes.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Servir frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.join(__dirname, "..", "frontend");

app.use("/pages", express.static(path.join(frontendRoot, "pages")));
app.use("/css", express.static(path.join(frontendRoot, "css")));
app.use("/js", express.static(path.join(frontendRoot, "js")));
app.use("/imagenes", express.static(path.join(frontendRoot, "imagenes")));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/restaurantes", restaurantesRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/detallePedido", detallePedidoRoutes);
app.use("/api/pago", pagoRoutes);
app.use("/api/resenia", reseniaRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/domiciliario", domiciliarioRoutes);

app.get("/", (req, res) => {
    res.redirect("/pages/login.html");
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
