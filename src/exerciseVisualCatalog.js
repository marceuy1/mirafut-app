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
        'Coloca 4 conos en línea, a la misma distancia entre sí. Empieza junto al punto de INICIO con el balón controlado.',
        'Conduce en diagonal hacia el espacio entre el primer y el segundo cono.',
        'Cambia de dirección en cada cono: pasa alternando de lado, con toques cortos y el balón cerca del pie.',
        'Tras el último cono sigue hacia el FINAL con una conducción más larga y levanta la cabeza.',
      ],
      en: [
        'Set up 4 cones in a line, evenly spaced. Start next to the START mark with the ball under control.',
        'Dribble diagonally toward the gap between the first and second cone.',
        'Change direction at every cone: pass them alternating sides, with short touches and the ball close to your foot.',
        'After the last cone, carry on to the FINISH with a longer dribble and lift your head.',
      ],
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
        'Colócate en el centro de los 4 conos; un compañero (PASADOR) queda a un lado con el balón.',
        'Antes de que llegue el pase, mira a la izquierda y luego a la derecha para escanear.',
        'Recibe el pase con el cuerpo orientado hacia el espacio libre.',
        'Gira con el balón siempre delante y sal de la presión siguiendo la ruta.',
      ],
      en: [
        'Stand in the middle of the 4 cones; a partner (PASSER) stays to one side with the ball.',
        'Before the pass arrives, look left and then right to scan.',
        'Receive the pass with your body open toward the free space.',
        'Turn with the ball always in front of you and move out of pressure along the route.',
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
