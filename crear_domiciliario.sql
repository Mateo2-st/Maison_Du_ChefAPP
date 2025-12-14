-- Crear usuario domiciliario
-- Contraseña: domiciliario123 (hash bcrypt)
INSERT INTO usuarios (nombre, correo, contrasena, id_rol) 
VALUES ('Juan Domiciliario', 'domiciliario@maison.com', '$2b$10$IQvlNTq1IQvlNTq1IQvlNeE5U7Gv7Gv7Gv7Gv7Gv7Gv7Gv7Gv', 4);

-- Verificar que se creó
SELECT * FROM usuarios WHERE id_rol = 4;
