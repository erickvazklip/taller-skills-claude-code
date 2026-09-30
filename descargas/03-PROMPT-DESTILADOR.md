# El prompt destilador
### Convierte una conversación en una skill reutilizable

Este es el componente que más vas a usar. Cada vez que resuelvas algo con
Claude y pienses "esto lo voy a volver a necesitar", pega este prompt en
esa misma conversación.

Funciona porque la conversación **ya contiene** todo lo que la skill necesita:
el contexto que tuviste que dar, las correcciones que hiciste, y el resultado
que aceptaste. Lo único que falta es destilarlo.

---

## Cuándo usarlo

- Terminaste una tarea y el resultado te sirvió
- Tuviste que corregir a Claude dos o tres veces hasta que entendió
- Diste contexto que vas a tener que volver a dar

**No lo uses** si la tarea fue trivial, si el resultado no te sirvió, o si
es algo que harás una sola vez en la vida.

---

## El prompt

Cópialo completo y pégalo al final de la conversación:

```
Vamos a destilar esta conversación en una skill de Claude Code reutilizable.

Antes de escribir nada, analiza lo que pasó aquí y respóndeme estas seis
preguntas en forma de lista corta:

1. ¿Cuál fue la tarea real que resolvimos? Enúnciala como una actividad,
   en gerundio.
2. ¿Qué contexto tuve que darte yo que tú no sabías de entrada? Sepáralo en
   (a) convenciones o criterios míos, y (b) hechos del proyecto.
3. ¿En qué momentos te corregí, y qué revela cada corrección sobre lo que
   faltaba en la instrucción inicial?
4. ¿Qué parte de lo que te expliqué era realmente innecesaria porque ya lo
   sabías?
5. ¿Qué tan frágil es esta tarea? ¿Varios caminos llegan a un buen resultado
   (alta libertad), hay un patrón preferido (media), o un paso en falso
   rompe algo (baja)?
6. ¿Con qué frases exactas pediría yo esta tarea la próxima vez? Dame tres
   variantes, en mis palabras, no en lenguaje de manual.

Cuando termines ese análisis, construye el SKILL.md siguiendo estas reglas:

NOMBRE
- Gerundio que describe la actividad, en minúsculas con guiones
- Máximo 64 caracteres, sin las palabras "anthropic" ni "claude"
- Nunca genérico: nada de helper, utils, tools

DESCRIPCIÓN
- Fórmula obligatoria: [qué hace] + "Úsala cuando..." [cuándo usarla]
- Tercera persona: "Analiza...", jamás "Te puedo ayudar..."
- El caso principal al inicio, porque si se trunca se trunca por el final
- Los disparadores salen de las tres frases de la pregunta 6, no de
  lenguaje formal
- Tope de 1536 caracteres

CUERPO
- Solo lo de la pregunta 2. Nada de lo de la pregunta 4
- Instrucciones permanentes, no pasos de un solo uso: el contenido se queda
  en contexto turno tras turno
- Enuncia qué hacer, no narres por qué
- Si la pregunta 5 dio "baja", incluye el comando exacto y una prohibición
  explícita de variarlo
- Por debajo de 100 líneas. Si necesitas más, dime qué movería yo a un
  reference.md

FRONTMATTER
- allowed-tools solo si la skill ejecuta comandos, y con el patrón más
  acotado posible
- disable-model-invocation: true si la tarea tiene efectos irreversibles
  (desplegar, commitear, enviar, borrar)
- Cierra el cuerpo con: <!-- Grado de libertad: ALTA/MEDIA/BAJA -->

ENTRÉGAME
1. El análisis de las seis preguntas
2. El SKILL.md completo en un bloque de código
3. El comando mkdir para crear la carpeta
4. Tres evaluaciones para probarla: dos que DEBEN disparar la skill y una
   que NO debe dispararla, con el resultado esperado de cada una

No me des alternativas ni variantes. Dame una versión y dime qué decisión
tomaste en los puntos donde había más de un camino.
```

---

## Cómo se usa el resultado

1. **Lee el análisis antes que el SKILL.md.** Si el punto 2 trae cosas que
   no son tuyas, o el punto 4 está vacío, el destilado va a salir inflado.

2. **Crea la carpeta y pega el archivo.**

3. **Abre una sesión nueva** y corre las tres evaluaciones que te dio.
   La tercera —la que no debe disparar— es la que detecta descripciones
   demasiado amplias.

4. **Si no se disparó**, vuelve a la conversación original y pide:

   ```
   No se disparó. Escribí exactamente esto: "<lo que escribiste>".
   Reescribe solo la descripción para que esa frase la active.
   ```

5. **Si se disparó pero hizo algo distinto**, el problema está en el cuerpo:

   ```
   Se disparó pero <lo que hizo mal>. Corrige el cuerpo, no la descripción.
   ```

---

## Variante corta

Para cuando la conversación fue simple y no necesitas el análisis:

```
Destila esta conversación en un SKILL.md de Claude Code.

Nombre en gerundio. Descripción en tercera persona con la fórmula
[qué hace] + "Úsala cuando..." usando las palabras que yo usé de verdad
en esta conversación, no lenguaje de manual. En el cuerpo pon solo el
contexto que tuve que darte y que no sabías; quita todo lo que ya sabías.
Menos de 60 líneas. Termina con un comentario del grado de libertad.

Dame el archivo y el mkdir. Nada más.
```

---

## Variante para equipo

Cuando la skill va a `.claude/skills/` de un proyecto compartido:

```
Destila esta conversación en un SKILL.md para el repositorio del equipo.

Aplica las mismas reglas de nombre, descripción y cuerpo que ya conoces,
y además:

- Quita cualquier cosa específica de mi máquina: rutas absolutas, nombres
  de mis carpetas, mi configuración personal
- Quita credenciales, tokens, nombres de cliente y datos reales; reemplaza
  por marcadores evidentes
- Las rutas a archivos de la skill usan ${CLAUDE_SKILL_DIR}
- Si asume algo del proyecto que no es obvio para alguien nuevo, decláralo
  explícito en el cuerpo
- Redacta la descripción con las palabras que usaría CUALQUIERA del equipo,
  no solo yo

Al final, dame el checklist de revisión que debería pasar antes de
mezclarse, con los puntos que esta skill específicamente podría fallar.
```

---

## Por qué funciona

Las seis preguntas no son decorativas. Cada una ataca un modo de falla
conocido:

| Pregunta | Qué falla previene |
|---|---|
| 1 · La tarea en gerundio | Nombres genéricos tipo `helper` |
| 2 · Qué contexto diste | Skills vacías que no aportan nada |
| 3 · Dónde corregiste | Instrucciones que omiten lo que importaba |
| 4 · Qué era innecesario | Cuerpos inflados con costo recurrente |
| 5 · Qué tan frágil | Nivel de detalle mal calibrado |
| 6 · Con qué frases lo pedirías | **Descripciones que nunca se activan** |

La sexta es la más importante. Es la única forma confiable de sacar las
palabras reales en vez de las del manual, y las descripciones son la causa
número uno de skills que no funcionan.
