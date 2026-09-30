# Plan de adopción · Skills en tu empresa

Del taller a la operación en 30 días. Todo lo que aparece aquí sale de lo que se practicó en la sesión; esta hoja solo lo ordena para llevarlo a un equipo.

---

## Semana 0 · Elige los casos

Reúne al equipo 30 minutos y responde una sola pregunta:

> ¿Qué le pedimos a Claude cada semana, escribiendo más o menos lo mismo?

Anota cada respuesta y descarta lo que no pase este filtro:

| Pregunta | Si la respuesta es no |
|---|---|
| ¿Ya se hizo esta semana y se va a volver a hacer? | Es un caso inventado. Descártalo |
| ¿Hace falta solo en algunas conversaciones? | Si hace falta en todas, va a `CLAUDE.md` |
| ¿Confiamos en que el modelo decida aplicarlo? | Si debe cumplirse sin excepción, es un hook |
| ¿Toca un sistema externo? | Primero necesitas un servidor MCP |

Quédate con **tres casos**, no con veinte.

---

## Semana 1 · Construye con el ciclo Claude A / Claude B

Para cada caso:

1. **Escribe las tres evaluaciones antes que la skill** (plantilla en `RUBRICA.md`). La tercera, la que *no* debe dispararse, es la que más problemas evita.
2. **Claude A:** resuelve la tarea a mano y pide `crea una skill que capture este patrón`. Recorta.
3. **Claude B:** sesión nueva, pide la tarea sin escribir `/`.
4. Si no se dispara, corrige la **descripción**. Si se dispara y hace otra cosa, corrige el **cuerpo**.
5. Decide el grado de libertad por la fragilidad de la tarea: alta, media o baja. Lo que tenga efectos irreversibles lleva `disable-model-invocation: true`.

Parte de las plantillas `01-minima`, `02-multiarchivo` o `03-baja-libertad`.

---

## Semana 2 · Llévala al repositorio

Una skill en `~/.claude/skills/` es una nota personal. En `.claude/skills/` del proyecto es infraestructura del equipo.

```bash
mkdir -p .claude/skills
cp -r ~/.claude/skills/mi-skill .claude/skills/
git add .claude/skills
git commit -m "add: skill mi-skill"
```

**Revisión antes del merge** (trátala como código):

- [ ] Sin rutas absolutas de una máquina; todo con `${CLAUDE_SKILL_DIR}`
- [ ] Sin credenciales, tokens ni datos internos
- [ ] `allowed-tools` pide solo lo necesario. Recuerda: preaprueba, no restringe
- [ ] `SKILL.md` por debajo de 500 líneas, detalle a un solo nivel
- [ ] Sin información con fecha de caducidad
- [ ] Alguien que no la escribió la ejecutó sin explicación previa

---

## Semana 3 · Úsala y anota dónde tropieza

- Cada persona la usa **al menos tres veces**.
- Una línea por tropiezo. No hace falta más.
- Corrige **una** cosa con el ciclo A/B.
- Corre las tres evaluaciones con Haiku, Sonnet y Opus. Si falla en el modelo chico, las instrucciones asumen inferencias en lugar de enunciarlas.

---

## Día 30 · Check-in

Tres preguntas, una línea cada una:

1. ¿Sigue en uso? (sí / no / la cambiamos por otra)
2. ¿Se iteró al menos una vez?
3. ¿Alguien más del equipo la usa?

Mide cada skill contra los niveles de la rúbrica: **Carga → Funciona → Compartible → Madura**. La meta a 30 días es *Madura*: seis criterios cumplidos y una iteración documentada.

---

## Gobierno mínimo para equipos grandes

| Necesidad | Mecanismo |
|---|---|
| Skills para toda la organización | Configuración administrada: tiene precedencia sobre personal y proyecto |
| Distribuir skills con agentes, hooks y MCP juntos | Plugin, con espacio de nombres propio |
| Ocultar o silenciar skills de un repo compartido | `skillOverrides` en la configuración |
| Restringir personalización local | Política `strictPluginOnlyCustomization` |
| Portabilidad fuera de Claude Code | Limítate a los seis campos del estándar Agent Skills |

El detalle de cada uno está en `KIT-LECTURA.md`.
