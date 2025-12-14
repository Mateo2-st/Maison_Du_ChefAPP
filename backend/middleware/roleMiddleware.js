export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const mapRoles = {
      1: "admin",
      2: "restaurante",
      3: "usuario",
      4: "domiciliario"
    };

    // Determinar rol del usuario: preferir nombre si viene, sino mapear por id_rol
    const rolUsuario = (req.user.rol && String(req.user.rol)) || (req.user.id_rol ? mapRoles[req.user.id_rol] : null);
    // Convertir números a nombres si es necesario
    const rolesNormalizados = rolesPermitidos.map(r => typeof r === 'number' ? mapRoles[r] : r);

    // Comparar si el rol del usuario está en los roles permitidos (case-insensitive)
    const autorizado = rolUsuario && rolesNormalizados.some(r => r.toLowerCase() === rolUsuario.toLowerCase());

    if (!autorizado) {
      return res.status(403).json({ message: "No autorizado" });
    }

    next();
  };
};
