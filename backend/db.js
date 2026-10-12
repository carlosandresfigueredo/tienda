require("dotenv").config();
const mysql = require("mysql2");

const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "tienda";

// Opciones de configuración
const configuracion = {
  host,
  port,
  user,
  password,
  database,
};

// Si el host es remoto (por ejemplo TiDB Cloud en la nube), habilitamos SSL automáticamente
if (host !== "localhost" && host !== "127.0.0.1") {
  configuracion.ssl = {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  };
}

// Crear conexión con MySQL o TiDB Cloud
const conexion = mysql.createConnection(configuracion);

// Comprobar si la conexión fue exitosa
conexion.connect((error) => {
  if (error) {
    console.error("❌ Error al conectar con la Base de Datos:", error.message);
    return;
  }
  console.log(`✅ Conexión exitosa con la Base de Datos (${host}:${port})`);
});

module.exports = conexion;
