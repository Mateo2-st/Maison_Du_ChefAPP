const API = "http://localhost:3000";

/* =========================
   DOM
========================= */
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

const btnVolver = document.getElementById("btnVolver");
const btnRefrescar = document.getElementById("btnRefrescar");

const tbodyUsuarios = document.getElementById("tbodyUsuarios");
const searchText = document.getElementById("searchText");
const filterEstado = document.getElementById("filterEstado");

/* Drawer */
const btnCerrarDrawer = document.getElementById("btnCerrarDrawer");
const formUsuario = document.getElementById("formUsuario");
const userId = document.getElementById("userId");
const userNombre = document.getElementById("userNombre");
const userCorreo = document.getElementById("userCorreo");
const userEstado = document.getElementById("userEstado");
const userPass1 = document.getElementById("userPass1");
const userPass2 = document.getElementById("userPass2");
const btnLimpiarPass = document.getElementById("btnLimpiarPass");
const toast = document.getElementById("toast");

/* Seguridad */
const policyStrongPassword = document.getElementById("policyStrongPassword");
const policyLockout = document.getElementById("policyLockout");
const jwtExpire = document.getElementById("jwtExpire");
const btnGuardarSeguridad = document.getElementById("btnGuardarSeguridad");
const btnLimpiarSeguridad = document.getElementById("btnLimpiarSeguridad");

/* =========================
   STATE
========================= */
let usuariosCache = [];

/* =========================
   HELPERS
========================= */
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function showToast(msg, type="ok"){
  toast.style.display = "block";
  toast.textContent = msg;

  if(type === "err"){
    toast.style.borderColor = "#f1d1cd";
    toast.style.background = "#fff0ef";
  }else{
    toast.style.borderColor = "#e7dccf";
    toast.style.background = "#fff7ee";
  }

  setTimeout(()=> toast.style.display = "none", 2600);
}

function apiErrorToast(){
  // SIN CÓDIGOS, SIN NÚMEROS
  showToast("No se pudo conectar con el servidor. Revisa el backend y vuelve a intentar.", "err");
}

/* =========================
   TABS (FUNCIONA SIEMPRE)
========================= */
function activarTab(nombre){
  tabs.forEach(t => t.classList.remove("active"));
  tabContents.forEach(c => c.classList.remove("active"));

  const tabBtn = Array.from(tabs).find(b => b.dataset.tab === nombre);
  const tabDiv = document.getElementById(`tab-${nombre}`);

  if(tabBtn) tabBtn.classList.add("active");
  if(tabDiv) tabDiv.classList.add("active");
}

tabs.forEach(t => {
  t.addEventListener("click", () => {
    activarTab(t.dataset.tab);
    limpiarEdicion();
  });
});

/* =========================
   NAVEGACIÓN
========================= */
btnVolver.addEventListener("click", () => {
  // Regresa a tu panel administrador
  window.location.href = "cuenta_administrador.html";
});

/* =========================
   USUARIOS (CARGA + RENDER)
========================= */
async function cargarUsuarios(){
  try{
    const res = await fetch(`${API}/api/usuarios`);
    if(!res.ok) throw new Error();
    usuariosCache = await res.json();
    renderUsuarios();
  }catch{
    apiErrorToast();
  }
}

function renderUsuarios(){
  const q = searchText.value.trim().toLowerCase();
  const estado = filterEstado.value;

  const filtrados = usuariosCache.filter(u => {
    const nombre = (u.nombre ?? "").toLowerCase();
    const correo = (u.correo ?? "").toLowerCase();
    const estadoU = String(u.estado ?? "").toLowerCase();

    const matchText = nombre.includes(q) || correo.includes(q);
    const matchEstado = !estado || estadoU === estado;

    return matchText && matchEstado;
  });

  tbodyUsuarios.innerHTML = "";

  filtrados.forEach(u => {
    const estadoU = String(u.estado ?? "activo").toLowerCase();
    const badgeClass = estadoU === "bloqueado" ? "badge badge--block" : "badge";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(u.nombre)}</td>
      <td>${escapeHtml(u.correo)}</td>
      <td><span class="${badgeClass}">${escapeHtml(estadoU)}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn--ghost" type="button">Editar</button>
        </div>
      </td>
    `;

    tr.querySelector("button").addEventListener("click", () => abrirEdicion(u));
    tbodyUsuarios.appendChild(tr);
  });
}

searchText.addEventListener("input", renderUsuarios);
filterEstado.addEventListener("change", renderUsuarios);

btnRefrescar.addEventListener("click", async () => {
  await cargarUsuarios();
  showToast("Datos actualizados");
});

/* =========================
   EDICIÓN (DRAWER)
========================= */
function getUserId(u){
  return u.idUsuario ?? u.id ?? u.id_usuario ?? null;
}

function abrirEdicion(u){
  const id = getUserId(u);
  if(!id){
    showToast("No se pudo abrir el usuario seleccionado", "err");
    return;
  }

  userId.value = id;
  userNombre.value = u.nombre ?? "";
  userCorreo.value = u.correo ?? "";
  userEstado.value = String(u.estado ?? "activo").toLowerCase();

  userPass1.value = "";
  userPass2.value = "";

  document.getElementById("drawerTitle").textContent = "Editar usuario";
  document.getElementById("drawerSubtitle").textContent = "Modifica los datos y guarda los cambios.";
}

function limpiarEdicion(){
  userId.value = "";
  userNombre.value = "";
  userCorreo.value = "";
  userEstado.value = "activo";
  userPass1.value = "";
  userPass2.value = "";

  document.getElementById("drawerTitle").textContent = "Editar usuario";
  document.getElementById("drawerSubtitle").textContent = "Selecciona un usuario en la tabla.";
}

btnCerrarDrawer.addEventListener("click", limpiarEdicion);

btnLimpiarPass.addEventListener("click", () => {
  userPass1.value = "";
  userPass2.value = "";
  showToast("Contraseña limpia");
});

/* =========================
   GUARDAR CAMBIOS (REAL)
========================= */
formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = userId.value;
  if(!id){
    showToast("Selecciona un usuario primero", "err");
    return;
  }

  const nombre = userNombre.value.trim();
  const correo = userCorreo.value.trim();
  const estado = userEstado.value;

  if(!nombre || !correo){
    showToast("Completa nombre y correo", "err");
    return;
  }

  try{
    // 1) Actualizar usuario
    const resUser = await fetch(`${API}/api/usuarios/${encodeURIComponent(id)}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ nombre, correo, estado })
    });

    if(!resUser.ok) throw new Error();

    // 2) Password opcional
    const p1 = userPass1.value;
    const p2 = userPass2.value;

    if(p1 || p2){
      if(p1 !== p2){
        showToast("Las contraseñas no coinciden", "err");
        return;
      }

      if(p1.length < 6){
        showToast("La contraseña es muy corta", "err");
        return;
      }

      const resPass = await fetch(`${API}/api/usuarios/${encodeURIComponent(id)}/password`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ password: p1 })
      });

      if(!resPass.ok) throw new Error();

      userPass1.value = "";
      userPass2.value = "";
    }

    showToast("Cambios guardados correctamente");
    await cargarUsuarios();
    limpiarEdicion();

  }catch{
    showToast("No se pudieron guardar los cambios. Intenta nuevamente.", "err");
  }
});

/* =========================
   SEGURIDAD (FUNCIONAL)
   - Si el backend no existe, avisa sin códigos ni números.
========================= */
btnLimpiarSeguridad.addEventListener("click", () => {
  policyStrongPassword.checked = false;
  policyLockout.checked = false;
  jwtExpire.value = "";
  showToast("Ajustes limpiados");
});

btnGuardarSeguridad.addEventListener("click", async () => {
  const payload = {
    strongPassword: !!policyStrongPassword.checked,
    lockout: !!policyLockout.checked,
    jwtExpire: jwtExpire.value.trim()
  };

  try{
    const res = await fetch(`${API}/api/config/seguridad`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    if(!res.ok) throw new Error();

    showToast("Ajustes de seguridad guardados");
  }catch{
    showToast("No se pudieron guardar los ajustes de seguridad. Revisa el backend.", "err");
  }
});

/* =========================
   INIT
========================= */
(function init(){
  activarTab("usuarios");
  cargarUsuarios();
})();
