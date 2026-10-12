const API_URL = "https://tienda-v8jg.onrender.com";

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const formContacto = document.getElementById("formularioContacto");
const listaMensajes = document.getElementById("listaMensajes");
const btnRecargarMensajes = document.getElementById("btnRecargarMensajes");

// ==========================================================================
// 1. GESTIÓN DE PRODUCTOS (CRUD)
// ==========================================================================

// Consultar los productos y mostrarlos en el DOM (READ)
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (!Array.isArray(productos) || productos.length === 0) {
      listaProductos.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-box2 text-secondary opacity-50 display-4 d-block mb-3"></i>
          <h5 class="text-secondary fw-semibold">No hay productos en inventario</h5>
          <p class="text-muted small">Registra tu primer producto usando el formulario de la izquierda.</p>
        </div>
      `;
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("col-12", "col-md-6");

      const stockBadge = producto.stock > 5
        ? `<span class="badge bg-success-subtle text-success border border-success-subtle badge-stock"><i class="bi bi-check-circle"></i> ${producto.stock} uds</span>`
        : `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle badge-stock"><i class="bi bi-exclamation-triangle"></i> Bajo: ${producto.stock} uds</span>`;

      const precioFormateado = Number(producto.precio).toLocaleString("es-CO");

      // Escapar comillas para evitar errores en onclick
      const nombreSeguro = (producto.nombre || "").replace(/'/g, "\\'");

      elemento.innerHTML = `
        <div class="card-producto-moderno h-100">
          <div class="producto-info">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-light text-secondary border">ID #${producto.id}</span>
              ${stockBadge}
            </div>
            <h3>${producto.nombre}</h3>
            <div class="producto-precio-badge">$${precioFormateado}</div>
          </div>
          <div class="acciones-producto">
            <button class="btn-accion btn-accion-editar" onclick="cargarEnFormulario(${producto.id}, '${nombreSeguro}', ${producto.precio}, ${producto.stock})">
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn-accion btn-accion-eliminar" onclick="eliminarProducto(${producto.id})">
              <i class="bi bi-trash3"></i> Eliminar
            </button>
          </div>
        </div>
      `;

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    listaProductos.innerHTML = `
      <div class="col-12 text-center py-4">
        <p class="text-danger"><i class="bi bi-exclamation-circle me-1"></i> No se pudo conectar con el servidor backend.</p>
      </div>
    `;
  }
}

// Cargar datos del producto en el formulario para editar (UPDATE - Paso 1)
function cargarEnFormulario(id, nombre, precio, stock) {
  if (!formulario) return;

  productoId.value = id;
  nombreInput.value = nombre;
  precioInput.value = precio;
  stockInput.value = stock;

  tituloFormulario.innerHTML = '<i class="bi bi-pencil-square text-primary"></i> Editar Producto';
  btnGuardar.innerHTML = '<i class="bi bi-check2-circle"></i> Actualizar Producto';
  btnCancelar.style.display = "inline-flex";
  nombreInput.focus();

  // Scroll suave al formulario en móviles
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Cancelar edición y restaurar formulario
function cancelarEdicion() {
  if (!formulario) return;

  formulario.reset();
  productoId.value = "";
  tituloFormulario.innerHTML = '<i class="bi bi-plus-circle text-primary"></i> Registrar Producto';
  btnGuardar.innerHTML = '<i class="bi bi-check2-circle"></i> Guardar Producto';
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// Guardar o Actualizar según si hay un ID seleccionado (CREATE o UPDATE)
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = productoId.value;
    const nombre = nombreInput.value.trim();
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
      alert("Error al conectar con el servidor.");
    }
  });
}

// Eliminar un producto (DELETE)
async function eliminarProducto(id) {
  const confirmar = confirm("¿Deseas eliminar este producto de la base de datos?");
  if (!confirmar) return;

  try {
    await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    if (productoId && productoId.value == id) {
      cancelarEdicion();
    }

    cargarProductos();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

// ==========================================================================
// 2. FORMULARIO Y BANDEJA DE CONTACTO
// ==========================================================================

// Envío a la base de datos vía API (POST /contacto)
if (formContacto) {
  formContacto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("contactoNombre").value.trim();
    const email = document.getElementById("contactoEmail").value.trim();
    const asunto = document.getElementById("contactoAsunto").value.trim();
    const mensaje = document.getElementById("contactoMensaje").value.trim();
    const botonSubmit = formContacto.querySelector("button[type='submit']");

    try {
      if (botonSubmit) {
        botonSubmit.disabled = true;
        botonSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';
      }

      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, asunto, mensaje }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert(datos.mensaje || "¡Mensaje de contacto enviado con éxito!");
        formContacto.reset();
        cargarMensajes(); // Actualiza la bandeja en tiempo real sin recargar página
      } else {
        alert("Error al enviar mensaje: " + (datos.mensaje || "Ocurrió un problema"));
      }
    } catch (error) {
      console.error("Error al enviar mensaje de contacto:", error);
      alert("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
    } finally {
      if (botonSubmit) {
        botonSubmit.disabled = false;
        botonSubmit.innerHTML = '<i class="bi bi-paperplane"></i> Enviar Mensaje';
      }
    }
  });
}

// Consultar y mostrar los mensajes de contacto en pantalla (READ - GET /contacto)
async function cargarMensajes() {
  if (!listaMensajes) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto`);
    const mensajes = await respuesta.json();

    listaMensajes.innerHTML = "";

    if (!Array.isArray(mensajes) || mensajes.length === 0) {
      listaMensajes.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-inbox text-secondary opacity-50 display-4 d-block mb-3"></i>
          <h5 class="text-secondary fw-semibold">No hay mensajes registrados aún</h5>
          <p class="text-muted small">Envía un mensaje desde el formulario de la izquierda para verlo reflejado aquí.</p>
        </div>
      `;
      return;
    }

    mensajes.forEach((msg) => {
      const fecha = msg.fecha_registro
        ? new Date(msg.fecha_registro).toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        })
        : "Reciente";

      const inicial = msg.nombre ? msg.nombre.trim().charAt(0).toUpperCase() : "?";

      const tarjeta = document.createElement("div");
      tarjeta.classList.add("card-mensaje-moderno");

      tarjeta.innerHTML = `
        <div class="mensaje-header-info">
          <div class="mensaje-remitente">
            <div class="avatar-circulo">${inicial}</div>
            <div>
              <strong class="d-block text-dark">${msg.nombre}</strong>
              <small class="text-secondary"><i class="bi bi-envelope me-1"></i>${msg.email}</small>
            </div>
          </div>
          <span class="badge bg-light text-secondary border rounded-pill">
            <i class="bi bi-clock me-1"></i>${fecha}
          </span>
        </div>

        <div class="mensaje-asunto-tag">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-1">Asunto</span>
          ${msg.asunto}
        </div>

        <div class="mensaje-texto-box mb-2">
          ${msg.mensaje}
        </div>

        <div class="text-end">
          <button class="btn btn-sm btn-outline-danger border-0 rounded-pill px-3" onclick="eliminarMensaje(${msg.id})">
            <i class="bi bi-trash3 me-1"></i> Eliminar
          </button>
        </div>
      `;

      listaMensajes.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error al cargar los mensajes:", error);
    listaMensajes.innerHTML = `
      <div class="text-center py-4 text-danger">
        <i class="bi bi-exclamation-triangle me-1"></i> Error al conectar con el servidor para obtener los mensajes.
      </div>
    `;
  }
}

// Eliminar un mensaje de contacto (DELETE /contacto/:id)
async function eliminarMensaje(id) {
  const confirmar = confirm("¿Deseas eliminar este mensaje de contacto?");
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto/${id}`, {
      method: "DELETE",
    });

    if (respuesta.ok) {
      cargarMensajes();
    } else {
      alert("No se pudo eliminar el mensaje.");
    }
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
  }
}

// Botón para refrescar la lista de mensajes manualmente
if (btnRecargarMensajes) {
  btnRecargarMensajes.addEventListener("click", cargarMensajes);
}

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
cargarProductos();
cargarMensajes();
