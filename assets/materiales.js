/*
  Catálogo de descargas · dos paquetes.

  Cada archivo existe en /descargas del sitio (respaldo) y tiene su ID de
  Google Drive en `drive`. El ID es la parte entre /d/ y /view del enlace:
    https://drive.google.com/file/d/ESTE_ES_EL_ID/view?usp=sharing

  `fuente` decide de dónde descarga el sitio:
    "sitio" → copias en /descargas (funciona siempre)
    "drive" → Google Drive; cámbialo solo cuando la carpeta sea pública
              ("Cualquier persona con el enlace")
*/
window.MATERIALES = {
  fuente: "sitio",

  paquetes: {
    material: { id: "material", archivo: "material-para-llevar.zip", drive: "", peso: "918 KB" },
    kit:      { id: "kit", archivo: "kit-asistente-skills-claude-code.zip", drive: "", peso: "1 MB" }
  },

  /* Paquete 1 · lo que se llevan, archivo por archivo */
  material: [
    { id: "empieza", n: "00", titulo: "Empieza aquí", archivo: "00-Empieza-aqui.pdf", drive: "", peso: "37 KB",
      desc: "Qué hay en el kit, cómo instalar las skills y qué hacer si solo tienes 20 minutos hoy." },
    { id: "manual", n: "01", titulo: "Manual de Skills para Claude Code", archivo: "01-Manual-Skills-Claude-Code.pdf", drive: "", peso: "1 MB",
      desc: "Fundamentos, cómo se crean, políticas de creación y seguridad, buenas prácticas y diagnóstico. Con índice navegable." },
    { id: "tarjeta", n: "02", titulo: "Tarjeta de referencia", archivo: "02-Tarjeta-de-referencia.pdf", drive: "", peso: "48 KB",
      desc: "Dos páginas. Imprímela a doble cara y pégala junto al monitor." },
    { id: "treinta", n: "03", titulo: "Tus primeros 30 días", archivo: "03-Primeros-30-dias.pdf", drive: "", peso: "45 KB",
      desc: "Guía de adopción semana por semana, para que esto no se quede en el webinar." },
    { id: "destilador", n: "03", titulo: "El prompt destilador", archivo: "03-PROMPT-DESTILADOR.md", drive: "", peso: "6 KB",
      desc: "Convierte una conversación en una skill reutilizable. En markdown porque se copia y se pega." }
  ],

  /* Paquete 2 · las trece skills del kit, por dominio */
  kitSkills: [
    { cat: "desarrollo", titulo: "Ciclo de desarrollo", skills: [
      { id: "revisando-prs", grado: "Alta", desc: "Revisa un PR contra las convenciones, con severidades." },
      { id: "redactando-commits", grado: "Media", desc: "Mensaje de commit convencional desde lo preparado." },
      { id: "generando-pruebas", grado: "Media", desc: "Pruebas con la convención del proyecto, casos borde primero." },
      { id: "documentando-modulos", grado: "Alta", desc: "Documenta qué problema resuelve, no qué hace línea por línea." }
    ]},
    { cat: "proyectos", titulo: "Gestión de proyectos", skills: [
      { id: "redactando-minutas", grado: "Media", desc: "Notas crudas → acuerdos con dueño y fecha." },
      { id: "evaluando-riesgos", grado: "Media", desc: "Registro de riesgos con probabilidad, mitigación y disparador." },
      { id: "preparando-status", grado: "Media", desc: "Reporte de avance con semáforo y decisiones que necesitas." },
      { id: "desglosando-alcance", grado: "Media", desc: "Requerimiento → entregables, tareas y supuestos." }
    ]},
    { cat: "calidad-documental", titulo: "Calidad documental", skills: [
      { id: "validando-entregables", grado: "Media", desc: "Valida un documento antes de enviarlo. Incluye script." },
      { id: "revisando-propuestas", grado: "Media", desc: "Matriz de cumplimiento contra bases de licitación." },
      { id: "verificando-consistencia", grado: "Alta", desc: "Compara varios documentos entre sí: cifras, fechas, datos." }
    ]},
    { cat: "meta", titulo: "Skills sobre skills", skills: [
      { id: "auditando-skills", grado: "Media", desc: "Audita tus skills contra las reglas del manual." },
      { id: "destilando-conversacion", grado: "Media", desc: "El prompt destilador, como skill invocable." }
    ]}
  ]
};
