# Cuadernillo de referencia
## Skills con Claude Code

> Esto es lo que consultas tres semanas después del taller, cuando ya se te olvidó la mitad. Está ordenado por lo que vas a necesitar, no por lo que se enseñó.

---

## 1. La estructura mínima

```
mi-skill/
└── SKILL.md
```

```markdown
---
name: resumiendo-cambios
description: Resume los cambios sin commitear y señala lo riesgoso.
  Úsala cuando el usuario pregunte qué cambió, pida un mensaje de
  commit o quiera revisar su diff.
---

## Cambios actuales
!`git diff HEAD`

## Instrucciones

Resume en dos o tres viñetas qué cambió.
Luego lista los riesgos: manejo de errores ausente, valores
hardcodeados, pruebas que quedaron desactualizadas.
```

**Dos partes.** Arriba, entre los tres guiones, los metadatos: **siempre** están en el contexto de Claude. Abajo, el cuerpo: **solo** entra cuando la skill se usa.

---

## 2. Dónde poner la skill

| Ubicación | Ruta | Alcance |
|---|---|---|
| Personal | `~/.claude/skills/<nombre>/SKILL.md` | Todos tus proyectos |
| Proyecto | `.claude/skills/<nombre>/SKILL.md` | Ese repo, viaja con git |
| Plugin | empaquetada | Espacio de nombres propio |
| Administrada | configuración de la organización | Toda la empresa |

Si dos skills tienen el mismo nombre, gana la de mayor precedencia: administrada sobre personal, personal sobre proyecto.

**La que usarás en equipo es la de proyecto.** Se versiona con el código y llega con el `git clone`.

---

## 3. El nombre

```
✅  resumiendo-cambios      revisando-prs       generando-migraciones
❌  helper                  utils               documentos          mi-skill
```

- Gerundio, describe la **actividad**
- Solo minúsculas, números y guiones
- Máximo 64 caracteres
- No puede contener `anthropic` ni `claude`
- **Es el nombre del directorio el que define el comando**, no el campo `name`

---

## 4. La descripción · el campo que decide todo

Es lo único que Claude ve para decidir si tu skill aplica. Si está mal, la skill no existe.

### La fórmula

```
[qué hace] + [cuándo usarla]
```

### Las cuatro reglas

**Tercera persona.** La descripción se inyecta en la indicación del sistema.

```
✅  Analiza documentos y aplica el formato del equipo.
❌  Te puedo ayudar con tus documentos.
```

**El caso principal al inicio.** Si se recorta, se recorta por el final.

**Las palabras que tú escribirías.** No las del manual.

```
✅  Úsala cuando el usuario mencione README, documentación o formato.
❌  Úsala para la gestión documental del repositorio.
```

**Tope de 1,536 caracteres**, combinado con `when_to_use`. Si se trunca, se trunca por el final.

### Ejemplos completos

```yaml
description: Revisa un pull request contra las convenciones del
  proyecto y señala lo que falta. Úsala cuando el usuario pida
  revisar un PR, un diff o pregunte si su cambio está listo.
```

```yaml
description: Genera el mensaje de commit con el formato del equipo
  a partir de los cambios preparados. Úsala cuando el usuario pida
  un commit, un mensaje de commit o pregunte cómo describir su cambio.
```

---

## 5. Campos del frontmatter

| Campo | Para qué | Cuándo lo usas |
|---|---|---|
| `name` | Etiqueta de listado. **El comando sale del nombre del directorio** | Opcional |
| `description` | Cuándo aplica | Siempre |
| `allowed-tools` | Preaprueba herramientas durante ese turno | Cuando la skill ejecuta scripts o comandos |
| `disable-model-invocation` | Solo se invoca manualmente | Acciones con efectos: desplegar, enviar, borrar |
| `user-invocable` | Si `false`, solo la usa el modelo | Conocimiento de fondo que nadie llama por nombre |
| `context: fork` | Corre como subagente aislado | La skill **hace** algo, no solo describe cómo |

> **Ojo con `allowed-tools`:** preaprueba, no restringe. Sirve para que no te salte la solicitud de permiso, no para limitar lo que la skill puede hacer. Para restringir van las reglas de permisos.

> **Ojo con `context: fork`:** una skill de solo lineamientos ejecutada como fork devuelve poco, porque el subagente recibe guías sin tarea.

---

## 6. Grados de libertad

La pregunta no es cuánto detalle poner. Es **qué tan frágil es la tarea**.

| Grado | Situación | Cómo se escribe | Ejemplo |
|---|---|---|---|
| **Alta** | Varios caminos sirven | Dirección general, en prosa | Revisión de código, análisis de estructura |
| **Media** | Hay un patrón preferido | Plantilla o script con parámetros | `generar_reporte(datos, formato="markdown")` |
| **Baja** | Operación frágil, la secuencia importa | Comando exacto, prohibido variarlo | Migraciones, despliegues |

Ejemplo de baja libertad, escrito correctamente:

```markdown
Ejecuta exactamente:

    python scripts/migrate.py --verify --backup

No modifiques el comando ni agregues banderas.
Si falla, detente y reporta el error. No intentes corregirlo.
```

---

## 7. Revelación progresiva

```
mi-skill/
├── SKILL.md          ← el procedimiento. Se carga al invocar.
├── reference.md      ← el detalle. Solo si hace falta.
└── scripts/
    └── revisar.sh    ← se EJECUTA. No se lee.
```

**Tres reglas:**

1. **Un solo nivel.** `SKILL.md` → `reference.md`. Nunca `reference.md` → `detalle.md`. Las cadenas funcionan a veces y fallan otras.
2. **Los scripts se ejecutan.** No le pidas a Claude que lea el script y lo interprete.
3. **Rutas con `${CLAUDE_SKILL_DIR}`.** Nunca absolutas, nunca con barra invertida.

```markdown
Para los casos especiales, consulta ${CLAUDE_SKILL_DIR}/reference.md

Para validar, ejecuta:

    bash ${CLAUDE_SKILL_DIR}/scripts/revisar.sh
```

**Límite:** `SKILL.md` por debajo de 500 líneas. Si se pasa, hay que partirla.

---

## 8. Contexto dinámico

```markdown
## Estado actual
!`git status --short`

## Cambios
!`git diff HEAD`
```

El comando se ejecuta **antes** de que Claude lea la instrucción. Le llega el resultado ya adentro.

> Si el comando falla, se aborta toda la invocación y Claude nunca ve el contenido. Usa comandos que no puedan fallar, o dales salida alternativa.

---

## 9. Qué capa usar

| Naturaleza del contenido | Capa |
|---|---|
| Hecho permanente del proyecto | `CLAUDE.md` |
| Procedimiento o material de referencia | **Skill** |
| Tarea con contexto aislado y rol propio | Subagente |
| Regla que debe cumplirse siempre | Hook |
| Acceso a sistema externo | Servidor MCP |

**Las dos preguntas que desempatan:**

- CLAUDE.md o skill → *¿hace falta en cada conversación, o solo en algunas?*
- Skill o hook → *¿confío en que el modelo decida aplicarlo?*

---

## 10. Compartir

```bash
# convertir tu skill personal en skill del proyecto
mkdir -p .claude/skills
cp -r ~/.claude/skills/mi-skill .claude/skills/
git add .claude/skills
git commit -m "add: skill mi-skill"
git push
```

Quien clone el repo la tiene. No hay instalación.

> **Antes de ejecutar una skill que no escribiste, lee su `allowed-tools`.** Una skill puede preaprobarse acceso amplio a herramientas.

---

## 11. Diagnóstico

| Comando | Para qué |
|---|---|
| `/skills` | Qué skills hay cargadas y de dónde vienen |
| `/doctor` | Revisa la instalación |
| `/context` | Qué está ocupando la ventana de contexto |
| `claude --debug` | Qué pasa por dentro al resolver una solicitud |

### Tabla de síntomas

| Síntoma | Causa más probable | Qué revisas |
|---|---|---|
| No se activa nunca | Descripción sin las palabras reales, o en 1ª/2ª persona | El campo `description` |
| Responde a `/nombre` pero nunca sola | Frontmatter mal formado, cargó sin metadatos | Los tres guiones, el nombre del campo |
| Se activa cuando no debe | Descripción demasiado amplia | Acota el "cuándo", o pon `disable-model-invocation` |
| No encuentra un archivo | Ruta absoluta o barra invertida | Cambia a `${CLAUDE_SKILL_DIR}` |
| Salta la solicitud de permiso | Falta declarar la herramienta | `allowed-tools` |
| Funciona a veces sí y a veces no | Cadena de referencias de dos niveles | Aplana a un solo nivel |
| La invocación se aborta sin explicación | Un comando `!` falló | Prueba el comando a mano |

---

## 12. Antipatrones

No dan error. Solo hacen que la skill funcione mal.

| Antipatrón | Por qué falla |
|---|---|
| Ofrecer cinco librerías alternativas | Claude elige mal. Da una, con salida de emergencia |
| Información con caducidad: *"la versión actual es 3.2"* | En seis meses tu skill miente |
| Cambiar de término a media skill: "documento" arriba, "archivo" abajo | Claude no sabe si son lo mismo |
| Explicar lo que Claude ya sabe | Gasta contexto que le hace falta al usuario |
| Rutas con barra invertida | No resuelven |
| Referencias encadenadas | Funcionan a veces. Peor que fallar siempre |

---

## 13. El ciclo de trabajo · Claude A y Claude B

Así se escribe una skill de verdad. Nadie escribe un `SKILL.md` bueno de memoria y a la primera.

```
CLAUDE A                          CLAUDE B
sesión donde resuelves            sesión nueva, limpia
la tarea a mano                   con la skill cargada
    │                                 │
    │ observas qué contexto           │ la pruebas en una
    │ tuviste que dar                 │ tarea parecida
    │                                 │
    ├─ "crea una skill que       ────▶│
    │   capture este patrón"          │
    │                                 │ observas dónde tropieza
    │◀────────────────────────────────┤
    │  "olvidó X, ¿la regla no        │
    │   está lo bastante visible?"    │
```

**Paso a paso:**

1. **En A:** resuelve la tarea con prompting normal. Fíjate en qué contexto tuviste que dar.
2. **En A:** `crea una skill que capture este patrón`
3. **En A:** recorta. `quita la explicación de X, eso ya lo sabes`
4. **En B:** sesión nueva. Pide la tarea en lenguaje natural, **sin** escribir `/`.
5. **Si no se disparó:** vuelve a A y corrige la descripción, no el cuerpo.
6. **Si se disparó pero hizo algo distinto:** vuelve a A y corrige el cuerpo.

---

## 14. Antes de dar una skill por terminada

- [ ] Descripción específica, en tercera persona, con qué hace y cuándo usarla
- [ ] Se dispara sola con una petición en lenguaje natural
- [ ] `SKILL.md` por debajo de 500 líneas
- [ ] El detalle está en archivos aparte, a un solo nivel
- [ ] Terminología consistente de principio a fin
- [ ] Sin información con fecha de caducidad
- [ ] Probada en una tarea distinta a la que la originó
- [ ] Versionada en el repositorio
- [ ] Otra persona la ejecutó sin explicación previa

---

## 15. Las siete frases del taller

1. La descripción está siempre en contexto. El cuerpo, no. Ese es todo el truco.
2. Si la skill no se dispara sola, el problema casi nunca está en el cuerpo. Está en la descripción.
3. La pregunta no es cuánto detalle poner. Es qué tan frágil es la tarea.
4. La pregunta no es qué herramienta usar. Es si esto hace falta siempre, a veces, o sin excepción.
5. Una skill que solo funciona en tu máquina es una nota personal. En el repo es infraestructura.
6. Las fallas de sintaxis las encuentra el validador. Las descripciones malas solo las encuentra el uso.
7. Solo agrega lo que Claude no sabe ya.
