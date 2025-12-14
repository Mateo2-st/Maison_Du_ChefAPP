// js/soporte.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formSoporte");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const session = getCurrentSession();
    if (!session) {
      Swal.fire(
        "Sesión requerida",
        "Debes iniciar sesión para enviar soporte",
        "warning"
      );
      return;
    }

    const fd = new FormData(form);

    const solicitud = {
      id: Date.now(),
      usuario: session.email,
      nombre: fd.get("nombre"),
      correo: fd.get("correo"),
      telefono: fd.get("telefono"),
      motivo: fd.get("motivo"),
      mensaje: fd.get("mensaje"),
      fecha: new Date().toISOString(),
      estado: "pendiente"
    };

    const solicitudes = loadFromStorage(STORAGE_KEYS.SUPPORT, []);
    solicitudes.push(solicitud);
    saveToStorage(STORAGE_KEYS.SUPPORT, solicitudes);

    form.reset();

    Swal.fire({
      icon: "success",
      title: "Solicitud enviada",
      text: "Tu solicitud fue enviada correctamente. Te responderemos pronto."
    }).then(() => {
      window.location.href = "catalogo.html";
    });
  });
});
