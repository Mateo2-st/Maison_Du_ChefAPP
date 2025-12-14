document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tablaUsuarios");
  const filtro = document.getElementById("filtroRol");

  async function cargarUsuarios() {
    try {
      const token = localStorage.getItem("token");
      console.log(">>> Enviando token:", token);

      if (!token) {
        Swal.fire("Error", "No hay sesión activa", "error");
        return;
      }

      const res = await fetch("http://localhost:3000/api/auth/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });

      console.log("Respuesta /users status:", res.status);

      // intenta leer JSON aunque no sea ok para ver mensaje de error
      let body;
      try { body = await res.json(); } catch(e) { body = await res.text(); }
      console.log("Respuesta /users body:", body);

      if (!res.ok) {
        Swal.fire("Error", body.message || "No autorizado o error servidor", "error");
        return;
      }

      renderTabla(body);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
      console.error("ERROR CARGAR USUARIOS:", err);
    }
  }

  function renderTabla(users) {
    tabla.innerHTML = "";
    const rolFiltro = filtro.value;
    users
      .filter(u => rolFiltro === "todos" || u.rol === rolFiltro)
      .forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.nombre}</td>
          <td>${u.correo}</td>
          <td>${u.rol}</td>
          <td><i>Sin código</i></td>
          <td>
            <button class="admin-btn" onclick="editarUsuario(${u.idUsuario})">Editar</button>
            <button class="admin-btn-admin" onclick="eliminarUsuario(${u.idUsuario})">Eliminar</button>
          </td>`;
        tabla.appendChild(tr);
      });
  }

  filtro.addEventListener("change", cargarUsuarios);
  cargarUsuarios();
});

