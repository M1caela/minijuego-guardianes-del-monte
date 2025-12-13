// logros.js

let logros = {
  topadoras: { nombre: "Eliminar todas las topadoras", completado: false },
  incendios: { nombre: "Apagar todos los incendios", completado: false },
  riegos: { nombre: "Regar árboles 15 veces", completado: false, contador: 0 },
  plantar: { nombre: "Plantar 3 árboles nuevos", completado: false, contador: 0 },
  animal: { nombre: "Ayudar al animal", completado: false }
};

// valores locales espejo
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

/*
// partículas de estrellas (animaciones)
let estrellasPool = []; // ParticulaEstrella instances

class ParticulaEstrella {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = -1.2 - random(0.2);
    this.vx = random(-0.6, 0.6);
    this.alpha = 255;
    this.size = random(8, 14); // 12x12 pixel approx
    this.life = 1200 + random(200);
    this.born = millis();
  }
  update() {
    let t = millis() - this.born;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha = map(t, 0, this.life, 255, 0);
  }
  draw() {
    push();
    noStroke();
    fill(255, 220, 70, this.alpha);
    // dibujo sencillo de estrella pixel — puedes reemplazar por image(estrellaImg,...)
    // dibujamos un pequeño cross para efecto pixel
    rectMode(CENTER);
    for (let dx of [-1,0,1]) for (let dy of [-1,0,1]) {
      if ((dx===0 && dy===0) || random() < 0.6) {
        rect(this.x + dx*1, this.y + dy*1, this.size/6, this.size/6);
      }
    }
    pop();
  }
  isDead() { return this.alpha <= 5; }
}

function spawnEstrellas(x,y,n) {
  for (let i=0;i<n;i++) {
    let sx = x + random(-12,12);
    let sy = y + random(-6,6);
    estrellasPool.push(new ParticulaEstrella(sx, sy));
  }
}

// dibujar y actualizar pool 
function actualizarEstrellas() {
  for (let i = estrellasPool.length - 1; i >= 0; i--) {
    let s = estrellasPool[i];
    s.update();
    s.draw();
    if (s.isDead()) estrellasPool.splice(i,1);
  }
}
*/

/* --------- Comunicación con el servidor --------- */

// obtener JSON remoto y comparar con locales
function cargarLogros() {
  loadJSON("control.php", procesarLogros, function(err){ console.log("Error al cargar logros:", err); });
}

function actualizarLogros() {

  // 1. Topadoras (logro cuando NO queda ninguna activa)
  if (topadoras && topadoras.every(t => t.dead === true)) {
    logros.topadoras.completado = true;
  }

  // 2. Incendios (logro cuando todas están apagadas)
  if (fuegos && fuegos.every(f => f.activo === false)) {
    logros.incendios.completado = true;
  }

  // 3. Riegos (contador → se completa al llegar a 15)
  if (logros.riegos.contador >= 14) {
    logros.riegos.completado = true;
  }
}

// procesa la respuesta del servidor (data = { topadoras, fuegos_apagados, riegos, arboles_plantados, animales_ayudados })
function procesarLogros(data) {
  if (!data) return;
  // comparar cada campo y disparar animaciones cuando haya diferencia positiva
  if (data.topadoras !== undefined && data.topadoras > topadorasLocales) {
    // posición para mostrar estrella: por defecto, encima del HUD (ajusta coords)
    spawnEstrellas(width - 120, 60, data.topadoras - topadorasLocales);
  }
  if (data.fuegos_apagados !== undefined && data.fuegos_apagados > fuegosLocales) {
    spawnEstrellas(width - 220, 60, data.fuegos_apagados - fuegosLocales);
  }
  if (data.riegos !== undefined && data.riegos > riegosLocales) {
    spawnEstrellas(width - 320, 60, floor((data.riegos - riegosLocales)/3)); // agrupar riegos de a 3
  }
  if (data.arboles_plantados !== undefined && data.arboles_plantados > arbolesLocales) {
    spawnEstrellas(width - 420, 60, data.arboles_plantados - arbolesLocales);
  }
  if (data.animales_ayudados !== undefined && data.animales_ayudados > animalesLocales) {
    spawnEstrellas(width - 520, 60, data.animales_ayudados - animalesLocales);
  }

  // actualizar locales
  topadorasLocales = data.topadoras || 0;
  fuegosLocales = data.fuegos_apagados || 0;
  riegosLocales = data.riegos || 0;
  arbolesLocales = data.arboles_plantados || 0;
  animalesLocales = data.animales_ayudados || 0;

  // ver si todos los logros están cumplidos (comparar contra REQ)
  let ok = true;
  ok = ok && (topadorasLocales >= REQ.topadoras);
  ok = ok && (fuegosLocales >= REQ.fuegos_apagados);
  ok = ok && (riegosLocales >= REQ.riegos);
  ok = ok && (arbolesLocales >= REQ.arboles_plantados);
  ok = ok && (animalesLocales >= REQ.animales_ayudados);

  if (ok) {
    console.log("TODOS LOS LOGROS CUMPLIDOS -> GANAR");
    gameState = "ganar";
  }
}

// enviar una acción al servidor (por ejemplo cuando ocurre un evento en el juego)
function enviarAccionAlServidor(accion, cantidad=1) {
  fetch("control.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({accion: accion, cantidad: cantidad})
  })
  .then(r => r.json())
  .then(j => {
    // opcional: recargar el JSON para obtener el estado actualizado
    cargarLogros();
  })
  .catch(e => console.log("Error enviarAccionAlServidor:", e));
}

function dibujarVentanaLogros() {
  let logrosW = 220;
  let logrosH = 140;
  let logrosX = width - logrosW - 20; 
  let logrosY = 20;

  push();
  rectMode(CORNER);

  // Fondo
  fill(60);
  stroke(20);
  strokeWeight(2);
  rect(logrosX, logrosY, logrosW, logrosH, 8);

  // Título
  noStroke();
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("LOGROS", logrosX + 10, logrosY + 8);

  // Lista
  textSize(14);
  let y = logrosY + 35;

  for (let nombre in logros) {
    let item = logros[nombre];
    let check = item.completado ? "✔" : "□";
    text(`${check} ${nombre}`, logrosX + 10, y);
    y += 22;
  }

  pop();
}

/*  Llamá cargarLogros() periódicamente desde draw()  -  por ejemplo: if (frameCount % (60*5) === 0) cargarLogros(); // cada 5 segundos
 y en draw() llamá actualizarEstrellas() para dibujarlas */




 



