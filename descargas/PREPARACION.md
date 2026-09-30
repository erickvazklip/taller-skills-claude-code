# Guía de preparación
## Antes del taller · te toma 15 minutos

> Hazlo **hoy**, no la mañana del taller. Si algo falla, hay una ventana de soporte en vivo la víspera y no vas a querer descubrir el problema a las 8:55.

---

## Lo que necesitas

1. **Claude Code instalado y con sesión iniciada**
2. **Un repositorio propio** donde puedas escribir (hay alternativa si no puedes usar código de tu trabajo)
3. **Terminal y Git** de uso diario
4. **Una idea**: algo que le pidas a Claude cada semana

---

## Paso 1 · Verifica Claude Code

Abre tu terminal y corre:

```bash
claude --version
```

**Si responde con un número de versión:** listo, pasa al paso 2.

**Si dice "command not found":** instálalo siguiendo la documentación oficial de Claude Code para tu sistema operativo, y vuelve a correr el comando.

### Notas por sistema operativo

**macOS** — Si instalaste con Homebrew y el comando no aparece, revisa que el directorio de binarios esté en tu `PATH`:
```bash
echo $PATH
```

**Linux** — Igual que macOS. Si instalaste con npm global y no aparece, revisa dónde quedó:
```bash
npm root -g
```

**Windows** — Se recomienda trabajar dentro de **WSL**. Muchos ejemplos del taller usan rutas y comandos de shell tipo Unix. Si trabajas en PowerShell nativo, algunas rutas del taller no van a funcionar igual y vas a perder tiempo traduciendo.

---

## Paso 2 · Verifica que puedes iniciar sesión

```bash
claude
```

Debe abrirse la sesión interactiva. Escribe cualquier cosa y comprueba que responde:

```
hola, ¿me escuchas?
```

Sal con `/exit`.

**Si no logra autenticarse:** ese es el problema más común. Resuélvelo antes del taller.

---

## Paso 3 · Comprueba que las skills funcionan

Dentro de una sesión de Claude Code:

```
/skills
```

Debe mostrarte una lista. Puede estar casi vacía: es normal si nunca has instalado skills.

**Si el comando no existe:** tu versión es antigua. Actualiza.

---

## Paso 4 · Prepara tu repositorio

Vas a construir una skill sobre un repositorio real.

**Opción A — tu propio repo.** El ideal. Elige uno donde puedas escribir sin pedir permiso.

**Opción B — el sandbox del taller.** Si no puedes usar código de tu trabajo:

```bash
git clone [ENLACE-DEL-REPOSITORIO-DEL-TALLER]
cd taller-skills-claude-code/sandbox
```

Trae un proyecto pequeño con historial de git, para que los ejemplos de `git diff` tengan qué mostrar.

---

## Paso 5 · Clona el repositorio del taller

```bash
git clone [ENLACE-DEL-REPOSITORIO-DEL-TALLER]
```

Confirma que puedes hacer push, porque en el laboratorio 5 vas a publicar ahí:

```bash
cd taller-skills-claude-code
git commit --allow-empty -m "test: verifico acceso"
git push
```

**Si el push falla:** avísanos antes del taller. Es un problema de permisos y se resuelve en dos minutos, pero no durante la sesión.

---

## Paso 6 · Piensa tu caso

Esto es lo único que no es técnico, y es lo que más va a decidir si aprovechas el taller.

**Necesitas llegar con una respuesta a esta pregunta:**

> ¿Qué le pido a Claude cada semana, escribiendo más o menos lo mismo?

No inventes un caso bonito. Piensa en algo que **ya hiciste esta semana** y vas a volver a hacer.

Si no se te ocurre nada, revisa:
- Tu historial de sesiones de Claude Code
- Los últimos PR que revisaste
- Lo último que le explicaste a alguien de tu equipo

**Ejemplos que funcionan bien:**
- Resumir los cambios sin commitear y señalar lo riesgoso
- Redactar el mensaje de commit con el formato de tu equipo
- Actualizar el CHANGELOG a partir de los commits recientes
- Revisar que un README tenga las secciones que tu equipo exige
- Explicar un módulo legado que nadie quiere volver a explicar

Anótalo. Vas a necesitarlo a los 34 minutos de empezar.

---

## Paso 7 · Prepara tu entorno de trabajo remoto

El taller es 92 minutos de teclado. Vas a estar cambiando entre la videollamada y tu terminal constantemente.

- **Dos ventanas visibles a la vez**, o dos monitores. Si tienes que hacer *alt-tab* cada vez, vas a perder el hilo.
- **Terminal a buen tamaño.** Vas a leer tu código y el compartido.
- **Audífonos.** Hay trabajo en parejas en salas.
- **Cierra notificaciones.** Vas a compartir pantalla con tu pareja de trabajo.

---

## Lista final

- [ ] `claude --version` responde
- [ ] `claude` abre sesión y responde
- [ ] `/skills` funciona
- [ ] Tengo un repositorio donde puedo escribir
- [ ] Puedo hacer push al repositorio del taller
- [ ] Tengo anotado mi caso: algo que repito cada semana
- [ ] Tengo dos ventanas visibles a la vez

---

## Si algo no funciona

**Ventana de soporte:** la víspera del taller, en vivo. [HORARIO Y ENLACE]

**Durante el taller:** hay una sala de soporte abierta todo el tiempo. Entra sin pedir permiso, no te quedes atorado en silencio.

**No llegues sin ambiente listo asumiendo que se resuelve sobre la marcha.** Vas a trabajar en pareja y vas a ver a alguien más construir su skill en vez de construir la tuya.
