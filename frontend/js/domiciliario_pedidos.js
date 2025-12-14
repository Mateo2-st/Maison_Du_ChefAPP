document.addEventListener("DOMContentLoaded", async () => {

  const lista = document.getElementById("listaPedidos");
  const sinPedidos = document.getElementById("sinPedidos");
  const token = localStorage.getItem("token");

  // Compatibilidad con sistema anterior (app.js)
  let legacySession = null;
  try {
    if (typeof getCurrentSession === 'function') {
      legacySession = getCurrentSession();
    }
  } catch (e) {
    legacySession = null;
  }

  // Registrar botón de cerrar sesión temprano para que funcione en vista pública
  const btnCerrarTop = document.getElementById("btnCerrarSesion");
  if (btnCerrarTop) {
    btnCerrarTop.addEventListener("click", (e) => {
      e.preventDefault();
      try { if (typeof logoutUser === 'function') logoutUser(); } catch(e){}
      localStorage.removeItem("token");
      localStorage.removeItem("mdc_session");
      window.location.href = "/pages/login.html";
    });
  }

  // Botón volver al catálogo
  const btnVolver = document.getElementById("btnVolverCatalogo");
  if (btnVolver) {
    btnVolver.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/catalogo.html";
    });
  }

  // CTA: ir a login
  const btnIrLogin = document.getElementById('btnIrLogin');
  if (btnIrLogin) {
    btnIrLogin.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/pages/login.html';
    });
  }
  // Si no hay token ni sesión antigua, intentar cargar vista pública (sin acciones)
  if (!token && !legacySession) {
    // mostrar CTA para iniciar sesión
    const cta = document.getElementById('ctaLogin');
    if (cta) cta.classList.remove('oculto');
    try {
      const resPub = await fetch("http://localhost:3000/api/domiciliario/public");
      if (!resPub.ok) throw new Error('No se pudo cargar pedidos públicos');
      const pedidosPub = await resPub.json();
      if (!pedidosPub || pedidosPub.length === 0) {
        sinPedidos.classList.remove("oculto");
        return;
      }

      pedidosPub.forEach(p => {
        const div = document.createElement("div");
        div.className = "pedido";
        const recaudo = Math.round((p.total || 0) * 0.05);

        div.innerHTML = `
          <h3>${p.producto || ''}</h3>
          <p><strong>Restaurante:</strong> ${p.restaurante || ''}</p>
          <p><strong>Dirección entrega:</strong> ${p.direccion_entrega || ''}</p>
          <p><strong>Total pedido:</strong> $${(p.total||0).toLocaleString()}</p>
          <p><strong>Valor a recaudar (5%):</strong> $${recaudo.toLocaleString()}</p>
          <span class="badge pago">${p.metodo_pago || ''}</span>
          <span class="badge entrega">Entrega pendiente</span>
        `;

        lista.appendChild(div);
      });
      return;
    } catch (e) {
      console.error('Error al cargar vista pública:', e);
      sinPedidos.classList.remove('oculto');
      return;
    }
  }

  // Si existe sesión antigua, validar rol localmente
  if (!token && legacySession) {
    if (legacySession.rol !== 'domiciliario') {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Solo los domiciliarios pueden acceder a esta página.",
        willClose: () => {
          window.location.href = "catalogo.html";
        }
      });
      return;
    }
  }

  // Si hay token, verificar en backend
  if (token) {
    try {
      const resVerify = await fetch("http://localhost:3000/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!resVerify.ok) {
        // token inválido -> limpiar y pedir login
        localStorage.removeItem('token');
        window.location.href = "login.html";
        return;
      }

      const userData = await resVerify.json();
      if (userData.id_rol !== 4) {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Solo los domiciliarios pueden acceder a esta página.",
          willClose: () => {
            window.location.href = "catalogo.html";
          }
        });
        return;
      }
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      localStorage.removeItem('token');
      window.location.href = "login.html";
      return;
    }
  }

  

  try {
    const res = await fetch("http://localhost:3000/api/domiciliario/pedidos", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error("No autorizado");
      }
      throw new Error("Error al cargar pedidos");
    }

    const pedidos = await res.json();

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      sinPedidos.classList.remove("oculto");
      return;
    }
    pedidos.forEach(p => {
      const div = document.createElement("div");
      div.className = "pedido";

      const totalVal = Number(p.total) || 0;
      const recaudo = Math.round(totalVal * 0.05);
      const tiempoEstimado = p.tiempo_estimado ?? p.tiempoEstimado ?? 'N/A';
      const nombreCliente = p.nombre_cliente ?? p.nombreCliente ?? '';
      const producto = p.producto ?? p.nombre_producto ?? '';
      const restaurante = p.restaurante ?? p.nombreRestaurante ?? '';
      const metodoPago = p.metodo_pago ?? p.metodoPago ?? '';
      const pedidoId = p.id ?? p.idPedido ?? p.id_pedido ?? '';

      div.innerHTML = `
        <h3>${producto}</h3>
        <p><strong>Restaurante:</strong> ${restaurante}</p>
        <p><strong>Cliente:</strong> ${nombreCliente}</p>
        <p><strong>Dirección entrega:</strong> ${p.direccion_entrega || ''}</p>
        <p><strong>Tiempo estimado:</strong> ${tiempoEstimado}</p>
        <p><strong>Total pedido:</strong> $${totalVal.toLocaleString()}</p>
        <p><strong>Valor a recaudar (5%):</strong> $${recaudo.toLocaleString()}</p>
        <span class="badge pago">${metodoPago}</span>
        <span class="badge entrega">Entrega pendiente</span>
        <div class="botones-acciones">
          <button class="aceptar" data-id="${pedidoId}">
            <i class="fa-solid fa-check"></i> Aceptar pedido
          </button>
          <button class="rechazar" data-id="${pedidoId}">
            <i class="fa-solid fa-times"></i> Rechazar
          </button>
        </div>
      `;

      const btnAceptar = div.querySelector(".aceptar");
      const btnRechazar = div.querySelector(".rechazar");

      if (btnAceptar) {
      btnAceptar.addEventListener("click", async () => {
        const pedidoId = btnAceptar.dataset.id;

        const confirm = await Swal.fire({
          title: "¿Aceptar pedido?",
          text: "Una vez aceptado, comenzarás a realizar la entrega.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, aceptar",
          cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        // deshabilitar botón para evitar dobles clicks
        btnAceptar.disabled = true;
        try {
          const response = await fetch(`http://localhost:3000/api/domiciliario/aceptar/${pedidoId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });

          let respBody = null;
          try { respBody = await response.json(); } catch(e){ respBody = null; }

          if (!response.ok) {
            console.error('Aceptar error detail:', { status: response.status, body: respBody });
            const serverMsg = respBody && (respBody.message || respBody.error) ? (respBody.message + (respBody.error ? '<br><small>' + respBody.error + '</small>' : '')) : `Error al aceptar el pedido (status ${response.status})`;
            await Swal.fire({ icon: 'error', title: 'Error al aceptar pedido', html: `<b>HTTP ${response.status}</b><br>${serverMsg}` });
            btnAceptar.disabled = false;
            return;
          }

          // Cambiar botones por "Marcar entregado" sin recargar
          const botones = div.querySelector('.botones-acciones');
          if (botones) {
            botones.innerHTML = `<button class="entregado" data-id="${pedidoId}"><i class="fa-solid fa-box"></i> Marcar entregado</button>`;

            const btnEntregado = botones.querySelector('.entregado');
            btnEntregado.addEventListener('click', async () => {
              try {
                const respEnt = await fetch(`http://localhost:3000/api/domiciliario/entregado/${pedidoId}`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });

                let bodyEnt = null;
                try { bodyEnt = await respEnt.json(); } catch(e){ bodyEnt = null; }

                if (!respEnt.ok) {
                  console.error('Entregado error detail:', { status: respEnt.status, body: bodyEnt });
                  const mg = bodyEnt && bodyEnt.message ? bodyEnt.message : `Error al marcar entregado (status ${respEnt.status})`;
                  Swal.fire({ icon: 'error', title: 'Error', text: mg });
                  return;
                }

                Swal.fire({ icon: 'success', title: 'Entregado', text: 'Pedido marcado como entregado.' });
                const badge = div.querySelector('.badge.entrega');
                if (badge) badge.textContent = 'Entregado';
                btnEntregado.remove();
              } catch (err) {
                console.error('Entregado fetch error:', err);
                Swal.fire({ icon: 'error', title: 'Error', text: err.message });
              }
            });
          }

          Swal.fire({ icon: 'success', title: 'Pedido aceptado', text: 'Has aceptado el pedido. Usa "Marcar entregado" cuando completes la entrega.' });
        } catch (error) {
          console.error('Aceptar fetch error:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Error al aceptar el pedido' });
          btnAceptar.disabled = false;
        }
      });
      } else {
        console.warn('Botón Aceptar no encontrado para pedido', pedidoId);
      }

      if (btnRechazar) {
      btnRechazar.addEventListener("click", async () => {
        const pedidoId = btnRechazar.dataset.id;

        Swal.fire({
          title: "¿Rechazar pedido?",
          text: "Otros domiciliarios podrán ver este pedido.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, rechazar",
          cancelButtonText: "Cancelar"
        }).then(async (result) => {
          if (!result.isConfirmed) return;
          try {
            const response = await fetch(`http://localhost:3000/api/domiciliario/rechazar/${pedidoId}`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${token}` }
            });

            let respBody = null;
            try { respBody = await response.json(); } catch(e){ respBody = null; }

            if (!response.ok) {
              const msg = respBody && respBody.message ? respBody.message : `Error al rechazar el pedido (status ${response.status})`;
              console.error('Rechazar error detail:', respBody);
              throw new Error(msg);
            }

            Swal.fire({ icon: 'success', title: 'Pedido rechazado', text: 'Has rechazado el pedido.' });
            // eliminar elemento de la lista
            div.remove();
          } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Error al rechazar el pedido.' });
          }
        });
      });

      } else {
        console.warn('Botón Rechazar no encontrado para pedido', pedidoId);
      }

      lista.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error && error.message ? error.message : "No se pudieron cargar los pedidos disponibles.",
      willClose: () => {
        window.location.href = "catalogo.html";
      }
    });
  }

});
