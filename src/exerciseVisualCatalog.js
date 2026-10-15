// ============================================================
// Catalogo de demostraciones visuales del Coach (solo datos, sin JSX).
//
// Cada entrada describe UNA demostracion: como se llama en ES/EN, que
// material/modalidad exige, como se valida que un ejercicio generado por
// el Coach corresponde de verdad a ella, y los pasos que se explican.
//
// Fase actual: solo los 2 casos ya aprobados (animaciones). Las nuevas
// familias (control/recepcion/autopase, sprint/aceleracion) se agregaran
// aqui, como datos, en etapas posteriores.
//
// Regla de oro: ante cualquier duda NO se muestra boton. Por eso cada
// entrada exige que el TITULO y las INSTRUCCIONES del ejercicio coincidan,
// y que el material y la modalidad sean compatibles.
// ============================================================

// Interruptor de audiencia de la experiencia nueva (boton por ejercicio,
// ES/EN, pasos). 'admin' = solo la cuenta de administracion/prueba.
// Para abrirla a todos se cambia esta unica constante (requiere aprobacion).
// OJO: es un interruptor de INTERFAZ, no un mecanismo de seguridad: la
// funcion es solo lectura/visual y no protege datos ni permisos.
export const VISUALS_V2_AUDIENCE = 'admin';

export const VISUAL_CATALOG = {
  case1: {
    id: 'case1',
    family: 'conduccion_cambio_direccion',
    kind: 'animation',
    duration: 8,
    requiresPartner: false,
    requiresCones: true,
    text: {
      es: {
        title: 'Conducción + cambio de dirección',
        meta: '4 conos · 8 segundos',
        tag: 'Balón',
      },
      en: {
        title: 'Dribbling + change of direction',
        meta: '4 cones · 8 seconds',
        tag: 'Ball',
      },
    },
    steps: {
      es: [
        'Coloca 4 conos en línea recta, a la misma distancia entre sí. Ponte en INICIO, un poco antes del cono 1 y a la derecha de la línea, con el balón controlado.',
        'Conduce en diagonal hacia tu izquierda y cruza la línea entre el cono 1 y el cono 2. El cono 1 queda a tu izquierda.',
        'Cambia de dirección hacia tu derecha y cruza entre el cono 2 y el cono 3. El cono 2 queda a tu derecha y el cono 3 a tu izquierda.',
        'Cambia otra vez hacia tu izquierda y cruza entre el cono 3 y el cono 4; el cono 4 queda a tu derecha. Después sigue hasta el FINAL con toques más largos.',
      ],
      en: [
        'Set up 4 cones in a straight line, evenly spaced. Stand at START, slightly before cone 1 and to the right of the line, with the ball under control.',
        'Dribble diagonally to your left and cross the line between cone 1 and cone 2. Cone 1 stays on your left.',
        'Change direction to your right and cross between cone 2 and cone 3. Cone 2 stays on your right and cone 3 on your left.',
        'Change direction to your left again and cross between cone 3 and cone 4; cone 4 stays on your right. Then carry on to the FINISH with longer touches.',
      ],
    },
    // Izquierda/derecha: desde el punto de vista del jugador (avanza del cono 1 al cono 4).
    note: {
      es: 'Izquierda y derecha se cuentan desde tu posición, mirando del cono 1 hacia el cono 4.',
      en: 'Left and right are from your own point of view, facing from cone 1 toward cone 4.',
    },
    tip: {
      es: 'Consejo técnico: levanta la cabeza al salir del último cono.',
      en: 'Technical tip: lift your head as you leave the last cone.',
    },
    match: {
      // El titulo debe tener AMBAS ideas: conduccion y cambio de direccion.
      titleAll: [
        /conducci|dribbl|dribble|close control|carry/,
        /cambio de direccion|cambios de direccion|zigzag|zig-zag|slalom|change of direction|changes of direction|direction change|weav/,
      ],
      // El titulo no puede mezclar otro gesto que el diagrama no muestra.
      titleNone: /remate|tiro|disparo|finaliz|portero|arquero|salto|cabece|shot|shoot|finish|goalkeeper|keeper|header|jump|\bpase\b|\bpases\b|\bpass\b|passes/,
      // Las instrucciones deben describir el mismo movimiento.
      bodyAll: [
        /cambio de direccion|cambios de direccion|zigzag|zig-zag|slalom|alternand|esquiv|rodea|change of direction|direction change|alternat|weav/,
      ],
      // Si las instrucciones dicen otra cosa, no se muestra.
      bodyNone: /en linea recta sin|sin cambio de direccion|straight line only|no change of direction/,
    },
  },
  case2: {
    id: 'case2',
    family: 'escaneo_recepcion_giro',
    kind: 'animation',
    duration: 14,
    requiresPartner: true,
    requiresCones: true,
    text: {
      es: {
        title: 'Escaneo + recepción y giro',
        meta: '4 conos · 14 segundos',
        tag: 'Balón + compañero',
      },
      en: {
        title: 'Scan + receive and turn',
        meta: '4 cones · 14 seconds',
        tag: 'Ball + partner',
      },
    },
    steps: {
      es: [
        'Colócate en el centro de los 4 conos. Un compañero (PASADOR) se pone a tu izquierda, fuera de los conos, con el balón.',
        'Antes de recibir el pase, observa a ambos lados para identificar el espacio disponible.',
        'Recibe el pase con el cuerpo orientado hacia el espacio libre señalado en el diagrama.',
        'Controla el balón, gira y sal siguiendo la ruta indicada, como si estuvieras evitando la presión de un rival.',
      ],
      en: [
        'Stand in the middle of the 4 cones. A partner (PASSER) stands to your left, outside the cones, with the ball.',
        'Before receiving the pass, look to both sides to identify the available space.',
        'Receive the pass with your body open toward the free space shown in the diagram.',
        'Control the ball, turn and move out along the indicated route, as if you were avoiding a rival\'s pressure.',
      ],
    },
    match: {
      titleAll: [
        /escane|scan/,
        /recepci|receiv|reception|first touch|primer toque/,
        /giro|gira|turn|pivot/,
      ],
      titleNone: /remate|tiro|disparo|portero|arquero|cabece|shot|shoot|finish|goalkeeper|keeper|header/,
      bodyAll: [
        /escane|mira|cabeza|scan|look|head/,
        /giro|gira|turn|pivot|orienta|open/,
      ],
      bodyNone: /sin escanear|without scanning/,
    },
  },
};
