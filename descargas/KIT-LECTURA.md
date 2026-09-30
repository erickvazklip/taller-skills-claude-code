# Kit de lectura posterior

Lo que no cabe en tres horas. No se eliminó: está aquí, y esa decisión es la misma revelación progresiva que enseña el módulo 3, aplicada al propio taller.

---

## 1 · Referencia completa del frontmatter

Todos los campos son opcionales. Solo `description` es recomendado. Claude Code lee el frontmatter **únicamente si el `---` de apertura es la primera línea**.

| Campo | Para qué |
|---|---|
| `description` | Qué hace y cuándo usarla |
| `when_to_use` | Contexto adicional de disparo. Se anexa a `description` |
| `name` | Etiqueta de listado. **No define el comando** en skills personales y de proyecto |
| `argument-hint` | Pista de autocompletado: `[issue-number]` |
| `arguments` | Nombres posicionales para sustitución `$nombre` |
| `allowed-tools` | Preaprueba herramientas durante el turno que invoca |
| `disallowed-tools` | Retira herramientas mientras la skill está activa |
| `disable-model-invocation` | Solo tú puedes invocarla |
| `user-invocable` | `false`: solo Claude puede invocarla |
| `model` | Modelo mientras la skill está activa, o `inherit` |
| `effort` | `low`, `medium`, `high`, `xhigh`, `max` |
| `context` | `fork` para correr en subagente aislado |
| `agent` | Tipo de subagente con `fork`: `Explore`, `Plan`, `general-purpose` |
| `background` | Con `fork`, `false` espera el resultado en el mismo turno |
| `hooks` | Hooks que se registran al invocar |
| `paths` | Globs que limitan la activación automática |
| `shell` | `bash` (por defecto) o `powershell` |
| `metadata` | Mapa libre para tus herramientas |
| `license`, `compatibility` | Del estándar Agent Skills |

Los booleanos aceptan `yes`, `no`, `on`, `off`, `1`, `0` además de `true` y `false`.

---

## 2 · Argumentos, en detalle

| Variable | Qué es |
|---|---|
| `$ARGUMENTS` | Todos los argumentos, tal como se escribieron |
| `$ARGUMENTS[N]` | Por índice de base 0 |
| `$N` | Abreviatura: `$0`, `$1` |
| `$nombre` | Declarado en el campo `arguments` |

Comportamientos que sorprenden:

- Si invocas con argumentos pero **ningún marcador los recibe**, Claude Code anexa `ARGUMENTS: <lo que escribiste>` al final del contenido.
- Los índices usan comillas estilo shell: `/mi-skill "hola mundo" segundo` hace `$0` = `hola mundo`.
- Un índice sin argumento (`$2` con un solo argumento) **queda como texto literal**.
- Un argumento con nombre sin valor **se expande a cadena vacía**.
- Si un valor contiene texto como `$1`, se inserta literal y no se expande.
- Para un `$` literal antes de un dígito, escápalo: `\$1.00`.

---

## 3 · Apilar skills

`/write-tests /fix-issue 123` carga ambas y pasa `123` como `$ARGUMENTS` a las dos. Claude Code expande la primera más hasta cinco apiladas.

La expansión se detiene en el primer elemento que no sea una skill invocable en línea. Una que corre como subagente bifurcado, como `/code-review`, termina la cadena ahí, y todo lo que sigue se vuelve texto de argumento.

---

## 4 · Skills empaquetadas

`/doctor`, `/code-review`, `/batch`, `/debug`, `/loop`, `/claude-api`.

Son basadas en prompt: le dan a Claude instrucciones detalladas y lo dejan orquestar. Algunas Claude las invoca sola; otras, como `/verify`, corren solo cuando tú las invocas.

**Correr y verificar tu app:**

| Skill | Para qué |
|---|---|
| `/run` | Lanza y maneja tu app para ver un cambio funcionando |
| `/verify` | Construye y corre tu app para confirmar que un cambio hace lo que debe |
| `/run-skill-generator` | Graba la receta de build y lanzamiento como skill del proyecto |

`/run` y `/verify` infieren el lanzamiento del tipo de proyecto y del README, `package.json` o `Makefile`. Esa inferencia falla en proyectos que necesitan base de datos, archivo de entorno o build de varios pasos: para esos, `/run-skill-generator` graba la receta en `.claude/skills/run-<nombre>/` y todos los agentes del repo la siguen.

Para apagarlas: `disableBundledSkills`, que desactiva todas excepto `/doctor`.

---

## 5 · Presupuesto del listado de skills

Claude Code carga un listado de nombres y descripciones. **Siempre trae todos los nombres**, pero si tienes muchas skills acorta descripciones para caber en un presupuesto.

- El presupuesto escala al **1% de la ventana de contexto del modelo**
- Cuando se desborda, **descarta descripciones empezando por las skills que menos invocas**
- El tope por entrada es de **1,536 caracteres** (`description` + `when_to_use`)

| Para | Usa |
|---|---|
| Subir el presupuesto | `skillListingBudgetFraction` (`0.02` = 2%) o `SLASH_COMMAND_TOOL_CHAR_BUDGET` |
| Cambiar el tope por entrada | `skillListingMaxDescChars` |
| Liberar espacio | `"name-only"` en `skillOverrides` |
| Sacar del listado | `disable-model-invocation: true` |

`/doctor` estima el costo del listado y sus mayores contribuyentes. La fila Skills de `/context` reporta el tamaño **después** del presupuesto.

---

## 6 · `skillOverrides`

Control de visibilidad desde la configuración, sin editar el `SKILL.md`. Útil para skills que vienen en un repositorio compartido.

| Valor | Listada a Claude | En el menú `/` |
|---|---|---|
| `"on"` | Nombre y descripción | Sí |
| `"name-only"` | Solo el nombre | Sí |
| `"user-invocable-only"` | Oculta | Sí |
| `"off"` | Oculta | Oculta |

El menú `/skills` lo escribe por ti: resalta una skill, `Space` cicla estados, `Esc` guarda en `.claude/settings.local.json`. Las skills de plugin no se ven afectadas.

---

## 7 · Distribución por plugin

Un plugin empaqueta skills junto con agentes, hooks y servidores MCP. Las skills de plugin usan espacio de nombres propio (`plugin:skill`), así que no chocan con los otros niveles.

En un plugin, el frontmatter `name` **sí** reemplaza el nombre del directorio en el último segmento del comando: `my-plugin/skills/review/SKILL.md` con `name: fancy` se vuelve `/my-plugin:fancy`.

Además, si agregas un `.claude-plugin/plugin.json` a una carpeta de skill, esa carpeta carga como plugin y puede traer agentes, hooks y servidores MCP.

---

## 8 · Configuración administrada

Despliegue a toda la organización con precedencia sobre personal y proyecto. Un administrador coloca las skills en `.claude/skills/` dentro del directorio de configuración administrada, por ejemplo `/etc/claude-code/.claude/skills/` en Linux.

Para las organizaciones que quieren restringir la personalización local existe la política `strictPluginOnlyCustomization`, que puede apagar las skills de `.claude/skills/` y `.claude/commands/`.

---

## 9 · Patrón planificar–validar–ejecutar

Para skills de baja libertad con efectos, la estructura que funciona:

1. **Planificar.** La skill describe qué se va a hacer y lo reporta al usuario antes de tocar nada.
2. **Validar.** Un script de verificación previa que sale con `ESTADO: LIMPIO` o enumera problemas. Si no está limpio, la skill se detiene.
3. **Ejecutar.** El comando exacto, con prohibición explícita de variarlo.

La clave está en el paso 2: el script decide, la skill obedece. No le pidas a Claude que evalúe si las condiciones son seguras.

---

## 10 · Scripts que resuelven, no delegan

Un script bundleado debe **hacer el trabajo**, no preparar datos para que Claude lo haga. Si tu script imprime "aquí están los archivos, ahora analízalos", moviste el problema en vez de resolverlo.

El buen script:
- Sale con 0 aunque encuentre problemas; quien decide qué hacer es Claude
- Imprime resultados legibles y estructurados, no volcados crudos
- No depende de rutas absolutas de tu máquina

Y recuerda el patrón que evita las solicitudes de permiso: usar `${CLAUDE_SKILL_DIR}` tanto en el cuerpo como en la regla de `allowed-tools`, para que coincidan exactamente.

---

## 11 · Nombres calificados de herramientas MCP

Cuando una skill necesita una herramienta de un servidor MCP, se nombra completa: `mcp__<servidor>__<herramienta>`. Un nombre corto no coincide y la preaprobación no aplica.

---

## 12 · Portabilidad al estándar Agent Skills

Las skills siguen el estándar abierto **Agent Skills**, que funciona en varias herramientas. Claude Code lo extiende con control de invocación, ejecución en subagente e inyección de contexto dinámico.

Fuera de Claude Code —claude.ai, la API de Skills, `package_skill.py`— solo se permiten seis campos:

`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`

Cualquier otro **falla con error duro**:

```
Unexpected key(s) in SKILL.md frontmatter: argument-hint.
Allowed properties are: allowed-tools, compatibility, description,
license, metadata, name
```

Si quieres que una skill sea portable desde el inicio, limítate a esos seis y evita las funciones del cuerpo específicas de Claude Code.

---

## Documentación oficial

- [Mejores prácticas para la creación de Skills](https://platform.claude.com/docs/es/agents-and-tools/agent-skills/best-practices)
- [Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [agentskills.io](https://agentskills.io)
