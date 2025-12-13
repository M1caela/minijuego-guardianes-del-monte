// logros.js

const LOGROS_DEF = {
  topadoras: "Eliminar todas las topadoras",
  incendios: "Apagar todos los incendios",
  riegos: "Regar árboles",
  plantar: "Plantar árboles",
  animal: "Ayudar al animal"
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



