import test from "node:test";
import assert from "node:assert/strict";
import { solicitaEntrenamiento } from "../src/solicitaEntrenamiento.js";

test("Reconoce solicitudes explícitas de entrenamiento", () => {
  for (const texto of ["Sí, vamos", "Quiero entrenar", "Quiero hacer mi sesión", "I want to train"]) {
    assert.equal(solicitaEntrenamiento(texto, true), true, texto);
  }
});

test("Las preguntas técnicas no generan entrenamientos", () => {
  for (const texto of ["¿Cómo coloco los pies?", "¿Cómo puedo entrenar mejor?", "Can you explain the turn?"]) {
    assert.equal(solicitaEntrenamiento(texto, true), false, texto);
  }
});

test("Sin objetivo semanal no inicia entrenamientos", () => {
  assert.equal(solicitaEntrenamiento("Quiero entrenar", false), false);
  assert.equal(solicitaEntrenamiento("Sí, vamos", false), false);
});
