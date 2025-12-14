document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:3000";
  const form = document.getElementById("formDomiciliario");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    const payload = {
      nombre: (fd.get("nombre") || "").toString().trim(),
      cedula: (fd.get("cedula") || "").toString().trim(),
      telefono: (fd.get("telefono") || "").toString().trim(),
      direccion: (fd.get("direccion") || "").toString().trim(),
      localidad: (fd.get("localidad") || "").toString().trim(),
      barrio: (fd.get("barrio") || "").toString().trim(),
      tipo_vehiculo: (fd.get("tipo_vehiculo") || "").toString().trim(),
      marca_vehiculo: (fd.get("marca_vehiculo") || "").toString().trim(),
      placa: (fd.get("placa") || "").toString().trim(),
      tiene_licencia: (fd.get("tiene_licencia") || "").toString().trim(),
      fecha_expedicion: (fd.get("fecha_expedicion") || "").toString().trim(),
      experiencia: (fd.get("experiencia") || "").toString().trim(),
    };

    if (!payload.nombre || !payload.cedula || !payload.telefono || !payload.tipo_vehiculo || !payload.marca_vehiculo) {
      Swal.fire({ icon:"warning", title:"Campos incompletos", text:"Por favor completa la información requerida." });
      return;
    }

    try {
      const res = await fetch(`${API}/api/solicitudes/domiciliario`, {
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
