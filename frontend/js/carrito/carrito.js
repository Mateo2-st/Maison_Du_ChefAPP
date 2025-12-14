const list = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");
const checkoutBtn = document.getElementById("checkoutBtn");

const paymentModal = document.getElementById("paymentModal");
const successModal = document.getElementById("successModal");
const paymentTotal = document.getElementById("paymentTotal");
const cardForm = document.getElementById("cardForm");

/* =========================
   CARRITO (LOCALSTORAGE)
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("mdc_cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("mdc_cart", JSON.stringify(cart));
}

/* =========================
   RENDER CARRITO
========================= */
function render() {
  const cart = getCart();
  list.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    list.innerHTML = "<li>Tu carrito está vacío</li>";
    totalSpan.textContent = "0";
    return;
  }

  cart.forEach((p, i) => {
    total += p.precio * p.cantidad;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span>${p.nombreProducto}</span>

      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
        <span class="qty">${p.cantidad}</span>
        <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
      </div>

      <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
    `;
    list.appendChild(li);
  });

  totalSpan.textContent = total.toFixed(2);
}

/* =========================
   CAMBIAR CANTIDAD
========================= */
function changeQty(index, delta) {
  const cart = getCart();
  cart[index].cantidad += delta;

  if (cart[index].cantidad <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  render();
}

/* =========================
   CHECKOUT
========================= */
checkoutBtn.onclick = () => {
  if (getCart().length === 0) return;

  const direccion = document.getElementById("direccion").value.trim();
  if (!direccion) {
    alert("Por favor ingresa tu dirección de entrega");
    return;
  }

  paymentTotal.textContent = totalSpan.textContent;
  paymentModal.classList.add("show");
};

function closePaymentModal() {
  paymentModal.classList.remove("show");
  cardForm.classList.add("hidden");
}

/* =========================
   CREAR PEDIDO + PAGO
========================= */
async function enviarPedido(metodoPago) {
  const cart = getCart();
  if (cart.length === 0) return;

  const user = JSON.parse(localStorage.getItem("mdc_session"));
  const token = localStorage.getItem("mdc_token");
  const direccion = document.getElementById("direccion").value.trim();

  if (!user || !token) {
    alert("Sesión inválida");
    location.href = "login.html";
    return;
  }

  if (!direccion) {
    alert("Por favor ingresa tu dirección de entrega");
    return;
  }

  /* 1️⃣ CREAR PEDIDO */
  const pedidoRes = await fetch("http://localhost:3000/api/ventas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      direccion: direccion,
      fechaPedido: new Date().toISOString().slice(0,19).replace("T"," "),
      detalles: cart.map(p => ({
        id_producto: p.idProducto,
        cantidad: p.cantidad
      }))
    })
  });

  if (!pedidoRes.ok) {
    alert("Error al crear el pedido");
    return;
  }

  const pedidoData = await pedidoRes.json();
  const idPedido = pedidoData.pedido.idPedido;

  /* 2️⃣ REGISTRAR PAGO */
  const total = cart.reduce((s,p) => s + p.precio * p.cantidad, 0);

  const pagoRes = await fetch("http://localhost:3000/api/pago", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id_pedido: idPedido,
      metodo: metodoPago, // efectivo | tarjeta
      monto: total,
      fecha: new Date().toISOString().slice(0,19).replace("T"," ")
    })
  });

  if (!pagoRes.ok) {
    alert("El pedido se creó, pero el pago falló");
    return;
  }

  /* 3️⃣ LIMPIAR Y MOSTRAR ÉXITO */
  localStorage.removeItem("mdc_cart");
  paymentModal.classList.remove("show");
  successModal.classList.add("show");
}

/* =========================
   MÉTODOS DE PAGO
========================= */
function payCash() {
  enviarPedido("efectivo");
}

function showCard() {
  cardForm.classList.remove("hidden");
}

function payCard() {
  enviarPedido("tarjeta");
}

/* =========================
   FINALIZAR
========================= */
function finish() {
  successModal.classList.remove("show");
  location.href = "catalogo.html";
}

/* INIT */
render();
  