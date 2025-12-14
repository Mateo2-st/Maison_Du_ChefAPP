document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("mdc_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  /* =========================
     CARRITO
  ========================= */
  function getCart() {
    return JSON.parse(localStorage.getItem("mdc_cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("mdc_cart", JSON.stringify(cart));
  }

  function updateCartCounter(anim = false) {
    const badge = document.getElementById("cartCountHeader");
    if (!badge) return;

    const cart = getCart();
    badge.textContent = cart.reduce((s, p) => s + p.cantidad, 0);

    if (anim) {
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    }
  }

  function addToCart(producto) {
    const cart = getCart();
    const found = cart.find(p => p.idProducto === producto.idProducto);

    if (found) {
      found.cantidad++;
    } else {
      cart.push({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        precio: producto.precio,
        cantidad: 1
      });
    }

    saveCart(cart);
    updateCartCounter(true);
  }

  updateCartCounter();

  /* =========================
     MODAL RESTAURANTE
  ========================= */
  const modal = document.getElementById("restaurantModal");
  const modalProducts = document.getElementById("modalProducts");
  const modalName = document.getElementById("modalName");
  const modalMeta = document.getElementById("modalMeta");
  const modalLogo = document.getElementById("modalLogo");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  modalCloseBtn.onclick = () => modal.classList.remove("show");

  /* =========================
     CARGAR RESTAURANTES
  ========================= */
  fetch("http://localhost:3000/api/restaurantes", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(restaurantes => {
      const grid = document.getElementById("restaurantsGrid");
      grid.innerHTML = "";

      restaurantes.forEach(rest => {
        const card = document.createElement("div");
        card.className = "restaurant-card";

        card.innerHTML = `
          <img class="card-image" src="${rest.imagen || '../imagenes/default_restaurante.jpg'}">
          <div class="card-body">
            <div class="card-title">${rest.nombreRestaurante}</div>
            <div class="card-meta">${rest.direccion || ""}</div>
          </div>
        `;

        card.onclick = () => abrirRestaurante(rest);
        grid.appendChild(card);
      });
    })
    .catch(err => console.error("Error cargando restaurantes:", err));

  /* =========================
     ABRIR RESTAURANTE + PRODUCTOS
  ========================= */
  function abrirRestaurante(rest) {
    modal.classList.add("show");

    modalName.textContent = rest.nombreRestaurante;
    modalMeta.textContent = rest.direccion || "";
    modalLogo.src = rest.imagen || "../imagenes/default_restaurante.jpg";

    modalProducts.innerHTML = "<p>Cargando productos...</p>";

    // 🔥 ID SEGURO (ESTA ES LA CLAVE)
    const restauranteId =
      rest.idRestaurante || rest.id || rest.id_restaurante;

    console.log("Restaurante ID usado:", restauranteId);

    fetch(`http://localhost:3000/api/product/restaurante/${restauranteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(productos => {
        console.log("Productos recibidos:", productos);

        modalProducts.innerHTML = "";

        if (!productos.length) {
          modalProducts.innerHTML = "<p>No hay productos disponibles.</p>";
          return;
        }

        productos.forEach(p => {
          const row = document.createElement("div");
          row.className = "product-row";
          row.innerHTML = `
            <span>${p.nombreProducto} - $${p.precio}</span>
            <button class="add-cart-btn">Agregar</button>
          `;

          row.querySelector("button").onclick = () => addToCart(p);
          modalProducts.appendChild(row);
        });
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        modalProducts.innerHTML = "<p>Error al cargar productos.</p>";
      });
  }
});
