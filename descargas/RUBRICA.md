# Rúbrica del reto y evaluaciones

Para el instructor y para el participante. Los seis criterios salen de la lista de verificación oficial de Anthropic.

---

## Los seis criterios

| # | Criterio | Cómo se verifica | Peso |
|---|---|---|---|
| 1 | Descripción específica, en tercera persona, con **qué hace** y **cuándo usarla** | Se lee el campo `description` | Bloqueante |
| 2 | Se dispara sola con una petición en lenguaje natural | Sesión nueva, sin escribir `/` | Bloqueante |
| 3 | `SKILL.md` por debajo de 500 líneas, con el detalle en archivos aparte a un nivel | `wc -l` y revisión de referencias | Alto |
| 4 | Terminología consistente, sin información con fecha de caducidad | Lectura | Alto |
| 5 | Tres evaluaciones escritas y corridas contra la línea base | Existe el archivo y hay resultados | Medio |
| 6 | Versionada y ejecutada por otra persona sin explicación previa | Está en el repo y alguien la corrió | Alto |

**Bloqueante** significa que sin eso la skill no cuenta como terminada, aunque cumpla lo demás. Los criterios 1 y 2 son la misma cosa vista desde dos ángulos: si el 1 está bien, el 2 pasa solo.

---

## Niveles de logro

| Nivel | Qué significa | Criterios cumplidos |
|---|---|---|
| **No entregado** | No hay skill, o no carga | — |
| **Carga** | Existe y responde a `/nombre`, pero no se dispara sola | 3, 4 parciales |
| **Funciona** | Se dispara sola con lenguaje natural | 1, 2 y al menos dos más |
| **Compartible** | Otra persona la corrió sin explicación | 1, 2, 3, 4, 6 |
| **Madura** | Tiene evaluaciones y una iteración documentada | Los seis |

**Al cierre del taller, la meta es "Funciona".** "Compartible" se alcanza en el laboratorio 5 si todo sale bien. "Madura" es la meta de los 30 días, no del día del taller.

---

## Las tres evaluaciones · plantilla

Para cada skill, escribe tres escenarios **antes** de escribir el contenido. Este es el orden que propone la guía oficial y es el que evita skills que resuelven problemas imaginarios.

```
EVALUACIÓN 1 · el caso principal
Prompt:            [lo que escribirías al pedirlo, con tus palabras]
¿Debe dispararse?  Sí
Salida esperada:   [qué debe producir, en una línea]
Sin skill hace:    [lo que Claude hace hoy, sin tu skill]

EVALUACIÓN 2 · una variante del mismo caso
Prompt:            [otra forma de pedir lo mismo]
¿Debe dispararse?  Sí
Salida esperada:   [lo mismo, o con la variación esperada]
Sin skill hace:    [línea base]

EVALUACIÓN 3 · el caso que NO debe disparar
Prompt:            [algo cercano pero fuera de alcance]
¿Debe dispararse?  No
Por qué no:        [dónde está la frontera]
```

La tercera es la que más gente omite y la que más problemas evita. Una skill que se dispara de más estorba tanto como una que no se dispara.

---

## Ejemplo resuelto · `resumiendo-cambios`

```
EVALUACIÓN 1 · el caso principal
Prompt:            ¿qué cambié hoy?
¿Debe dispararse?  Sí
Salida esperada:   Resumen en 2-3 viñetas por intención, más lista de riesgos
Sin skill hace:    Corre git diff y describe cambios línea por línea,
                   sin señalar riesgos

EVALUACIÓN 2 · variante
Prompt:            dame un mensaje de commit para esto
¿Debe dispararse?  Sí
Salida esperada:   El mismo resumen; el usuario lo usa como base del commit
Sin skill hace:    Genera un mensaje sin revisar riesgos

EVALUACIÓN 3 · el que NO debe disparar
Prompt:            ¿qué cambió en la versión 2.0 de esta librería?
¿Debe dispararse?  No
Por qué no:        Habla de cambios de una dependencia, no del árbol de
                   trabajo. Si se dispara, la descripción es demasiado amplia
                   en la palabra "cambios"
```

Fíjate en la tercera: revela un riesgo real de la descripción. La palabra "cambios" es ambigua, y por eso la descripción dice "cambios **sin commitear**" y menciona "diff".

---

## Protocolo de la comparación con línea base

1. **Sesión nueva.** No la sesión donde escribiste la skill. El contexto que quedó ahí enmascara los huecos de las instrucciones.
2. Corre las tres evaluaciones **con** la skill disponible.
3. Desactiva la skill (`skillOverrides: {"tu-skill": "off"}`) y corre las mismas tres.
4. Compara. Anota en una línea qué mejoró y qué no.

Lo que buscas no es "quedó bonito", sino **una diferencia observable** entre las dos corridas. Si no la hay, tu skill no está aportando nada y hay que revisar el contenido, no la descripción.

---

## Prueba multimodelo

Corre las mismas tres evaluaciones con Haiku, Sonnet y Opus.

**Lo que basta para Opus puede quedarse corto para Haiku.** Una skill que depende de que el modelo "entienda la intención" se rompe en el modelo más chico; una bien escrita funciona en los tres.

Es la prueba de robustez más barata que existe. Anota el resultado:

| Modelo | Se dispara | Salida correcta |
|---|---|---|
| Haiku | | |
| Sonnet | | |
| Opus | | |

Si falla en Haiku, el problema casi siempre es que las instrucciones asumen inferencias en vez de enunciarlas.

---

## Formato del check-in a 30 días

Tres preguntas, una línea cada una:

1. ¿Sigues usando la skill? (sí / no / la cambié por otra)
2. ¿La iteraste al menos una vez?
3. ¿Alguien más de tu equipo la está usando?

Un "no" en la primera es información valiosa para el instructor: dice qué falló en el diseño del taller, no en el participante.
