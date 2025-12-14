import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ message: "Acceso denegado: no hay token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id_usuario: decoded.id,
            rol: decoded.rol
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
};
