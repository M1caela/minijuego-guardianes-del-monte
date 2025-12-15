// Salud del Monte //

let monteMaxHealth = 100;   // valor máximo de salud 
let monteHealth = 20;      // salud  inicial
let monteWinThreshold = 100; // si llega ganar
let monteLoseThreshold = 1; // si llega perder


// Inicializar 
function initMonte() {
  monteMaxHealth = 100;
  monteHealth = 20;
  monteWinThreshold = 100;
  monteLoseThreshold = 1;
}

// Función central para cambiar la salud
function cambiarSaludMonte(delta) {
  monteHealth += delta;
  if (monteHealth > monteMaxHealth) monteHealth = monteMaxHealth;
  if (monteHealth < 0) monteHealth = 0;
  chequearEstadoMonte(); 

  // CONEXIÓN CON PHP PARA EFECTOS VISUALES
  // Si hubo un cambio, pedimos la configuración del efecto al servidor
  if (delta !== 0) {
    let tipo = delta > 0 ? "positivo" : "negativo";
    fetch("obtenerEfecto.php?tipo=" + tipo)
      .then(response => response.json())
      .then(data => {
        spawnParticulasHUD(data); // Función en play.js que parsea el JSON
      })
      .catch(err => console.error("Error cargando efecto:", err));
  }
}

// Dibujar la barra de salud del monte
function dibujarBarraMonte() {
  // Barra de fondo
  let bx = 20, by = 20, bw = 240, bh = 18;
  push();
  noStroke();
  fill(40);
  rect(bx - 2, by - 2, bw + 4, bh + 4, 4);

  // Barra vacía (gris)
  fill(80);
  rect(bx, by, bw, bh, 4);

  // Barra con color según porcentaje
  let pct = monteHealth / monteMaxHealth;
  let barW = bw * pct;
  if (pct > 0.6) fill(70, 200, 100);    // verde
  else if (pct > 0.3) fill(240, 180, 50); // amarillo
  else fill(230, 80, 60);               // rojo

  rect(bx, by, barW, bh, 4);

  // txto informativo
  fill(255);
  textSize(14);
  textAlign(LEFT, CENTER);
  text('Salud del monte: ' + nf(monteHealth, 0, 0) + ' / ' + monteMaxHealth, bx, by + bh + 12);
}

// Chequea condiciones y cambia gameState si corresponde
function chequearEstadoMonte() {
  if (monteHealth <= monteLoseThreshold) {
    gameState = "perder"; // Al llegar a 0% de salud → Perder → Puntaje 0%
  } else if (monteHealth >= monteWinThreshold && todosLosLogrosCompletados()) {
    gameState = "ganar"; // Si vida al 100% y todos los logros completados → Ganar → Puntaje 100%
  } else if (tiempoRestante <= 0) {
    tiempoRestante = 0;
    gameState = "perderTiempo"; // Si finaliza el tiempo sin completar todas las tareas → Perder  → Puntaje calculable
}
}
  
//  Acciones del juego que afectan la salud // 
function plantarArbol(px, py) {
  arbolesPlantados++;
  cambiarSaludMonte(+10);  // plantar suma salud
}

function topadoraDestruyeTree(treeIndex) {
  arbolesDestruidos++;
  cambiarSaludMonte(-13);  // talar resta salud 
}

// instruccciones - cambia msj segun evento

function getInstruccion() {
  // si jugdor cerca de arbol
  let rangoArbol = 80; 
  for (let a of arboles) {
    if (!a || !a.vivo) continue;
    if (dist(x, y, a.x, a.y) < rangoArbol) {
      return "Presioná R para regar el árbol.";
    }
  }

  // Prioridad: si hay animal cerca, mostrar mensaje de ayuda
  if (animalActivo && !animal.curado) {
    if (dist(x, y, animal.x, animal.y) < 90) {
      return "¡Un coatí lastimado! Presioná A para ayudarlo.";
    }
  }

  // si hay topadoras activas en el mapa
  if (topadoras && topadoras.some(t => t.active && !t.dead)) {
    return "Apuntá y hacé clic para disparar y detener a las topadoras.";
  }

  // si hay fuego activo
  if (fuegoActivo && fuegos && fuegos.some(f => f.activo)) {
    return "¡Fuego! Apuntá y hacé clic para apagarlo.";
  }

  // si ya se apagó el fuego y aún no ganó
  if (puedePlantar) {
      return "Presioná P para plantar un nuevo árbol.";
  }

  return "";
}

// mostrar cuantos tiros quedan (se recarga cada x seg)
function dibujarMunicionHUD() {
  push();
  textAlign(LEFT, TOP);
  textSize(14);
  fill(255);

  if (recargando) {
    let t = (tiempoRecarga - (millis() - tiempoInicioRecarga)) / 1000;
    t = max(0, t).toFixed(1);
    text("Tiros: recargando... (" + t + "s)", 20, 62);
  } else {
    text("Tiros: " + municionActual + "/" + maxMunicion, 20, 62);
  }

  pop();
}