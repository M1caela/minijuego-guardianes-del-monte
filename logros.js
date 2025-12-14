// logros.js

let mostrarAnimacionLogro = false;
let inicioAnimacionLogro = 0;
let DURACION_ANIMACION = 6000; // 6 segundos
let logroActual = null; // qué logro disparó la animación


const logros = {
  topadoras: "Eliminar todas las topadoras",
  incendios: "Apagar todos los incendios",
  riegos: "Regar árboles",
  plantar: "Plantar árboles",
  animal: "Ayudar al animal"
};

let logrosCompletados = {
  topadoras: false,
  incendios: false,
  riegos: false,
  plantar: false,
  animal: false
};

// valores locales espejo / origen de visual
let topadorasLocales = 0;
let fuegosLocales = 0;
let riegosLocales = 0;
let arbolesLocales = 0;
let animalesLocales = 0;

// lo que se debe completar para ganar:
const REQ = {
  topadoras: 6,           
  fuegos_apagados: 6,     
  riegos: 14,
  arboles_plantados: 3,
  animales_ayudados: 1
};



