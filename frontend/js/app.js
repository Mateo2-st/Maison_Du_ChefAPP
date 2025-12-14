// js/app.js

/* =========================
   STORAGE KEYS
========================= */
const STORAGE_KEYS = {
  USERS: 'mdc_users',
  SESSION: 'mdc_session',
  PRODUCTS: 'mdc_products',
  ORDERS: 'mdc_orders',
  CART: 'mdc_cart',
  SUPPORT: 'mdc_support_requests' // ✅ SOPORTE
};

/* =========================
   STORAGE HELPERS
========================= */
function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   USERS / SESSION
========================= */
function seedDefaultUsers() {
  const users = loadFromStorage(STORAGE_KEYS.USERS, []);
  if (users.length) return;

  saveToStorage(STORAGE_KEYS.USERS, [
    {
      id: 1,
      nombre: 'Admin',
      email: 'admin@maison.com',
      password: 'admin123',
      rol: 'admin',
      specialCode: 'ADMIN-0001'
    },
    {
      id: 2,
      nombre: 'Usuario',
      email: 'usuario@maison.com',
      password: 'usuario123',
      rol: 'usuario',
      specialCode: null
    },
    {
      id: 3,
      nombre: 'Vendedor',
      email: 'vendedor@maison.com',
      password: 'vendedor123',
      rol: 'vendedor',
      specialCode: null
    }
  ]);
}

function loginUser({ email, password, rol }) {
  const users = loadFromStorage(STORAGE_KEYS.USERS, []);
  const user = users.find(
    u => u.email === email && u.password === password && u.rol === rol
  );

  if (!user) throw new Error('Credenciales incorrectas');

  const session = {
    userId: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol
  };

  saveToStorage(STORAGE_KEYS.SESSION, session);
  return session;
}

function getCurrentSession() {
  return loadFromStorage(STORAGE_KEYS.SESSION, null);
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/* =========================
   PROTECT ROUTE
========================= */
function protectRoute(allowedRoles = []) {
  const session = getCurrentSession();

  if (!session) {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = '../pages/login.html';
    }
    return;
  }

  if (
    allowedRoles.length &&
    !allowedRoles.includes(session.rol) &&
    !window.location.pathname.includes('catalogo.html')
  ) {
    window.location.href = '../pages/catalogo.html';
  }
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  seedDefaultUsers();

  const btnLogout =
    document.getElementById('btnCerrarSesion') ||
    document.getElementById('cerrarSesion2');

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      logoutUser();
      window.location.href = '../pages/login.html';
    });
  }
});
