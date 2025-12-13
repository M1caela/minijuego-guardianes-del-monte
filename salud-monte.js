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
    gameState = "perder";
  } else if (monteHealth >= monteWinThreshold) {
    gameState = "ganar";
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
      return "Presioná R para regar el árbol}.";
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
  textSize(18);
  fill(255);

  if (recargando) {
    let t = (tiempoRecarga - (millis() - tiempoInicioRecarga)) / 1000;
    t = max(0, t).toFixed(1);
    text("Tiros: recargando... (" + t + "s)", 20, 60);
  } else {
    text("Tiros: " + municionActual + "/" + maxMunicion, 20, 60);
  }

  pop();
}