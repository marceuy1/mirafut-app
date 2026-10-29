import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararObservacionTecnica, actualizarEstadoObservacionTecnica, registrarSeguimientoDificultad } from '../src/coachLearningMemory.js';

test('Guarda una dificultad técnica reportada', () => {
  const nota = prepararObservacionTecnica(
    'Me cuesta mantener el equilibrio',
    'difficulty',
    { goal: 'Aumentar mi velocidad', session_number: 2 }
  );

  assert.equal(nota.note_type, 'difficulty');
  assert.equal(nota.status, 'active');
  assert.equal(nota.session_number, 2);
  assert.equal(nota.goal, 'Aumentar mi velocidad');
});

test('Registra una mejora reportada', () => {
  const nota = prepararObservacionTecnica(
    'Ahora mantengo mejor el equilibrio',
    'improvement'
  );

  assert.equal(nota.note_type, 'improvement');
  assert.equal(nota.status, 'improving');
});

test('Rechaza observaciones vacías', () => {
  assert.equal(prepararObservacionTecnica('   ', 'difficulty'), null);
});

test('Rechaza tipos desconocidos', () => {
  assert.equal(prepararObservacionTecnica('Prueba', 'unknown'), null);
});

test('Rechaza observaciones demasiado largas', () => {
  assert.equal(prepararObservacionTecnica('a'.repeat(1001), 'difficulty'), null);
});

test('Conserva el identificador del objetivo semanal', () => {
  const goalId = '123e4567-e89b-42d3-a456-426614174000';
  const nota = prepararObservacionTecnica(
    'Me costó cambiar de dirección',
    'difficulty',
    { weekly_goal_id: goalId, session_number: 1 }
  );

  assert.equal(nota.weekly_goal_id, goalId);
  assert.equal(nota.session_number, 1);
});

test('No asigna un número de sesión inválido', () => {
  const nota = prepararObservacionTecnica(
    'Me costó controlar el balón',
    'difficulty',
    { session_number: -1 }
  );

  assert.equal(nota.session_number, null);
});

test('Confirma el guardado de una observación', async () => {
  const { guardarObservacionTecnica } = await import('../src/coachLearningMemory.js');

  const nota = prepararObservacionTecnica(
    'Me cuesta controlar el balón',
    'difficulty'
  );

  const supabaseSimulado = {
    from(tabla) {
      assert.equal(tabla, 'coach_learning_notes');
      return {
        insert(registros) {
          assert.equal(registros[0].user_id, 'jugador-1');
          assert.equal(registros[0].observation, nota.observation);
          return {
            select() {
              return {
                async single() {
                  return { data: { id: 'nota-1', ...registros[0] }, error: null };
                }
              };
            }
          };
        }
      };
    }
  };

  const resultado = await guardarObservacionTecnica(
    supabaseSimulado,
    'jugador-1',
    nota
  );

  assert.equal(resultado.error, null);
  assert.equal(resultado.data.id, 'nota-1');
});

test('Detecta cuando Supabase rechaza el guardado', async () => {
  const { guardarObservacionTecnica } = await import('../src/coachLearningMemory.js');

  const supabaseSimulado = {
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                async single() {
                  return { data: null, error: { message: 'Permiso denegado' } };
                }
              };
            }
          };
        }
      };
    }
  };

  const resultado = await guardarObservacionTecnica(
    supabaseSimulado,
    'jugador-1',
    prepararObservacionTecnica('Me cuesta girar', 'difficulty')
  );

  assert.equal(resultado.data, null);
  assert.equal(resultado.error, 'Permiso denegado');
});

test('Recupera la memoria del jugador correcto', async () => {
  const { recuperarMemoriaTecnica } = await import('../src/coachLearningMemory.js');

  const notas = [
    {
      id: 'nota-1',
      observation: 'Me costó mantener el equilibrio',
      note_type: 'difficulty',
      status: 'active'
    }
  ];

  const supabaseSimulado = {
    from(tabla) {
      assert.equal(tabla, 'coach_learning_notes');
      return {
        select(campos) {
          assert.ok(campos.includes('observation'));
          return {
            eq(campo, valor) {
              assert.equal(campo, 'user_id');
              assert.equal(valor, 'jugador-1');
              return {
                order(campoOrden, opciones) {
                  assert.equal(campoOrden, 'created_at');
                  assert.equal(opciones.ascending, false);
                  return {
                    async limit(cantidad) {
                      assert.equal(cantidad, 20);
                      return { data: notas, error: null };
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  };

  const resultado = await recuperarMemoriaTecnica(
    supabaseSimulado,
    'jugador-1'
  );

  assert.equal(resultado.error, null);
  assert.equal(resultado.data.length, 1);
  assert.equal(resultado.data[0].observation, notas[0].observation);
});

test('Prepara el contexto de aprendizaje sin inventar información', async () => {
  const { prepararContextoMemoria } = await import('../src/coachLearningMemory.js');

  const contexto = prepararContextoMemoria([
    {
      observation: 'Me cuesta mantener el equilibrio',
      note_type: 'difficulty',
      status: 'active'
    },
    {
      observation: 'Ahora controlo mejor el balón',
      note_type: 'improvement',
      status: 'improving'
    }
  ]);

  assert.ok(contexto.includes('Dificultad reportada (activa): Me cuesta mantener el equilibrio'));
  assert.ok(contexto.includes('Mejora reportada (mejorando): Ahora controlo mejor el balón'));
});

test('No crea recuerdos cuando no hay observaciones', async () => {
  const { prepararContextoMemoria } = await import('../src/coachLearningMemory.js');

  assert.equal(prepararContextoMemoria([]), '');
  assert.equal(prepararContextoMemoria(null), '');
});

test('rechaza estados de seguimiento no permitidos', async () => {
  const resultado = await actualizarEstadoObservacionTecnica(
    {},
    'jugador-1',
    'observacion-1',
    'inventado'
  );

  assert.equal(resultado.data, null);
  assert.ok(resultado.error);
});

test('exige identificar al jugador y la observación', async () => {
  const resultado = await actualizarEstadoObservacionTecnica(
    {},
    '',
    'observacion-1',
    'resolved'
  );

  assert.equal(resultado.data, null);
  assert.ok(resultado.error);
});

test('actualiza una dificultad con filtros de jugador y observación', async () => {
  const filtros = [];
  let cambios = null;

  const consulta = {
    update(valores) {
      cambios = valores;
      return this;
    },
    eq(campo, valor) {
      filtros.push([campo, valor]);
      return this;
    },
    select() {
      return this;
    },
    async single() {
      return { data: { id: 'observacion-1', ...cambios }, error: null };
    }
  };

  const supabase = {
    from(tabla) {
      assert.equal(tabla, 'coach_learning_notes');
      return consulta;
    }
  };

  const resultado = await actualizarEstadoObservacionTecnica(
    supabase,
    'jugador-1',
    'observacion-1',
    'improving'
  );

  assert.equal(resultado.error, null);
  assert.equal(resultado.data.status, 'improving');
  assert.ok(cambios.updated_at);
  assert.deepEqual(filtros, [
    ['id', 'observacion-1'],
    ['user_id', 'jugador-1'],
    ['note_type', 'difficulty']
  ]);
});

test('maneja errores de Supabase al actualizar una dificultad', async () => {
  const consulta = {
    update() { return this; },
    eq() { return this; },
    select() { return this; },
    async single() {
      return { data: null, error: { message: 'Acceso denegado' } };
    }
  };

  const supabase = {
    from() { return consulta; }
  };

  const resultado = await actualizarEstadoObservacionTecnica(
    supabase,
    'jugador-1',
    'observacion-1',
    'resolved'
  );

  assert.equal(resultado.data, null);
  assert.equal(resultado.error, 'Acceso denegado');
});

test('No confirma la actualización si la observación no existe', async () => {
  const consulta = {
    update() { return this; },
    eq() { return this; },
    select() { return this; },
    async single() {
      return {
        data: null,
        error: { message: 'No se encontró la observación' }
      };
    }
  };

  const supabase = {
    from(tabla) {
      assert.equal(tabla, 'coach_learning_notes');
      return consulta;
    }
  };

  const resultado = await actualizarEstadoObservacionTecnica(
    supabase,
    'jugador-1',
    'observacion-inexistente',
    'resolved'
  );

  assert.equal(resultado.data, null);
  assert.equal(resultado.error, 'No se encontró la observación');
});
test('Registra seguimiento sin cambiar el estado de la dificultad', async () => {
  const filtros = [];
  let cambios = null;

  const consulta = {
    update(valores) {
      cambios = valores;
      return this;
    },
    eq(campo, valor) {
      filtros.push([campo, valor]);
      return this;
    },
    neq(campo, valor) {
      filtros.push([campo, '!=', valor]);
      return this;
    },
    select() {
      return this;
    },
    async single() {
      return {
        data: { id: 'observacion-1' },
        error: null
      };
    }
  };

  const supabase = {
    from(tabla) {
      assert.equal(tabla, 'coach_learning_notes');
      return consulta;
    }
  };

  const resultado = await registrarSeguimientoDificultad(
    supabase,
    'jugador-1',
    'observacion-1',
    'objetivo-2'
  );

  assert.equal(resultado.error, null);
  assert.equal(resultado.data.id, 'observacion-1');

  assert.equal(cambios.last_follow_up_goal_id, 'objetivo-2');
  assert.ok(!Number.isNaN(Date.parse(cambios.last_follow_up_at)));
  assert.equal(Object.hasOwn(cambios, 'status'), false);

  assert.deepEqual(filtros, [
    ['id', 'observacion-1'],
    ['user_id', 'jugador-1'],
    ['note_type', 'difficulty'],
    ['status', '!=', 'resolved']
  ]);
});
test('No confirma seguimiento cuando Supabase devuelve un error', async () => {
  const consulta = {
    update() { return this; },
    eq() { return this; },
    neq() { return this; },
    select() { return this; },
    async single() {
      return {
        data: null,
        error: { message: 'Acceso denegado' }
      };
    }
  };

  const supabase = {
    from() { return consulta; }
  };

  const resultado = await registrarSeguimientoDificultad(
    supabase,
    'jugador-1',
    'observacion-1',
    'objetivo-2'
  );

  assert.equal(resultado.data, null);
  assert.equal(resultado.error, 'Acceso denegado');
});