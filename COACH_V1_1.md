# MiraFut Coach V1.1 — Roadmap de mejoras

## La vision

MiraFut Coach
Knows your game.
Knows your goals.
Remembers your progress.
Builds your next step.

No "ChatGPT que sabe de futbol."
Un sistema de desarrollo continuo.

## Las 5 prioridades para el programador

1. Respuestas mas breves + una pregunta de seguimiento
2. Weekly Goal
3. Training/Post-Match Check-In
4. Memoria estructurada de desarrollo
5. Drill Cards reutilizando los diagramas existentes

Con estas 5: parar de desarrollar y poner delante de 10 jugadores.

## 1. De pregunta-respuesta a ciclo completo

ACTUAL: Jugador pregunta → Coach responde
OBJETIVO: Jugador → Coach → Accion → Resultado → Seguimiento → Adaptacion

Ejemplo:
Gonzalo: Quiero mejorar mis reflejos.
Coach: Perfecto. Vas a entrenar solo o con alguien?
Gonzalo: Con mi hermano.
Coach genera sesion de 18 min con boton [Termine]
Despues: Que ejercicio te costo mas?
Gonzalo: La pelota de tenis.
Semana siguiente: "La semana pasada las reacciones con pelota de tenis
fueron lo mas dificil. Quieres repetirlas y subir un nivel?"

## 2. Los 5 modos automaticos (workflows)

VENGO DE ENTRENAR:
Como estuvo? → Muy bien / Normal / Dificil → Que trabajaron?
→ genera Training Check-In

VENGO DE JUGAR (agregar):
Como termino el partido? → Fuiste titular? → Minutos jugados?
→ Como evaluarias tu partido? → Que fue lo mejor? → Que quieres mejorar?
→ genera Post-Match Review (construye historial deportivo)

ESTOY NERVIOSO:
Partido / Entrenamiento / Trial / Otra cosa?
→ rutina deportiva: respiracion + foco + objetivo controlable

NECESITO CONSEJO:
Tecnica / Tactica / Rendimiento / Habitos / Motivacion
→ reduce prompts vagos

QUIERO MEJORAR:
Que quieres mejorar? → construye microobjetivo semanal

## 3. Weekly Goal

Cada jugador tiene:
MI OBJETIVO ESTA SEMANA
Gonzalo — Portero
Objetivo: Salidas aereas
Sesiones: 3 / Duracion: 20 min
Progreso: ○ ○ ○ → ✓ ○ ○ → ✓ ✓ ○ → ✓ ✓ ✓

Razon concreta para volver cada dia.

## 4. Respuestas mas cortas

Para adolescentes: respuesta corta + accion + pregunta.

EJEMPLO CORRECTO:
"Claro, Gonzalo. Hoy trabajaria 3 cosas:
- Reflejos — 8 min
- Agilidad — 8 min
- Posicionamiento — 8 min
Vas a entrenar solo o con alguien?"

Si responde Solo → sesion para entrenar solo
Si responde Con entrenador → sesion diferente

## 5. Usar mas el perfil del jugador

PLAYER CONTEXT que el Coach debe tener:
Age / Position / Dominant foot / Goal / Level
Sessions/week / Current focus / Previous focus
Last match / Last training

"Como esta semana ya trabajaste reflejos dos veces,
hoy prefiero que hagamos posicionamiento."

## 6. Memoria deportiva estructurada (no solo chat)

No almacenar "Gonzalo dijo X el martes."
Convertir conversaciones en informacion estructurada:

Development Memory:
Goal / Started / Sessions / Difficulty
Player feedback / Coach next recommendation

Alimenta → Football DNA → Development Report

## 7. Coach Check-In semanal

Una vez por semana:
"Hola Gonzalo, revisamos tu semana?"
4 preguntas: Entrenaste? / Jugaste? / Que salio mejor? / Que fue dificil?

TU SEMANA:
- Constancia: Verde
- Reflejos: Verde
- Salidas: Amarillo
- Proximo objetivo: posicionamiento

Principal mecanismo de retencion.

## 8. Personalidad por edad

11-13: corto, visual, positivo, sencillo
14-16: mas tecnico
17-19: conceptos tacticos sofisticados
Busca profesionalismo: mayor exigencia de estandar

## 9. Motivacion especifica, no generica

MENOS: "Sigue adelante! Tu puedes!"
MAS: "Hoy identificaste que tu posicionamiento fue el problema.
Eso ya nos da algo concreto que trabajar manana."

## 10. El "Por que" en cada ejercicio

No solo: "Haz este ejercicio."
Tambien: "Este ejercicio mejora tu primer paso lateral,
importante para llegar antes a tiros colocados."

El jugador aprende futbol mientras entrena.

## 11. Drill Cards

DRILL CARD
GK — Reaction Save / 8 min / 1 ball / 2 players / Intermediate
Diagrama + How + Coach Tip + [START DRILL]

Lenguaje visual propio de MiraFut.

## Lo que NO construir todavia

- Computer vision sofisticado
- Analisis automatico de partidos
- Wearables / GPS
- Prediccion de potencial
- Ratings tipo FIFA
- Nutricion hiperpersonalizada
- Diagnostico de lesiones

## La consecuencia estrategica

Coach + desarrollo + scouting = un solo producto, no tres funcionalidades.

El chico que nunca llega a profesional: sigue pagando porque mejora.
El chico con potencial: su historial alimenta el perfil para scouts.

Documento creado: agosto 2026
MiraFut - Find Your Next Level.

---

## Actualizacion 2 — Coach 8.5/10

### Progreso
Estado inicial: 7/10
Despues de guardrails: 7.8/10
Objetivo semanal: 8.2/10
Version actual: 8.5/10

### Inconsistencia a corregir

Arriba dice: "Te quedan 3 sesiones"
Abajo dice: "Sesion 1/3" (ya completada)

Fuente de verdad unica:
0/3 completadas → "Te quedan 3 sesiones"
1/3 → "Te quedan 2 sesiones"
2/3 → "Te queda 1 sesion"
3/3 → "Objetivo semanal completado!"

### Cambio en el boton

ACTUAL: "Sesion 1/3"
CORRECTO:
- Antes de empezar: "Empezar sesion 1/3"
- Despues: "Sesion 1 completada"
- Tarjeta pasa a: ● ○ ○ con "Sesion 2/3"

### Boton "Hoy no puedo"

Respuesta correcta:
"No pasa nada. Te quedan X sesiones esta semana. Cuando estes listo seguimos."
Futuro: "Quieres que te lo recuerde manana?"

### Lo que falta para cerrar el loop

Cuando el jugador dice "Si, vamos" debe aparecer:
SESION 1 — REFLEJOS
15 min / GK / Nivel adaptado
1. Preparacion — 3 min
2. Reaction drill — 5 min + diagrama
3. Low saves — 5 min + diagrama
4. Cooldown — 2 min
Coach Tip
[EMPEZAR SESION]

Al terminar:
Como te fue? Facil / Bien / Dificil
Que fue lo que mas te costo?
→ guardado para sesion 2

Si "Si, vamos" cierra ese loop correctamente:
Coach listo para Pre-Flight 10.

Documento actualizado: agosto 2026
