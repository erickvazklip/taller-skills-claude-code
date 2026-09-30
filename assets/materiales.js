/*
  Catálogo de descargas.

  Cada archivo existe en /descargas del sitio (respaldo) y, cuando pegas su
  ID de Google Drive en `drive`, el botón descarga desde Drive sin salir de
  la página. El ID es la parte entre /d/ y /view del enlace para compartir:
    https://drive.google.com/file/d/ESTE_ES_EL_ID/view?usp=sharing
  El archivo en Drive debe estar compartido como "Cualquier persona con el enlace".
*/
window.MATERIALES = {
  kit: { archivo: "kit-completo.zip", drive: "", peso: "34 KB" },

  guias: [
    { id: "cuadernillo", titulo: "Cuadernillo de referencia", archivo: "CUADERNILLO.md", drive: "", peso: "11 KB",
      desc: "Lo que consultas tres semanas después: estructura, descripción, frontmatter, grados de libertad, diagnóstico y antipatrones.",
      etiqueta: "Referencia" },
    { id: "plan", titulo: "Plan de adopción en 30 días", archivo: "PLAN-DE-ADOPCION.md", drive: "", peso: "4 KB",
      desc: "Cómo llevar skills a un equipo: elegir casos, construir, versionar, revisar y medir a los 30 días.",
      etiqueta: "Para tu empresa" },
    { id: "rubrica", titulo: "Rúbrica y evaluaciones", archivo: "RUBRICA.md", drive: "", peso: "5 KB",
      desc: "Los seis criterios, los niveles de madurez y la plantilla de las tres evaluaciones con línea base.",
      etiqueta: "Calidad" },
    { id: "kit-lectura", titulo: "Kit de lectura posterior", archivo: "KIT-LECTURA.md", drive: "", peso: "9 KB",
      desc: "Los 12 temas que no caben en tres horas: argumentos, presupuesto del listado, plugins, configuración administrada.",
      etiqueta: "Profundizar" },
    { id: "preparacion", titulo: "Guía de preparación", archivo: "PREPARACION.md", drive: "", peso: "5 KB",
      desc: "Siete pasos, 15 minutos, para dejar listo el ambiente. Útil para replicar el taller con tu equipo.",
      etiqueta: "Antes de empezar" }
  ],

  skills: [
    { id: "resumiendo-cambios", archivo: "skill-resumiendo-cambios.zip", drive: "", peso: "1 KB",
      grado: "Alta", ensena: "La estructura mínima y el contexto dinámico con !`comando`.",
      desc: "Resume los cambios sin commitear y señala lo riesgoso." },
    { id: "redactando-commits", archivo: "skill-redactando-commits.zip", drive: "", peso: "1 KB",
      grado: "Media", ensena: "Cómo se escribe una descripción que se dispara bien.",
      desc: "Redacta el mensaje de commit con commits convencionales." },
    { id: "revisando-readme", archivo: "skill-revisando-readme.zip", drive: "", peso: "2 KB",
      grado: "Media", ensena: "Revelación progresiva: reference.md y scripts/.",
      desc: "Revisa que un README tenga las secciones que el equipo exige." },
    { id: "migrando-datos", archivo: "skill-migrando-datos.zip", drive: "", peso: "2 KB",
      grado: "Baja", ensena: "Baja libertad y disable-model-invocation para acciones peligrosas.",
      desc: "Ejecuta la migración de base de datos en el orden exacto, con verificación previa." }
  ],

  plantillas: [
    { id: "01-minima", titulo: "Mínima", archivo: "plantilla-01-minima.zip", drive: "", peso: "1 KB",
      desc: "Un solo SKILL.md. Para procedimientos de libertad alta." },
    { id: "02-multiarchivo", titulo: "Multiarchivo", archivo: "plantilla-02-multiarchivo.zip", drive: "", peso: "1 KB",
      desc: "SKILL.md + reference.md + scripts/. Revelación progresiva a un nivel." },
    { id: "03-baja-libertad", titulo: "Baja libertad", archivo: "plantilla-03-baja-libertad.zip", drive: "", peso: "1 KB",
      desc: "Planificar, validar, ejecutar. Solo invocación manual." }
  ],

  paquetes: [
    { id: "laboratorios", titulo: "Los seis laboratorios", archivo: "laboratorios.zip", drive: "", peso: "7 KB",
      desc: "Las hojas del participante, una por bloque." },
    { id: "skills-todas", titulo: "Las cuatro skills de ejemplo", archivo: "skills-de-ejemplo.zip", drive: "", peso: "6 KB",
      desc: "Listas para copiar a ~/.claude/skills/." },
    { id: "plantillas-todas", titulo: "Las tres plantillas", archivo: "plantillas.zip", drive: "", peso: "3 KB",
      desc: "Puntos de partida para las tuyas." },
    { id: "repo", titulo: "Repositorio del taller", archivo: "repositorio-taller.zip", drive: "", peso: "34 KB",
      desc: "Laboratorios, skills, plantillas, sabotaje y guía de publicación." }
  ]
};
