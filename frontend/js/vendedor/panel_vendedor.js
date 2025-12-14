document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     SESIÓN
  ========================= */
  const token = localStorage.getItem("mdc_token");
  const sessionRaw = localStorage.getItem("mdc_session");

  if (!token || !sessionRaw) {
    window.location.href = "/pages/login.html";
    return;
  }

  let user;
  try {
    user = JSON.parse(sessionRaw);
  } catch {
    localStorage.clear();
    window.location.href = "/pages/login.html";
    return;
  }

  const idUsuario = user.id || user.idUsuario;
  if (!idUsuario) {
    console.error("ID usuario no encontrado");
    return;
  }

  /* =========================
     DOM
  ========================= */
  const btnNuevo = document.getElementById("btnNuevoProducto");
  const btnVolver = document.getElementById("btnVolver");
  const btnLogout = document.getElementById("btnLogout");

  const modal = document.getElementById("modalProducto");
  const cerrarModal = document.getElementById("cerrarModalProd");
  const guardarBtn = document.getElementById("guardarProducto");

  const inputNombre = document.getElementById("prodNombre");
  const inputPrecio = document.getElementById("prodPrecio");
  const selectCategoria = document.getElementById("prodCategoria");
  const selectRestaurante = document.getElementById("prodRestaurante");

  const tablaBody = document.querySelector("#tablaProductos tbody");
  const contenedorPedidos = document.getElementById("listaPedidos");

  let editId = null;

  /* =========================
     CATEGORÍAS
  ========================= */
  async function cargarCategorias() {
    const res = await fetch("http://localhost:3000/api/categorias");
    const data = await res.json();

    selectCategoria.innerHTML = `<option value="">Seleccione categoría</option>`;
    data.forEach(c => {
      selectCategoria.innerHTML += `
        <option value="${c.idCategoria}">${c.nombreCategoria}</option>`;
    });
  }

  /* =========================
     RESTAURANTES DEL VENDEDOR
  ========================= */
  async function cargarRestaurantes() {
    const res = await fetch(
      `http://localhost:3000/api/restaurantes/dueno/${idUsuario}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    selectRestaurante.innerHTML = `<option value="">Seleccione restaurante</option>`;
    data.forEach(r => {
      selectRestaurante.innerHTML += `
        <option value="${r.idRestaurante}">${r.nombreRestaurante}</option>`;
    });
  }

  /* =========================
     PRODUCTOS
  ========================= */
  async function cargarProductos() {
    const res = await fetch("http://localhost:3000/api/product", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    tablaBody.innerHTML = "";

    data.forEach(p => {
      tablaBody.innerHTML += `
        <tr>
          <td>${p.idProducto}</td>
          <td>${p.nombreProducto}</td>
          <td>${p.precio}</td>
          <td>${p.nombreCategoria}</td>
          <td>${p.nombreRestaurante}</td>
          <td>
            <button class="editar" data-id="${p.idProducto}">Editar</button>
            <button class="eliminar" data-id="${p.idProducto}">Eliminar</button>
          </td>
        </tr>`;
    });
  }

  /* =========================
     NUEVO PRODUCTO
  ========================= */
  btnNuevo?.addEventListener("click", async () => {
    editId = null;
    inputNombre.value = "";
    inputPrecio.value = "";

    await cargarCategorias();
    await cargarRestaurantes();

    modal.classList.add("show");
  });

  cerrarModal?.addEventListener("click", () =>
    modal.classList.remove("show")
  );

  /* =========================
     EDITAR PRODUCTO
  ========================= */
  async function abrirEditarProducto(idProducto) {
    editId = idProducto;

    await cargarCategorias();
    await cargarRestaurantes();

    const res = await fetch(
      `http://localhost:3000/api/product/${idProducto}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const p = await res.json();

    inputNombre.value = p.nombreProducto;
    inputPrecio.value = p.precio;
    selectCategoria.value = p.id_categoria;
    selectRestaurante.value = p.id_restaurante;

    modal.classList.add("show");
  }

  /* =========================
     GUARDAR PRODUCTO
  ========================= */
  guardarBtn?.addEventListener("click", async () => {
    if (
      !inputNombre.value ||
      !inputPrecio.value ||
      !selectCategoria.value ||
      !selectRestaurante.value
    ) {
      alert("Completa todos los campos");
      return;
    }

    const payload = {
      nombreProducto: inputNombre.value,
      precio: inputPrecio.value,
      id_categoria: selectCategoria.value,
      id_restaurante: selectRestaurante.value
    };

    const url = editId
      ? `http://localhost:3000/api/product/${editId}`
      : "http://localhost:3000/api/product";

    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    modal.classList.remove("show");
    cargarProductos();
  });

  /* =========================
     TABLA PRODUCTOS
  ========================= */
  tablaBody?.addEventListener("click", async e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("eliminar")) {
      await fetch(`http://localhost:3000/api/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarProductos();
    }

    if (e.target.classList.contains("editar")) {
      abrirEditarProducto(id);
    }
  });

  /* =========================
     PEDIDOS DEL RESTAURANTE
  ========================= */
  async function cargarPedidosRestaurante() {
    if (!contenedorPedidos) return;

    try {
      const res = await fetch(
        "http://localhost:3000/api/ventas/restaurante",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error();

      const pedidos = await res.json();
      contenedorPedidos.innerHTML = "";

      if (pedidos.length === 0) {
        contenedorPedidos.innerHTML = "<p>No hay pedidos aún.</p>";
        return;
      }

      const pedidosAgrupados = {};

      pedidos.forEach(p => {
        if (!pedidosAgrupados[p.idPedido]) {
          pedidosAgrupados[p.idPedido] = {
            idPedido: p.idPedido,
            cliente: p.cliente,
            estado: p.estado,
            productos: []
          };
        }

        pedidosAgrupados[p.idPedido].productos.push({
          nombre: p.nombreProducto,
          cantidad: p.cantidad,
          precio: p.precio
        });
      });

      Object.values(pedidosAgrupados).forEach(pedido => {
        const div = document.createElement("div");
        div.className = "pedido";

        div.innerHTML = `
          <h3>Pedido #${pedido.idPedido}</h3>
          <p><strong>Cliente:</strong> ${pedido.cliente}</p>

          <ul>
            ${pedido.productos.map(prod => `
              <li>
                ${prod.nombre} × ${prod.cantidad}
                <strong>$${(prod.precio * prod.cantidad).toFixed(2)}</strong>
              </li>
            `).join("")}
          </ul>

          <p><strong>Estado:</strong> ${pedido.estado}</p>
          <hr>
        `;

        contenedorPedidos.appendChild(div);
      });

    } catch (err) {
      console.error("Error pedidos restaurante:", err);
      contenedorPedidos.innerHTML = "<p>Error al cargar pedidos</p>";
    }
  }

  /* =========================
     VOLVER / LOGOUT
  ========================= */
  btnVolver?.addEventListener("click", () => {
    window.location.href = "/pages/catalogo.html";
  });

  btnLogout?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/pages/login.html";
  });

  /* =========================
     INIT
  ========================= */
  cargarProductos();
  cargarPedidosRestaurante();
});

function agruparPedidos(pedidos) {
  const agrupados = {};

  pedidos.forEach(p => {
    if (!agrupados[p.idPedido]) {
      agrupados[p.idPedido] = {
        idPedido: p.idPedido,
        fecha: p.fechaPedido,
        estado: p.estado,
        cliente: p.cliente,
        restaurante: p.nombreRestaurante,
        productos: []
      };
    }

    agrupados[p.idPedido].productos.push({
      nombre: p.nombreProducto,
      cantidad: p.cantidad,
      precio: p.precio
    });
  });

  return Object.values(agrupados);
}

async function cargarPedidosRestaurante() {
  const contenedor = document.getElementById("listaPedidos");

  const res = await fetch("http://localhost:3000/api/ventas/restaurante", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  const pedidos = agruparPedidos(data);

  contenedor.innerHTML = "";

  if (pedidos.length === 0) {
    contenedor.innerHTML = "<p>No hay pedidos aún.</p>";
    return;
  }

  pedidos.forEach(p => {
    const div = document.createElement("div");
    div.className = "pedido-card";

    div.innerHTML = `
      <h3>Pedido #${p.idPedido}</h3>
      <p><strong>Cliente:</strong> ${p.cliente}</p>
      <p><strong>Estado:</strong> 
        <select data-id="${p.idPedido}" class="estadoPedido">
          <option ${p.estado === "pendiente" ? "selected" : ""}>pendiente</option>
          <option ${p.estado === "preparando" ? "selected" : ""}>preparando</option>
          <option ${p.estado === "enviado" ? "selected" : ""}>enviado</option>
          <option ${p.estado === "entregado" ? "selected" : ""}>entregado</option>
        </select>
      </p>

      <ul>
        ${p.productos.map(prod => `
          <li>
            ${prod.nombre} × ${prod.cantidad}
            — $${(prod.precio * prod.cantidad).toFixed(2)}
          </li>
        `).join("")}
      </ul>
    `;

    contenedor.appendChild(div);
  });
}
