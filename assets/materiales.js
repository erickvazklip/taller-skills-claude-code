/*
  Catálogo de descargas.

  Cada archivo existe en /descargas del sitio (respaldo) y, cuando pegas su
  ID de Google Drive en `drive`, el botón descarga desde Drive sin salir de
  la página. El ID es la parte entre /d/ y /view del enlace para compartir:
    https://drive.google.com/file/d/ESTE_ES_EL_ID/view?usp=sharing
  El archivo en Drive debe estar compartido como "Cualquier persona con el enlace".

  `fuente` decide de dónde descarga el sitio:
    "sitio" → copias en /descargas (funciona siempre)
    "drive" → Google Drive; cámbialo solo cuando la carpeta sea pública
*/
window.MATERIALES = {
  fuente: "sitio",

  kit: { archivo: "kit-completo.zip", drive: "1tkP0_pSXV30AXvvFO_OFhkcdIEjWbYOX", peso: "34 KB" },

  guias: [
    { id: "cuadernillo", titulo: "Cuadernillo de referencia", archivo: "CUADERNILLO.md", drive: "1sXkN6zifL8O6ztm1SvEGrpb7wn8ZURFV", peso: "11 KB",
      desc: "Lo que consultas tres semanas después: estructura, descripción, frontmatter, grados de libertad, diagnóstico y antipatrones.",
      etiqueta: "Referencia" },
    { id: "plan", titulo: "Plan de adopción en 30 días", archivo: "PLAN-DE-ADOPCION.md", drive: "1js_6r1hdH-fvFgqu7yRc7ebKraWPbj8U", peso: "4 KB",
      desc: "Cómo llevar skills a un equipo: elegir casos, construir, versionar, revisar y medir a los 30 días.",
      etiqueta: "Para tu empresa" },
    { id: "rubrica", titulo: "Rúbrica y evaluaciones", archivo: "RUBRICA.md", drive: "1Si2bw72i2b6HjMESGE8My-bKZ2ftZR_K", peso: "5 KB",
      desc: "Los seis criterios, los niveles de madurez y la plantilla de las tres evaluaciones con línea base.",
      etiqueta: "Calidad" },
    { id: "kit-lectura", titulo: "Kit de lectura posterior", archivo: "KIT-LECTURA.md", drive: "1lOZBLtBQ9Dp6STJoF5jUu0r8gyo6sk1z", peso: "9 KB",
      desc: "Los 12 temas que no caben en tres horas: argumentos, presupuesto del listado, plugins, configuración administrada.",
      etiqueta: "Profundizar" },
    { id: "preparacion", titulo: "Guía de preparación", archivo: "PREPARACION.md", drive: "1leLIMZN4LnqVxUi7sTddcqsIW0mat6Ha", peso: "5 KB",
      desc: "Siete pasos, 15 minutos, para dejar listo el ambiente. Útil para replicar el taller con tu equipo.",
      etiqueta: "Antes de empezar" }
  ],

  skills: [
    { id: "resumiendo-cambios", archivo: "skill-resumiendo-cambios.zip", drive: "18bVk2hOl5mXv8-GtnaoRRhK6wQvHkfQD", peso: "1 KB",
      grado: "Alta", ensena: "La estructura mínima y el contexto dinámico con !`comando`.",
      desc: "Resume los cambios sin commitear y señala lo riesgoso." },
    { id: "redactando-commits", archivo: "skill-redactando-commits.zip", drive: "1BCvgTTBOafexplD8kNz5dA9Ou_7XNswe", peso: "1 KB",
      grado: "Media", ensena: "Cómo se escribe una descripción que se dispara bien.",
      desc: "Redacta el mensaje de commit con commits convencionales." },
    { id: "revisando-readme", archivo: "skill-revisando-readme.zip", drive: "1nvsFICfMYdOVc0L6qIi1V9LTPeiMA1f3", peso: "2 KB",
      grado: "Media", ensena: "Revelación progresiva: reference.md y scripts/.",
      desc: "Revisa que un README tenga las secciones que el equipo exige." },
    { id: "migrando-datos", archivo: "skill-migrando-datos.zip", drive: "1KYJmgEowtmGJZtOKlcWP67WVUsqs2iGS", peso: "2 KB",
      grado: "Baja", ensena: "Baja libertad y disable-model-invocation para acciones peligrosas.",
      desc: "Ejecuta la migración de base de datos en el orden exacto, con verificación previa." }
  ],

  plantillas: [
    { id: "01-minima", titulo: "Mínima", archivo: "plantilla-01-minima.zip", drive: "1UG7W9ECmdFjBLdoGqv-eI1-28NAeqxsa", peso: "1 KB",
      desc: "Un solo SKILL.md. Para procedimientos de libertad alta." },
    { id: "02-multiarchivo", titulo: "Multiarchivo", archivo: "plantilla-02-multiarchivo.zip", drive: "1xwkgB5_n8isZGrBe14N2P9qN8utNL7x0", peso: "1 KB",
      desc: "SKILL.md + reference.md + scripts/. Revelación progresiva a un nivel." },
    { id: "03-baja-libertad", titulo: "Baja libertad", archivo: "plantilla-03-baja-libertad.zip", drive: "1gxpJkWf5Q-tXAv__mtRYyKYCAIyDorXZ", peso: "1 KB",
      desc: "Planificar, validar, ejecutar. Solo invocación manual." }
  ],

  paquetes: [
    { id: "laboratorios", titulo: "Los seis laboratorios", archivo: "laboratorios.zip", drive: "1Wg5LXGk47z-eEZX6992jZkKkPe0dzXLX", peso: "7 KB",
      desc: "Las hojas del participante, una por bloque." },
    { id: "skills-todas", titulo: "Las cuatro skills de ejemplo", archivo: "skills-de-ejemplo.zip", drive: "1msV2VnpxyMpNRSh2FCNEaCy70DAINo-N", peso: "6 KB",
      desc: "Listas para copiar a ~/.claude/skills/." },
    { id: "plantillas-todas", titulo: "Las tres plantillas", archivo: "plantillas.zip", drive: "14Fioa3JrnBCYo0QlWXytRXhlBMXsjkxr", peso: "3 KB",
      desc: "Puntos de partida para las tuyas." },
    { id: "repo", titulo: "Repositorio del taller", archivo: "repositorio-taller.zip", drive: "112wsLGPh3FYrVk4hMMFxsfRBc2xtOYBJ", peso: "34 KB",
      desc: "Laboratorios, skills, plantillas, sabotaje y guía de publicación." }
  ]
};
