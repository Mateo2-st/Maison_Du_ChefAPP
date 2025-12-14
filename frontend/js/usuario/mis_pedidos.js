document.addEventListener("DOMContentLoaded", async () => {

  const lista = document.getElementById("listaPedidos");
  const sinPedidos = document.getElementById("sinPedidos");

  const token = localStorage.getItem("mdc_token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/ventas/mis-pedidos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error();

    const rows = await res.json();

    if (!rows.length) {
      sinPedidos.classList.remove("oculto");
      return;
    }

    // 🔥 AGRUPAR POR PEDIDO
    const pedidos = {};

    rows.forEach(r => {
      if (!pedidos[r.idPedido]) {
        pedidos[r.idPedido] = {
          idPedido: r.idPedido,
          fecha: r.fechaPedido,
          estado: r.estado,
          restaurante: r.nombreRestaurante,
          productos: []
        };
      }

      pedidos[r.idPedido].productos.push({
        nombre: r.nombreProducto,
        cantidad: r.cantidad,
        precio: r.precio
      });
    });

    // 🖼️ RENDER
    Object.values(pedidos).forEach(pedido => {
      const div = document.createElement("div");
      div.className = "pedido";

      const fecha = new Date(pedido.fecha).toLocaleDateString("es-CO");

      div.innerHTML = `
        <h3>Pedido #${pedido.idPedido}</h3>
        <p><strong>Restaurante:</strong> ${pedido.restaurante}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>

        <ul class="productos">
          ${pedido.productos.map(p => `
            <li>
              ${p.nombre} × ${p.cantidad}
              <span>$${(p.precio * p.cantidad).toLocaleString()}</span>
            </li>
          `).join("")}
        </ul>

        <span class="estado">${pedido.estado}</span>
      `;

      lista.appendChild(div);
    });

  } catch (e) {
    console.error(e);
    sinPedidos.classList.remove("oculto");
  }
});
