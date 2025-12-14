document.addEventListener("DOMContentLoaded", async () => {
  console.log("INFORMES.JS CARGADO");

  try {
    const token = localStorage.getItem("mdc_token");

    if (!token) {
      console.warn("No hay token en localStorage (mdc_token)");
    }

    const res = await fetch("/api/ventas/admin", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("STATUS:", res.status);

    const data = await res.json();
    console.log("RESPUESTA JSON:", data);

    // Informes cargados (no insertar contenido global en body para evitar espacios)
    // Mostrar conteo simple (ahora calculado por pedidos únicos)
    const ventas = Array.isArray(data) ? data : [];

    // Agrupar por pedido (cada fila viene por detalle)
    const pedidosMap = new Map();
    let totalIngresos = 0;

    for (const row of ventas) {
      const id = row.idPedido;
      const cantidad = Number(row.cantidad) || 0;
      const precio = Number(row.precio) || 0;
      const lineaTotal = cantidad * precio;
      totalIngresos += lineaTotal;

      if (!pedidosMap.has(id)) {
        pedidosMap.set(id, {
          idPedido: id,
          usuario: row.usuario || row.cliente || "-",
          direccion: row.direccion || "-",
          fechaPedido: row.fechaPedido || "-",
          estado: row.estado || "-",
          total: lineaTotal
        });
      } else {
        pedidosMap.get(id).total += lineaTotal;
      }
    }

    const totalPedidosUnicos = pedidosMap.size;

    // Actualizar resumen en la página si existen elementos
    const totalVentasEl = document.getElementById("totalVentas");
    const totalPedidosEl = document.getElementById("totalPedidos");
    const pagoFrecuenteEl = document.getElementById("pagoFrecuente");

    if (totalVentasEl) totalVentasEl.textContent = `$${totalIngresos.toFixed(2)}`;
    if (totalPedidosEl) totalPedidosEl.textContent = totalPedidosUnicos;
    if (pagoFrecuenteEl) pagoFrecuenteEl.textContent = "-";

    // Renderizar tabla
    const tabla = document.getElementById("tablaPedidos");
    if (tabla) {
      tabla.innerHTML = "";
      for (const pedido of pedidosMap.values()) {
        const tr = document.createElement("tr");
        const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleString() : "-";

        tr.innerHTML = `
          <td>${pedido.idPedido}</td>
          <td>${pedido.usuario}</td>
          <td>${pedido.direccion}</td>
          <td>${fecha}</td>
          <td>${pedido.estado}</td>
        `;

        tabla.appendChild(tr);
      }
    }

    // No insertar elementos fuera de la estructura de la página (usar los elementos existentes)

  } catch (err) {
    console.error("ERROR FETCH:", err);
  }
});
