# Paquete del instructor

Webinar **Skills con Claude Code** · 30 de septiembre de 2026, 9:00 · 90 min

Este paquete cubre las dos partes del webinar. Está repartido entre dos
personas.

| Rol | Quién | Minutos |
|---|---|---|
| **Expositor** | Erick Vázquez | 38 |
| **Demostrador** | Quien lleva la parte práctica | 52 |

---

## Si eres el demostrador, lee en este orden

1. **`PDF/01-Carpeta-de-traspaso.pdf`** — qué se te pide, qué recibes, el
   calendario y el criterio con el que se acepta el ensayo. Empieza aquí.
2. **`PDF/02-Guia-del-demostrador.pdf`** — los conceptos que necesitas para
   narrar y para que no te agarren en curva. Completa, antes del ensayo.
3. **`PDF/03-Guion-de-demostraciones.pdf`** — las seis demos paso a paso.
   Lo tienes abierto durante la transmisión.
4. **`PDF/05-Tarjeta-de-cabina.pdf`** — una página. **Imprímela.**
5. **`PDF/06-Banco-de-preguntas.pdf`** — abierto durante la transmisión.

Y lo primero que haces con la computadora:

```
bash ambiente-demo/preparar.sh
bash ambiente-demo/verificar.sh
```

`verificar.sh` te dice exactamente qué falta. **Si algo falla, avísalo el
mismo día, no la víspera.**

## Si eres el expositor

1. **`PDF/04-Playbook-del-webinar.pdf`** — tu minuto a minuto, con las
   señales de entrega y el reparto de los tres (contando al moderador).
2. **`PDF/01-Carpeta-de-traspaso.pdf`** — lo que le entregas al demostrador.
   Léelo antes de mandárselo.
3. **`PDF/06-Banco-de-preguntas.pdf`** — con el reparto de quién contesta
   cada tipo de pregunta.

---

## Qué hay en cada carpeta

| Carpeta | Qué contiene |
|---|---|
| `PDF/` | Los seis documentos, listos para imprimir o leer en pantalla |
| `ambiente-demo/` | Tres scripts y el repositorio de demostración |
| `respaldos/` | Seis corridas ya capturadas, por si algo falla en vivo |
| `fuente-editable/` | Los mismos documentos en markdown, por si hay que ajustarlos |

### `ambiente-demo/`

| Script | Qué hace | Cuándo |
|---|---|---|
| `preparar.sh` | Crea `~/demo-webinar`, lo inicializa en git e instala las dos skills permanentes | Una vez, al empezar |
| `verificar.sh` | Revisa versión, sesión, skills, diff y permisos. Lista de comprobación automática | T-1 día y T-1 hora |
| `resetear.sh` | Devuelve todo al estado de arranque y borra las skills creadas en vivo | Entre ensayos y entre demos |

`NOTAS-DEL-ESTADO.md` documenta los cuatro problemas sembrados en el código
de demostración y por qué está cada uno.

### `respaldos/`

Corridas reales ya capturadas. **Se abren en pestañas del navegador antes de
transmitir**, no en el explorador de archivos.

| Archivo | Sustituye a |
|---|---|
| `R0-sin-ambiente.md` | Todo. Es el de último recurso, con estructura completa de 90 min |
| `R1-apertura.md` | Demo 1 |
| `R3-descripcion.md` | Demo 3 · trae además la **variante narrada**, que es una decisión de diseño, no un plan B |
| `R4-destilador.md` | Demo 4 |
| `R5-multiarchivo.md` | Demo 5 |
| `R6-diagnostico.md` | Demo 6 |

La demo 2 no necesita respaldo: es lectura de un archivo.

---

## Lo que decide el webinar

**El punto de control único.** Si a las 0:47 no ha empezado la demo 4, van
retrasados. Es el único reloj que importa, y todo ajuste se hace recortando
las demos 5 y 6.

**La ruta crítica.** 52 de los 90 minutos dependen del demostrador. El riesgo
número uno no es que una demo falle —para eso están los respaldos— sino que
llegue al ensayo sin haber corrido nada.

**El criterio de aceptación del ensayo.** Pasa si se cumplen las cuatro:
la demo 4 arranca antes del minuto 50; las seis frases de cierre se dijeron
completas; pasó a un respaldo en menos de 30 segundos cuando se le pidió; y
nadie agradeció un cambio de turno.

---

## El kit del asistente va aparte

Lo que se les entrega a los participantes está en la carpeta `kit/`: manual,
tarjeta de referencia, trece skills listas para copiar, el prompt destilador
y la guía de primeros 30 días. El cierre del webinar lo comparte.
