document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:3000";
  const form = document.getElementById("formRestaurante");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const categoriasSelect = form.querySelector('select[name="categorias"]');
    const categorias = Array.from(categoriasSelect.selectedOptions).map(o => o.value);

    const payload = {
      nombre_restaurante: (fd.get("nombre_restaurante") || "").toString().trim(),
      categorias,
      experiencia: (fd.get("experiencia") || "").toString().trim(),
      nombre_propietario: (fd.get("nombre_propietario") || "").toString().trim(),
      cedula: (fd.get("cedula") || "").toString().trim(),
      telefono: (fd.get("telefono") || "").toString().trim(),
      direccion_residencia: (fd.get("direccion_residencia") || "").toString().trim(),
      direccion_restaurante: (fd.get("direccion_restaurante") || "").toString().trim(),
    };

    if (!payload.nombre_restaurante || !payload.nombre_propietario || !payload.cedula || !payload.telefono) {
      Swal.fire({ icon:"warning", title:"Campos incompletos", text:"Por favor completa la información requerida." });
      return;
    }
    if (!categorias.length) {
      Swal.fire({ icon:"warning", title:"Categorías", text:"Selecciona al menos una categoría." });
      return;
    }

    try {
      const res = await fetch(`${API}/api/solicitudes/restaurante`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });

      if(!res.ok) throw new Error();

      form.reset();
      Swal.fire({
        icon: "success",
        title: "Formulario enviado",
        text: "Envío de formulario exitoso, pronto recibirás una respuesta."
      }).then(() => {
        window.location.href = "inicio.html";
      });

    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo enviar",
        text: "No se pudo enviar el formulario, intenta nuevamente."
      });
    }
  });
});
