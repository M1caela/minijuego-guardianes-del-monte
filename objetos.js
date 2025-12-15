//////////////////////////////////////////          TOPADORAS            //////////////////////////////////////////

// Topadoras y tiros
let topadoras = [];
let proyectiles = [];
let topadorasDestruidas = 0;
let arbolesDestruidos = 0;
let totalTopadorasMeta = 6;  // cantidad total antes de pasar al fuego
let fuegoIniciado = false; // se inicia al vencer topadoras
let totalTopadorasSpawned = 0; // total (inicial + spawns)

// punteria
let isAiming = false;
let aimStartWorld = { x: 0, y: 0 };
let aimEndWorld = { x: 0, y: 0 };
let maxThrowSpeed = 8;
let minThrowDistance = 10; 
let camXGlobal = 0, camYGlobal = 0;
let aimWorldX = 0, aimWorldY = 0;

let maxMunicion = 12;        // cantidad total de tiros
let municionActual = 10;     // empieza lleno
let recargando = false;      // para saber si está recargando
let tiempoRecarga = 6000;    // 6 segundos 
let tiempoInicioRecarga = 0; // cuándo comenzó a recargarse


class Topadora {
  constructor(x, y, hp = 3, speed = null) {
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.speed = (speed === null) ? random(0.8, 1.6) : speed;
    this.active = true;
    this.dead = false;
    this.deathStart = 0;
    this.alpha = 255;
    this.targetIndex = null;
    this.idleTimer = 0;
  }

  // lógica de movimiento y comportamiento
  update() {
    // si murió: gestionar fade y no moverse
    if (this.dead) {
      let elapsed = millis() - this.deathStart;
      let fadeDur = 1000;
      this.alpha = max(0, 255 - map(elapsed, 0, fadeDur, 0, 255));
      if (elapsed > fadeDur) {
        this.active = false;
      }
      return;
    }

    if (!this.active) return;

    // Buscar objetivo: árbol cercano vivo 
    let mejorIdx = null;
    let mejorDist = Infinity;
    for (let j = 0; j < arboles.length; j++) {
      let a = arboles[j];
      if (!a || !a.vivo) continue;
      if (a.etapa < 2) continue;
      let d = dist(this.x, this.y, a.x, a.y);
      if (d < mejorDist) {
        mejorDist = d;
        mejorIdx = j;
      }
    }
    this.targetIndex = mejorIdx;

    if (this.targetIndex !== null) {
      // moverse hacia el árbol objetivo
      let target = arboles[this.targetIndex];
      let dx = target.x - this.x;
      let dy = target.y - this.y;
      let mag = sqrt(dx*dx + dy*dy) + 0.0001;
      
      let vx = (dx / mag) * this.speed;
      let vy = (dy / mag) * this.speed;

      // Movimiento independiente en ejes (permite deslizarse)
      if (posicionValida(this.x + vx, this.y, this)) this.x += vx;
      if (posicionValida(this.x, this.y + vy, this)) this.y += vy;

      // si llegó al árbol > talar
      if (dist(this.x, this.y, target.x, target.y) < 40) {
        // marcar árbol como talado (inicia fade en la clase Arbol)
        if (typeof target.talar === 'function') target.talar();
        arbolesDestruidos = (typeof arbolesDestruidos !== 'undefined') ? arbolesDestruidos + 1 : 1;
        cambiarSaludMonte(-14);
        this.idleTimer = 1200;
      }
    } else {
      // avanza hacia jugador en  zigzag
      this.idleTimer -= deltaTime;
      if (this.idleTimer <= 0) {
        let dx = x - this.x;
        let dy = (height/2 + camYGlobal) - this.y;
        let mag = sqrt(dx*dx + dy*dy) + 0.0001;
        
        let vx = (dx / mag) * (this.speed * 0.4);
        let vy = sin(frameCount * 0.02 + this.x*0.001) * 0.5;

        // Movimiento independiente
        if (posicionValida(this.x + vx, this.y, this)) this.x += vx;
        if (posicionValida(this.x, this.y + vy, this)) this.y += vy;
      }
    }

    // si sale demasiado del mapa inhabilitar
    if (this.x < -200 || this.x > mapaAncho + 200) {
      this.active = false;
    }
  }

  // dibujar de la topadora
  draw() {
    push();
    imageMode(CENTER);
    if (this.alpha === undefined) this.alpha = 255;
    if (typeof topadoraImg !== 'undefined' && topadoraImg) {
      tint(255, this.alpha);
      image(topadoraImg, this.x, this.y, 120, 80);
      noTint();
    } else {
      noStroke();
      fill(140, this.alpha);
      rectMode(CENTER);
      rect(this.x, this.y, 80, 40, 6);
    }

    // barra de vida topadora
    if ((this.alpha || 255) > 10) {
      let w = 50;
      noStroke();
      fill(40, this.alpha);
      rect(this.x - w/2, this.y - 36, w, 6);
      fill(200, 80, 80, this.alpha);
      let hpW = constrain((this.hp / this.maxHp) * w, 0, w);
      rect(this.x - w/2, this.y - 36, hpW, 6);
    }

    pop();
  }

  // recibir impacto de un proyectil
  recibirImpacto() {
    if (this.dead || !this.active) return;
    this.hp -= 1;
    if (this.hp <= 0) {
      this.iniciarMuerte();
    }
  }

  // iniciar fade-muerte y recompensa
  iniciarMuerte() {
    if (this.dead) return; // evita doble conteo
    this.dead = true;
    this.deathStart = millis();
    this.alpha = 255;
    this.speed = 0;
    cambiarSaludMonte(+5);

    // contabilizar local y enviar al servidor
    topadorasLocales++;
    enviarAccionAlServidor("topadora");

    topadorasDestruidas = (topadorasDestruidas || 0) + 1;
    console.log("Topadora destruida:", topadorasDestruidas);

    // si ya alcanzamos la meta, iniciar fuego y no spawnear más
    if (topadorasDestruidas >= totalTopadorasMeta && !fuegoIniciado) {
      fuegoIniciado = true;
      console.log(" Fuego iniciado! ");
      initFuegos();
    } else {
      // si todavía no llegamos a la meta,  spawnear nueva
      spawnTopadora();
    }
  }
}

// iniciar topadodoras, se mueven hacia arboles y tienen sist de vida
function initTopadoras() {
  topadoras = [];
  // Cargar objetos estáticos temporalmente para validar spawn inicial
  if (typeof objetosEstaticos !== 'undefined') objetos = [...objetosEstaticos];

  let n = floor(random(2, 4)); 
  for (let i = 0; i < n; i++) {
    // Buscar posición válida para no spawnear dentro de objetos
    let tx, ty;
    let intentos = 0;
    do {
      tx = mapaAncho - random(40, 250);
      ty = random(150, mapaAlto - 150);
      intentos++;
    } while (!posicionValida(tx, ty) && intentos < 50);

    topadoras.push(new Topadora(tx, ty, 3));
  }
  // contamos cuántas generamos 
  totalTopadorasSpawned = topadoras.length;
  topadorasDestruidas = 0; // reiniciar contador 
  fuegoIniciado = false;
}

// aparece nueva topador al matar una, hasta llegar al tope
function spawnTopadora() {
  if (totalTopadorasSpawned >= totalTopadorasMeta || fuegoIniciado) {
    return;
  }

  let activas = topadoras.filter(t => t.active && !t.dead).length;
  if (activas >= 3) return;

  // crear nueva topadora y contabilizarla 
  let tx, ty;
  let intentos = 0;
  do {
    tx = mapaAncho - random(40, 250);
    ty = random(150, mapaAlto - 150);
    intentos++;
  } while (!posicionValida(tx, ty) && intentos < 50);

  topadoras.push(new Topadora(tx, ty, 3));
  totalTopadorasSpawned++;
  console.log("Topadoras spawmeadas:", totalTopadorasSpawned);
}

// tiro hacia las topadoras 
function actualizarProyectiles() {
  if (!topadoras) topadoras = []; // seguridad
  for (let i = proyectiles.length - 1; i >= 0; i--) {
    let p = proyectiles[i];

    // movimiento
    p.x += p.vx;
    p.y += p.vy;

    // vida limitada del proyectil
    if (millis() - p.born > p.life) {
      proyectiles.splice(i, 1);
      continue;
    }

    // dibujar proyectil
    noStroke();
    fill(255, 230, 50);
    ellipse(p.x, p.y, p.r * 2);

    // detectar colisión con topadoras 
    for (let j = 0; j < topadoras.length; j++) {
    let t = topadoras[j];
    if (!t || t.dead || !t.active) continue;
      if (p.x > t.x - 60 && p.x < t.x + 60 && p.y > t.y - 40 && p.y < t.y + 40) {
      t.recibirImpacto();
      proyectiles.splice(i, 1);
      break;
      }  
    }
  } // fin for proyectiles
}

function dibujarProyectiles() {
  for (let p of proyectiles) {
    push();
    noStroke();
    fill(230, 230, 80);
    ellipse(p.x, p.y, p.r * 2);
    pop();
  }
}

function iniciarRecarga() {
  recargando = true;
  tiempoInicioRecarga = millis();
}


//////////////////////////////////////////          INCENDIOS            //////////////////////////////////////////

class Fuego {
  constructor(x, y, hp = 5) {
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.activo = true;
    this.lastDamageTime = millis();
  }

  update() {
    if (!this.activo) return;

    // movimiento leve 
    this.y += sin((frameCount + this.x * 0.1) * 0.1) * 0.3;

    // daño gradual mienras esta activo
    let now = millis();
    let elapsed = now - this.lastDamageTime;
    if (elapsed >= fuegoTickInterval) {
      let ticks = floor(elapsed / fuegoTickInterval);
      let damagePerTick = fuegoDamagePerSecond * (fuegoTickInterval / 1000);
      let totalDamage = damagePerTick * ticks;

      if (totalDamage > 0) cambiarSaludMonte(-totalDamage);
      this.lastDamageTime += ticks * fuegoTickInterval;
    }
  }

  // recibe impacto del chorro de agua
  recibirAgua() {
    if (!this.activo) return;
    this.hp--;
    if (this.hp <= 0) {
      this.activo = false;
      cambiarSaludMonte(+10);
      
      // contabilizar local y enviar al servidor
      fuegosLocales++;
      enviarAccionAlServidor("incendio");

    }
  }

  // dibujar en pantalla
  draw() {
    if (!this.activo) return;
    push();
    imageMode(CENTER);
    tint(255, 180 + sin(frameCount * 0.2) * 50);
    image(fuegoImg, this.x, this.y, 100, 100);
    noTint();

    // barra de vida
    let w = 40;
    fill(40, 200);
    rect(this.x - w / 2, this.y - 60, w, 6);
    fill(80, 180, 255);
    rect(this.x - w / 2, this.y - 60, (this.hp / 5) * w, 6);
    pop();
  }
}

function initFuegos() {
  fuegos = [];

  // fuego en casa grande
  fuegos.push(new Fuego(320, 120));
  fuegos.push(new Fuego(200, 85));
  fuegos.push(new Fuego(170, 70));
  fuegos.push(new Fuego(215, 100));

  // fuego en casita
  fuegos.push(new Fuego(1200, 350));
  fuegos.push(new Fuego(1100, 267));

  // daño
  fuegoDamagePerSecond = 1;
  fuegoTickInterval = 2000;

  fuegoActivo = true;
  fuegoDerrotado = false;

  // asegurarse de topadoras inactivas
  for (let t of topadoras) {
    t.active = false;
    if (!t.dead) t.iniciarMuerte();
  }
}

function actualizarFuegos() {
  if (!fuegoActivo) return;
  for (let f of fuegos) f.update();
  
    // si todos están apagados
    if (fuegos.every(f => !f.activo)) {
      fuegoActivo = false;
      fuegoDerrotado = true;

      //  activar animal para ayudar una vez que se apagaron fuegos
      if (!animalActivo && !animalAyudado) {
        crearAnimal();
        console.log("Se creó nuevo animal en mapa.");
         
      } 
    }
 }

function dibujarFuegos() {
  if (!fuegoActivo) return;
  for (let f of fuegos) f.draw();
}

function actualizarAgua() {
  if (!fuegoActivo) return;

  for (let i = aguaProyectiles.length - 1; i >= 0; i--) {
    let p = aguaProyectiles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (millis() - p.born > p.life) {
      aguaProyectiles.splice(i, 1);
      continue;
    }

    // dibujar el disparo de agua
    noStroke();
    fill(100, 180, 255, 200);
    ellipse(p.x, p.y, p.r * 2.5);

    // colisión con los fuegos 
    for (let f of fuegos) {
      if (!f.activo) continue;
      if (
        p.x > f.x - 50 && p.x < f.x + 50 &&
        p.y > f.y - 50 && p.y < f.y + 50
      ) {
        f.recibirAgua();
        aguaProyectiles.splice(i, 1);
        break;
      }
    }
  }
}


//////////////////////////////////////////          ARBOLES            //////////////////////////////////////////

class Arbol {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.etapa = 1; // brote, medio, grande
    this.vivo = true;
  }
  // desaparece cuando es talado
  talar() {
    if (this.vivo && !this.talado) {
      this.talado = true;
      this.vivo = false;
    }
  }
  
  desaparecio() {
    return this.talado && this.alpha <= 0;
  }

}

function initArboles() {
  arboles = [];
  arboles.push(new Arbol(200, 450)); arboles[arboles.length-1].isInitial = true;
  arboles.push(new Arbol(390, 700)); arboles[arboles.length-1].isInitial = true;
  arboles.push(new Arbol(100, 300)); arboles[arboles.length-1].isInitial = true;
  arboles.push(new Arbol(250, 600)); arboles[arboles.length-1].isInitial = true;

  initialArbolesCount = arboles.filter(a => a.isInitial).length; 
  nuevosPlantados = 0;
  puedePlantar = false;
}

function dibujarArboles() {
  for (let i = 0; i < arboles.length; i++) {
    let a = arboles[i];
    if (!a.vivo) continue;

    let img;
    let tam; 

    if (a.etapa === 1) {
      img = imgBrote;
      tam = 80;   
    } 
    else if (a.etapa === 2) {
      img = imgArbolMedio;
      tam = 140; 
    } 
    else {
      img = imgArbolGrande;
      tam = 180;  // más grande en etapa 3
    }

    imageMode(CENTER); // asegura que crezca desde el centro
    image(img, a.x, a.y, tam, tam);
  }
}

function regarArboles() {
  for (let i = 0; i < arboles.length; i++) {
    let a = arboles[i];
    if (!a.vivo) continue;

    let d = dist(x, y, a.x, a.y);
    if (d < 80) { // si personaje está cerca de arbol puede regar
      if (a.etapa === 1) {
        a.etapa = 2;
        cambiarSaludMonte(+5);
        riegosLocales++;
        enviarAccionAlServidor("riego");
      } else if (a.etapa === 2) {
        a.etapa = 3;
        cambiarSaludMonte(+5);
        riegosLocales++;
        enviarAccionAlServidor("riego");

        // Evitar que el jugador quede atrapado dentro del árbol al crecer (empujarlo fuera de colision)
        let dx = x - a.x;
        let dy = y - a.y;
        let distSegura = 55; // 50px + 5px de margen
        if (abs(dx) > abs(dy)) {
          x = a.x + (dx >= 0 ? distSegura : -distSegura);
        } else {
          y = a.y + (dy >= 0 ? distSegura : -distSegura);
        }

      }
      // solo regar 1 árbol por tecla
      logros.riegos.contador++;
      break;
      
    }
  }
}

// se habilita luego de apagar incendios, si aún no se ganó 
function verificarModoPlantar() {
  if (puedePlantar && nuevosPlantados < maxNuevosArboles) return;

  // si el fuego fue derrotado, habilitar modo plantar
  if (fuegoDerrotado && nuevosPlantados < maxNuevosArboles) {
    console.log("Modo plantar activado.");
    puedePlantar = true;
    console.log("Árboles plantados:", nuevosPlantados);
  }
}

function plantarNuevoArbol() {
  if (!puedePlantar) return;
  if (nuevosPlantados >= maxNuevosArboles) {
    puedePlantar = false;
    return;
  }

  // colocar el arbol en la posición del jugador 
  let nx = x + random(-30, 30);
  let ny = y + random(-30, 30);
  let nuevo = new Arbol(nx, ny);
  nuevo.isInitial = false; 
  arboles.push(nuevo);
  nuevosPlantados++;
  logros.plantar.contador++;
  cambiarSaludMonte(+5);
  
  // contabilizar local y enviar al servidor
  arbolesLocales++;
  enviarAccionAlServidor("plantar");


  console.log("Planteado nuevo árbol. total nuevos:", nuevosPlantados);

  // si llegamos al limite, desactivamr  modo
  if (nuevosPlantados >= maxNuevosArboles) {
    puedePlantar = false;
  }
}

//////////////////////////////////////////          ANIMAL            //////////////////////////////////////////

let animal = null;          // referencia al animal
let animalActivo = false;  // aparece o no en el mapa
let animalAyudado = false; // logro

function crearAnimal() {
  animal = {
    x: 770,
    y: -200, // Empieza arriba afuera de la pantalla y se mueve hacia abajo
    targetX: 770,
    targetY: 210,
    startY: -200,
    startTime: millis(),
    duration: 5000, // Duración de 5 segundos
    curado: false
  };
  animalActivo = true;
  console.log("Animal creado en el mapa.");
}

function dibujarAnimal() {
  if (!animalActivo || !animal) return;

  // Animación de entrada: Traslación + Zig-Zag
  let tiempo = millis() - animal.startTime;
  if (tiempo < animal.duration) {
    let t = tiempo / animal.duration; 
    
    // Movimiento hacia abaj
    animal.y = lerp(animal.startY, animal.targetY, t);
    
    // Movimiento oscilatorio 
    animal.x = animal.targetX + sin(t * TWO_PI * 3) * 40; 
  } else {
    //posición final
    animal.x = animal.targetX;
    animal.y = animal.targetY;
  }

  push();
  imageMode(CENTER);
  if (animal.curado) {
    image(coatiCurado, animal.x, animal.y, 170, 170);
  } else {
    image(coatiLastimado, animal.x, animal.y, 170, 170);
  }
  pop();
}

function intentarAyudarAnimal() {
  if (!animalActivo || !animal || animal.curado) return;

  let d = dist(x, y, animal.x, animal.y);
  if (d < 100) {
    animal.curado = true;
    animalAyudado = true;

    animalesLocales++; // contador de logros
    enviarAccionAlServidor("animal", 1);

    console.log("Animal ayudado");
  }
}

// Función auxiliar para verificar colisiones con el entorno
function posicionValida(x, y, ignorar = null) {
  let radio = 35; 
  
  // Verificar colisión con TODOS los objetos (estáticos + dinámicos)
  for (let o of objetos) {
    // Si el objeto es la misma entidad que pregunta (ej. topadora a sí misma), ignorar
    if (ignorar && o.ref === ignorar) continue;

    if (x > o.x - radio && x < o.x + o.w + radio &&
        y > o.y - radio && y < o.y + o.h + radio) {
      return false; // Hay colisión
    }
  }
  return true; // Libre
}
