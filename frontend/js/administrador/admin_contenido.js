document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("mdc_token");
  const tabla = document.getElementById("tablaRestaurantes");
  const modal = document.getElementById("modalRestaurante");
  const btnNuevo = document.getElementById("btnNuevoRestaurante");
  const btnCerrarModal = document.getElementById("cerrarModalRest");
  const guardarBtn = document.getElementById("guardarRestaurante");

  let editarId = null;

  async function cargarRestaurantes() {
    try {
      const res = await fetch("http://localhost:3000/api/restaurantes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const restaurantes = await res.json();
      tabla.innerHTML = "";

      restaurantes.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.idRestaurante}</td>
          <td>${r.nombre}</td>
          <td>${r.direccion}</td>
          <td>${r.telefono}</td>
          <td>
            <button class="admin-btn" onclick="editarRestaurante(${r.idRestaurante})">Editar</button>
            <button class="admin-btn-admin" onclick="eliminarRestaurante(${r.idRestaurante})">Eliminar</button>
          </td>
        `;
        tabla.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los restaurantes", "error");
    }
  }

  btnNuevo.addEventListener("click", () => {
    editarId = null;
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Nuevo Restaurante";
    document.getElementById("restNombre").value = "";
    document.getElementById("restDireccion").value = "";
    document.getElementById("restTelefono").value = "";
    document.getElementById("restImagen").value = "";
  });

  btnCerrarModal.addEventListener("click", () => modal.classList.add("hidden"));

  guardarBtn.addEventListener("click", async () => {
    const nombre = document.getElementById("restNombre").value;
    const direccion = document.getElementById("restDireccion").value;
    const telefono = document.getElementById("restTelefono").value;

    if (!nombre) return Swal.fire("Error", "El nombre es obligatorio", "error");

    try {
      const url = editarId
        ? `http://localhost:3000/api/restaurantes/${editarId}`
        : "http://localhost:3000/api/restaurantes";

      const method = editarId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, direccion, telefono })
      });

      if (!res.ok) throw new Error("Error al guardar el restaurante");

      Swal.fire("Guardado", "Restaurante guardado correctamente", "success");
      modal.classList.add("hidden");
      cargarRestaurantes();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  });

  window.editarRestaurante = async function(id) {
    try {
      const res = await fetch(`http://localhost:3000/api/restaurantes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const r = await res.json();
      editarId = r.idRestaurante;
      modal.classList.remove("hidden");
      document.getElementById("modalTitle").textContent = `Editar Restaurante (ID: ${r.idRestaurante})`;
      document.getElementById("restNombre").value = r.nombre;
      document.getElementById("restDireccion").value = r.direccion;
      document.getElementById("restTelefono").value = r.telefono;
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo obtener el restaurante", "error");
    }
  };

  window.eliminarRestaurante = async function(id) {
    const confirm = await Swal.fire({
      title: "¿Eliminar este restaurante?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/api/restaurantes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("No se pudo eliminar el restaurante");
      Swal.fire("Eliminado", "Restaurante eliminado correctamente", "success");
      cargarRestaurantes();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  await cargarRestaurantes();
});
