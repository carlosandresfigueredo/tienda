# 📘 Guía Paso a Paso: Creación de una Aplicación Web Full Stack (CRUD)
### *De la Base de Datos a la Interfaz de Usuario con Node.js, Express y MySQL*

---

## 🎯 Objetivo de Aprendizaje
Aprenderás a construir una aplicación web completa desde cero que conecta una interfaz de usuario (**Frontend**) con un servidor web (**Backend**) y una base de datos relacional (**MySQL**).

```
   ┌───────────────────────┐         HTTP (fetch / JSON)        ┌─────────────────────────┐         SQL Query (mysql2)         ┌───────────────────────┐
   │       FRONTEND        │  ───────────────────────────────>  │         BACKEND         │  ───────────────────────────────>  │     BASE DE DATOS     │
   │  HTML + CSS + JS Dom  │  <───────────────────────────────  │    Node.js + Express    │  <───────────────────────────────  │         MySQL         │
   └───────────────────────┘           Respuestas JSON          └─────────────────────────┘             Filas / Filas          └───────────────────────┘
```

---

## 📑 Tabla de Contenido
1. [Paso 1: Crear la Base de Datos y Tabla en MySQL](#paso-1-crear-la-base-de-datos-y-tabla-en-mysql)
2. [Paso 2: Inicializar el Proyecto en Node.js e Instalar Dependencias](#paso-2-inicializar-el-proyecto-en-nodejs-e-instalar-dependencias)
3. [Paso 3: Conectar Node.js con MySQL (`db.js`)](#paso-3-conectar-nodejs-con-mysql-dbjs)
4. [Paso 4: Crear el Servidor Express Base (`server.js`)](#paso-4-crear-el-servidor-express-base-serverjs)
5. [Paso 5: Crear el Endpoint de Consulta (`GET /productos`)](#paso-5-crear-el-endpoint-de-consulta-get-productos)
6. [Paso 6: Crear el Frontend Inicial (HTML, CSS y Lectura de Datos)](#paso-6-crear-el-frontend-inicial-html-css-y-lectura-de-datos)
7. [Paso 7: Endpoint y Flujo para Crear Productos (`POST /productos`)](#paso-7-endpoint-y-flujo-para-crear-productos-post-productos)
8. [Paso 8: Endpoint y Flujo para Actualizar Productos (`PUT /productos/:id`)](#paso-8-endpoint-y-flujo-para-actualizar-productos-put-productosid)
9. [Paso 9: Endpoint y Flujo para Eliminar Productos (`DELETE /productos/:id`)](#paso-9-endpoint-y-flujo-para-eliminar-productos-delete-productosid)
10. [Paso 10: Prueba Final del CRUD Completo y Resumen](#paso-10-prueba-final-del-crud-completo-y-resumen)

---

## 🗄️ Paso 1: Crear la Base de Datos y Tabla en MySQL

Antes de escribir código en JavaScript, necesitamos el lugar donde se guardará la información de forma persistente.

### 1.1 Abrir el gestor de MySQL
Abre phpMyAdmin, MySQL Workbench o la terminal de MySQL y ejecuta:

```sql
-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS tienda2;

-- 2. Seleccionar la base de datos para trabajar en ella
USE tienda2;

-- 3. Crear la tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
);

-- 4. Insertar datos de prueba iniciales
INSERT INTO productos (nombre, precio, stock) VALUES
('Teclado Mecánico RGB', 120000.00, 15),
('Mouse Gamer Inalámbrico', 75000.00, 20),
('Monitor 24 Pulgadas FHD', 450000.00, 8);
```

### 1.2 Explicación de los campos
* **`id`**: Clave primaria numérica autoincremental para identificar de manera única cada registro.
* **`nombre`**: Texto de hasta 100 caracteres para el nombre del artículo.
* **`precio`**: Tipo `DECIMAL(10, 2)` para manejar dinero con exactitud de centavos.
* **`stock`**: Número entero que indica la cantidad de unidades disponibles.

---

## ⚙️ Paso 2: Inicializar el Proyecto en Node.js e Instalar Dependencias

Estructuraremos el proyecto en dos carpetas separadas: `backend` y `frontend`.

### 2.1 Crear la estructura de carpetas
Abre tu terminal y crea la carpeta del proyecto:

```bash
mkdir tienda
cd tienda
mkdir backend
mkdir frontend
```

### 2.2 Inicializar Node.js en el backend
Ingresa a la carpeta `backend` e inicializa el archivo `package.json`:

```bash
cd backend
npm init -y
```

> **¿Qué hace `npm init -y`?**  
> Crea automáticamente el archivo `package.json` con los valores por defecto. Este archivo registra las dependencias y metadatos de tu proyecto Node.js.

### 2.3 Instalar las dependencias necesarias
Ejecuta el siguiente comando dentro de `backend/`:

```bash
npm install express mysql2 cors
```

| Paquete | ¿Para qué sirve? |
|---|---|
| **`express`** | Framework web para crear el servidor HTTP y definir las rutas (endpoints de la API). |
| **`mysql2`** | Controlador que permite a Node.js enviar consultas SQL a la base de datos MySQL. |
| **`cors`** | Middleware que habilita el intercambio de recursos entre distintos orígenes (evita bloqueos de seguridad del navegador cuando el frontend hace peticiones al backend). |

---

## 🔌 Paso 3: Conectar Node.js con MySQL (`db.js`)

Crearemos un módulo dedicado exclusivamente a gestionar la conexión a la base de datos.

### 3.1 Crear el archivo `backend/db.js`
Crea el archivo con el siguiente código:

```javascript
const mysql = require("mysql2");

// Configuración de la conexión a MySQL
const conexion = mysql.createConnection({
  host: "localhost",     // Servidor local
  user: "root",          // Usuario de MySQL (por defecto en XAMPP/WAMP)
  password: "",          // Contraseña (vacía por defecto en XAMPP)
  database: "tienda2",   // Nombre de la BD que creamos en el Paso 1
});

// Comprobar si la conexión fue exitosa
conexion.connect((error) => {
  if (error) {
    console.error("❌ Error al conectar con MySQL:", error);
    return;
  }
  console.log("✅ Conexión exitosa con MySQL");
});

// Exportar la conexión para reutilizarla en las rutas del servidor
module.exports = conexion;
```

### 3.2 🧪 Prueba de este paso
Ejecuta en la terminal:
```bash
node db.js
```
* **Resultado esperado:** Debe imprimir `✅ Conexión exitosa con MySQL`.  
*(Si sale error, verifica que tu servicio MySQL en XAMPP/WAMP esté encendido y que el nombre de la BD sea correcto).*

---

## 🚀 Paso 4: Crear el Servidor Express Base (`server.js`)

Ahora crearemos el servidor web que escuchará las peticiones HTTP en el puerto 3000.

### 4.1 Crear el archivo `backend/server.js`
```javascript
const express = require("express");
const cors = require("cors");
const conexion = require("./db"); // Importamos la conexión creada en el paso 3

const app = express();

// Middlewares globales
app.use(cors());          // Permitir peticiones desde el frontend
app.use(express.json());  // Habilitar la lectura de datos en formato JSON en el cuerpo (req.body)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
  console.log("🚀 Servidor ejecutándose en http://localhost:3000");
});
```

### 4.2 🧪 Prueba de este paso
1. Inicia el servidor:
   ```bash
   node server.js
   ```
2. Abre tu navegador y visita: `http://localhost:3000`
3. **Resultado esperado:** En pantalla debes ver `"Servidor funcionando correctamente"`.

---

## 📖 Paso 5: Crear el Endpoint de Consulta (`GET /productos`)

El primer método del CRUD es la **Lectura (Read)**. Crearemos una ruta que consulte todos los registros de MySQL y los devuelva en formato JSON.

### 5.1 Agregar el endpoint a `backend/server.js`
Agrega el siguiente bloque antes de `app.listen(...)`:

```javascript
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
```

### 5.2 🧪 Prueba de este paso
1. Reinicia el servidor en la terminal (`Ctrl + C` y luego `node server.js`).
2. Visita en el navegador: `http://localhost:3000/productos`
3. **Resultado esperado:** Verás un array JSON con los productos que insertamos en el Paso 1:
   ```json
   [
     {"id": 1, "nombre": "Teclado Mecánico RGB", "precio": "120000.00", "stock": 15},
     {"id": 2, "nombre": "Mouse Gamer Inalámbrico", "precio": "75000.00", "stock": 20},
     {"id": 3, "nombre": "Monitor 24 Pulgadas FHD", "precio": "450000.00", "stock": 8}
   ]
   ```

---

## 🎨 Paso 6: Crear el Frontend Inicial (HTML, CSS y Lectura de Datos)

Ahora crearemos la interfaz para que el usuario pueda ver estos productos en tarjetas visuales sin necesidad de mirar el JSON crudo.

### 6.1 Crear `frontend/index.html`
```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi Tienda — Gestión de Productos</title>
  <link rel="stylesheet" href="estilos.css" />
</head>
<body>
  <!-- Navbar -->
  <header class="navbar">
    <div class="contenedor nav-contenido">
      <a href="index.html" class="logo">🛍️ Mi<strong>Tienda</strong></a>
      <nav class="nav-links">
        <a href="index.html">Inicio</a>
        <a href="#productos">Productos</a>
        <a href="contacto.html">Contacto</a>
      </nav>
    </div>
  </header>

  <!-- Contenido -->
  <main class="contenedor">
    <div class="encabezado-principal">
      <h1>Sistema de Gestión de Productos</h1>
      <p>Panel conectado a Node.js, Express y MySQL</p>
    </div>

    <div class="panel-tienda">
      <!-- Formulario (Izquierda) -->
      <section class="tarjeta">
        <h2 id="tituloFormulario">Registrar Producto</h2>
        <form id="formularioProducto">
          <input type="hidden" id="productoId" value="" />

          <div class="campo">
            <label for="nombre">Nombre del producto:</label>
            <input type="text" id="nombre" placeholder="Ej: Camiseta básica" required />
          </div>

          <div class="campo">
            <label for="precio">Precio ($):</label>
            <input type="number" id="precio" step="0.01" placeholder="Ej: 25000" required />
          </div>

          <div class="campo">
            <label for="stock">Stock (cantidad):</label>
            <input type="number" id="stock" placeholder="Ej: 10" required />
          </div>

          <div class="acciones-form">
            <button type="submit" id="btnGuardar" class="btn btn-guardar">Guardar Producto</button>
            <button type="button" id="btnCancelar" class="btn btn-cancelar" style="display: none;">Cancelar</button>
          </div>
        </form>
      </section>

      <!-- Lista de Productos (Derecha) -->
      <section class="tarjeta" id="productos">
        <h2>Lista de Productos</h2>
        <div id="listaProductos" class="lista-productos"></div>
      </section>
    </div>
  </main>

  <footer class="footer">
    <p>&copy; 2026 Mi Tienda — Proyecto Formativo Full Stack</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

### 6.2 Crear `frontend/estilos.css`
Aplica estilos limpios con Flexbox y Grid:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
.contenedor { max-width: 1100px; margin: 0 auto; padding: 20px; }
.navbar { background: #fff; padding: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.nav-contenido { display: flex; justify-content: space-between; align-items: center; }
.nav-links { display: flex; gap: 15px; }
.nav-links a { text-decoration: none; color: #64748b; font-weight: bold; }
.panel-tienda { display: grid; grid-template-columns: 360px 1fr; gap: 20px; margin-top: 20px; }
.tarjeta { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.campo { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
input { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn { padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-guardar { background: #2563eb; color: #fff; flex: 1; }
.btn-cancelar { background: #e2e8f0; color: #334155; }
.acciones-form { display: flex; gap: 8px; }
.lista-productos { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; }
.producto { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
.producto-precio { color: #2563eb; font-weight: bold; }
.acciones { display: flex; gap: 8px; margin-top: 10px; }
.btn-editar { background: #e2e8f0; flex: 1; padding: 6px; border: none; border-radius: 4px; cursor: pointer; }
.btn-eliminar { background: #fee2e2; color: #dc2626; flex: 1; padding: 6px; border: none; border-radius: 4px; cursor: pointer; }
.footer { text-align: center; padding: 20px; color: #94a3b8; margin-top: 30px; }
```

### 6.3 Crear `frontend/app.js` (Lectura con `fetch`)
```javascript
const API_URL = "http://localhost:3000";
const listaProductos = document.getElementById("listaProductos");

// 1. Función para consultar los productos y pintarlos en el DOM
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      elemento.innerHTML = `
        <div>
          <h3>${producto.nombre}</h3>
          <p class="producto-precio">Precio: $${producto.precio}</p>
          <p>Stock: ${producto.stock} unidades</p>
        </div>
        <div class="acciones">
          <button class="btn-editar" onclick="cargarEnFormulario(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </div>
      `;

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Llamado inicial al cargar el script
cargarProductos();
```

### 6.4 🧪 Prueba de este paso
Abre `frontend/index.html` en tu navegador (con el backend encendido).  
* **Resultado esperado:** Las tarjetas con los productos de MySQL deben mostrarse automáticamente en la pantalla.

---

## ➕ Paso 7: Endpoint y Flujo para Crear Productos (`POST /productos`)

En este paso conectaremos el formulario de HTML con el backend para guardar nuevos productos en MySQL.

---

### 7.1 Backend: Agregar endpoint `POST` en `server.js`

* **Archivo:** `backend/server.js`
* **¿Qué debemos hacer?**  
  Agrega este bloque **debajo del `GET /productos` y antes de `app.listen(...)`**:

```javascript
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
```

---

### 7.2 Frontend: Enviar el formulario en `app.js`

* **Archivo:** `frontend/app.js`
* **¿Qué debemos hacer?**
  1. **En la parte superior de `app.js`** (junto a `listaProductos`), declaramos las referencias a los campos del formulario:
     ```javascript
     const formulario = document.getElementById("formularioProducto");
     const nombreInput = document.getElementById("nombre");
     const precioInput = document.getElementById("precio");
     const stockInput = document.getElementById("stock");
     ```

  2. **Debajo de la función `cargarProductos()` y antes de la llamada `cargarProductos()`**, agregamos el evento `submit`:
     ```javascript
     // 2. Registrar un nuevo producto (CREATE - POST)
     if (formulario) {
       formulario.addEventListener("submit", async (event) => {
         event.preventDefault(); // Evita que la página se recargue

         const nombre = nombreInput.value;
         const precio = precioInput.value;
         const stock = stockInput.value;

         try {
           await fetch(`${API_URL}/productos`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ nombre, precio, stock }),
           });

           formulario.reset();   // Limpiamos los campos
           cargarProductos();    // Refrescamos la lista en pantalla
         } catch (error) {
           console.error("Error al crear producto:", error);
         }
       });
     }
     ```

### 7.3 🧪 Prueba de este paso
1. En el formulario de `index.html`, escribe un producto nuevo (ej: `Audífonos Bluetooth`, precio: `90000`, stock: `10`).
2. Haz clic en **Guardar Producto**.
3. **Resultado esperado:** El formulario se limpia solo y el producto aparece en la lista de la derecha.

---

## ✏️ Paso 8: Endpoint y Flujo para Actualizar Productos (`PUT /productos/:id`)

En este paso permitiremos que al presionar **"Editar"**, los datos del producto se carguen en el formulario y se guarden con el método `PUT`.

---

### 8.1 Backend: Agregar endpoint `PUT` en `server.js`

* **Archivo:** `backend/server.js`
* **¿Qué debemos hacer?**  
  Agrega este bloque **debajo del `POST /productos` y antes de `app.listen(...)`**:

```javascript
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
```

---

### 8.2 Frontend: Integrar la edición en el formulario (`app.js`)

* **Archivo:** `frontend/app.js`
* **¿Qué debemos hacer?**

  1. **En la parte superior de `app.js`** (en la sección de variables), agrega:
     ```javascript
     const productoId = document.getElementById("productoId");
     const btnGuardar = document.getElementById("btnGuardar");
     const btnCancelar = document.getElementById("btnCancelar");
     const tituloFormulario = document.getElementById("tituloFormulario");
     ```

  2. **En la función `cargarProductos()`**, actualiza el botón de editar para que llame a `cargarEnFormulario`:
     ```javascript
     <button class="btn-editar" onclick="cargarEnFormulario(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">Editar</button>
     ```

  3. **Debajo de `cargarProductos()`**, agrega las funciones para cargar datos y cancelar edición:
     ```javascript
     // Cargar datos en el formulario para editar
     function cargarEnFormulario(id, nombre, precio, stock) {
       productoId.value = id;
       nombreInput.value = nombre;
       precioInput.value = precio;
       stockInput.value = stock;

       tituloFormulario.textContent = "Editar Producto";
       btnGuardar.textContent = "Actualizar Producto";
       btnCancelar.style.display = "block";
       nombreInput.focus();
     }

     // Cancelar edición y restaurar formulario
     function cancelarEdicion() {
       formulario.reset();
       productoId.value = "";
       tituloFormulario.textContent = "Registrar Producto";
       btnGuardar.textContent = "Guardar Producto";
       btnCancelar.style.display = "none";
     }

     if (btnCancelar) {
       btnCancelar.addEventListener("click", cancelarEdicion);
     }
     ```

  4. **Modifica el evento `submit`** para que decida entre `POST` (nuevo) o `PUT` (editar):
     ```javascript
     if (formulario) {
       formulario.addEventListener("submit", async (event) => {
         event.preventDefault();

         const id = productoId.value;
         const nombre = nombreInput.value;
         const precio = precioInput.value;
         const stock = stockInput.value;

         try {
           if (id) {
             // MODO ACTUALIZAR (PUT)
             await fetch(`${API_URL}/productos/${id}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ nombre, precio, stock }),
             });
           } else {
             // MODO CREAR (POST)
             await fetch(`${API_URL}/productos`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ nombre, precio, stock }),
             });
           }

           cancelarEdicion();
           cargarProductos();
         } catch (error) {
           console.error("Error al guardar el producto:", error);
         }
       });
     }
     ```

### 8.3 🧪 Prueba de este paso
1. Haz clic en **Editar** en una tarjeta.
2. Los datos deben cargarse en el formulario y el botón cambiará a **"Actualizar Producto"**.
3. Cambia el precio y presiona el botón.
4. **Resultado esperado:** Los datos se actualizan en MySQL y la lista se refresca inmediatamente.

---

## 🗑️ Paso 9: Endpoint y Flujo para Eliminar Productos (`DELETE /productos/:id`)

---

### 9.1 Backend: Agregar endpoint `DELETE` en `server.js`

* **Archivo:** `backend/server.js`
* **¿Qué debemos hacer?**  
  Agrega este bloque **debajo del `PUT /productos/:id` y antes de `app.listen(...)`**:

```javascript
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
```

---

### 9.2 Frontend: Agregar función `eliminarProducto` en `app.js`

* **Archivo:** `frontend/app.js`
* **¿Qué debemos hacer?**
  1. **En la función `cargarProductos()`**, asegúrate de que el botón eliminar llame a la función:
     ```javascript
     <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
     ```

  2. **Debajo del evento `submit`**, agrega la función `eliminarProducto`:
     ```javascript
     // 4. Eliminar un producto (DELETE)
     async function eliminarProducto(id) {
       const confirmar = confirm("¿Deseas eliminar este producto de la base de datos?");
       if (!confirmar) return;

       try {
         await fetch(`${API_URL}/productos/${id}`, {
           method: "DELETE",
         });

         // Si se estaba editando ese mismo producto, cancelamos la edición
         if (productoId.value == id) {
           cancelarEdicion();
         }

         cargarProductos();
       } catch (error) {
         console.error("Error al eliminar producto:", error);
       }
     }
     ```

### 9.3 🧪 Prueba de este paso
1. Haz clic en **Eliminar** en cualquier tarjeta.
2. Acepta el mensaje de confirmación (`confirm`).
3. **Resultado esperado:** El registro se elimina de MySQL y desaparece de la pantalla.

---

## 🌐 Paso 10: Página Adicional de Contacto (`contacto.html`)

Para enseñar cómo estructurar un sitio con múltiples páginas que comparten los mismos estilos:

* **Archivo nuevo:** `frontend/contacto.html`

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contacto — Mi Tienda</title>
  <link rel="stylesheet" href="estilos.css" />
</head>
<body>
  <!-- Misma Navbar que en index.html -->
  <header class="navbar">
    <div class="contenedor nav-contenido">
      <a href="index.html" class="logo"> Mi<strong>Tienda</strong></a>
      <nav class="nav-links">
        <a href="index.html">Inicio</a>
        <a href="index.html#productos">Productos</a>
        <a href="contacto.html">Contacto</a>
      </nav>
    </div>
  </header>

  <main class="contenedor">
    <section class="tarjeta" style="max-width: 600px; margin: 30px auto;">
      <h2>Envíanos un Mensaje</h2>
      <form id="formularioContacto">
        <div class="campo">
          <label for="contactoNombre">Nombre:</label>
          <input type="text" id="contactoNombre" placeholder="Tu nombre" required />
        </div>
        <div class="campo">
          <label for="contactoEmail">Correo Electrónico:</label>
          <input type="email" id="contactoEmail" placeholder="correo@ejemplo.com" required />
        </div>
        <div class="campo">
          <label for="contactoMensaje">Mensaje:</label>
          <textarea id="contactoMensaje" rows="4" placeholder="Escribe tu mensaje..." required></textarea>
        </div>
        <button type="submit" class="btn btn-guardar">Enviar Mensaje</button>
      </form>
    </section>
  </main>

  <footer class="footer">
    <p>&copy; 2026 Mi Tienda — Proyecto Formativo Full Stack</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

* **En `app.js`**, agrega al final el soporte para el formulario de contacto:
```javascript
const formContacto = document.getElementById("formularioContacto");

if (formContacto) {
  formContacto.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Mensaje de contacto enviado con éxito!");
    formContacto.reset();
  });
}
```

---

## 🏁 Resumen y Checklist de Aprendizaje

| Operación | Método HTTP | Endpoint Backend | Consulta SQL | Acción Frontend |
|---|---|---|---|---|
| **Create** | `POST` | `/productos` | `INSERT INTO productos ...` | Formulario `submit` -> `fetch(POST)` |
| **Read** | `GET` | `/productos` | `SELECT * FROM productos` | `cargarProductos()` -> `fetch(GET)` |
| **Update** | `PUT` | `/productos/:id` | `UPDATE productos SET ...` | `cargarEnFormulario()` -> `fetch(PUT)` |
| **Delete** | `DELETE` | `/productos/:id` | `DELETE FROM productos ...` | Botón Eliminar -> `fetch(DELETE)` |

### 💡 Puntos clave a recordar con tus aprendices:
1. **Separación de roles:** El Frontend nunca se conecta directamente a MySQL por razones de seguridad; siempre pasa por la API de Node.js/Express.
2. **Consultas parametrizadas:** Siempre usar `?` en lugar de concatenar cadenas (`"WHERE id = " + id`) para evitar ataques de **SQL Injection**.
3. **Manejo asíncrono:** Usar `async/await` al hacer `fetch` para esperar la respuesta del servidor sin bloquear la interfaz.
4. **Flujo de actualización:** En lugar de usar `prompt()`, cargar los datos directamente en el formulario con un campo oculto (`<input type="hidden">`) para el ID es la forma estándar y profesional en la web.
