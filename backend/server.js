const express = require("express");
const cors = require("cors");
const conexion = require("./db"); // Importamos la conexión creada en db.js

const app = express();

// Middlewares globales
app.use(cors());          // Permitir peticiones desde el frontend
app.use(express.json());  // Habilitar la lectura de datos en formato JSON en el cuerpo (req.body)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// 1. Obtener todos los productos (READ)
app.get("/productos", (req, res) => {
  const sql = "SELECT * FROM productos";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar:", error);
      return res.status(500).json({ mensaje: "Error al consultar los productos" });
    }
    // Retornamos el array de productos como JSON al cliente
    res.json(resultados);
  });
});

// 2. Crear un nuevo producto (CREATE)
app.post("/productos", (req, res) => {
  const { nombre, precio, stock } = req.body;

  // Consulta parametrizada con '?' para prevenir inyección SQL
  const sql = "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)";
  const valores = [nombre, precio, stock];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al insertar:", error);
      return res.status(500).json({ mensaje: "Error al crear el producto" });
    }

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: resultado.insertId,
    });
  });
});

// 3. Actualizar un producto existente (UPDATE)
app.put("/productos/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, precio, stock } = req.body;

  const sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?";
  const valores = [nombre, precio, stock, id];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al actualizar:", error);
      return res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
    res.json({ mensaje: "Producto actualizado correctamente" });
  });
});

// 4. Eliminar un producto (DELETE)
app.delete("/productos/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM productos WHERE id = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el producto" });
    }
    res.json({ mensaje: "Producto eliminado correctamente" });
  });
});

// ==========================================
// RUTAS DE CONTACTO
// ==========================================

// 5. Registrar un nuevo mensaje de contacto (POST)
app.post("/contacto", (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  // Validación básica de campos requeridos
  if (!nombre || !email || !asunto || !mensaje) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const sql = "INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje) VALUES (?, ?, ?, ?)";
  const valores = [nombre, email, asunto, mensaje];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al guardar mensaje de contacto:", error);
      return res.status(500).json({ mensaje: "Error al registrar el mensaje de contacto" });
    }

    res.status(201).json({
      mensaje: "Mensaje de contacto enviado con éxito",
      id: resultado.insertId,
    });
  });
});

// 6. Consultar todos los mensajes de contacto (GET)
app.get("/contacto", (req, res) => {
  const sql = "SELECT * FROM mensajes_contacto ORDER BY fecha_registro DESC";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar mensajes de contacto:", error);
      return res.status(500).json({ mensaje: "Error al consultar los mensajes de contacto" });
    }
    res.json(resultados);
  });
});

// 7. Eliminar un mensaje de contacto (DELETE)
app.delete("/contacto/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM mensajes_contacto WHERE id = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar mensaje de contacto:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el mensaje de contacto" });
    }
    res.json({ mensaje: "Mensaje eliminado correctamente" });
  });
});

// Iniciar servidor en el puerto dinámico o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
