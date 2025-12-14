import dotenv from "dotenv";
import mysql from "mysql2";
import pool from '../config/db.js'

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Verificar la conexión del .js
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos exitosa');
        connection.release();
    } catch (error) {
        console.error(` Error al conectar a la base de datos: ${error.code} - ${error.message}`);
    }
})();
