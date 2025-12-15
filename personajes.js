/// personajes /// 

function elegirJugador() {
   fill('white'); noStroke();
    textSize(32);
    text('Elegí tu personaje', 400, 60);
    textSize(20);
    text('Presioná 1 o 2 en el teclado para seleccionar.', 400, 105);
  
  push();
    noFill();
  
  // jugador 1
    if (avatar === 1) {
    strokeWeight(4);
    stroke('purple');
    } else {
      strokeWeight(2);
      stroke('black');
    }
    fill('rgb(53,111,81)');
    rect(190,160,190,250);
    image(p1.default,160,150); 
  
  // jugador 2
    if (avatar === 2) {
    strokeWeight(4);
    stroke('purple'); 
    } else {
      strokeWeight(2);
      stroke('black');
    }
    fill('rgb(53,111,81)');
    rect(410,160,190,250);
    image(p2.default,380,150);
  pop(); 
}

function moverJugador() {
  let nuevoX = x;
  let nuevoY = y;

  // Movimiento tentativo
  if (keyIsDown(LEFT_ARROW)) {
    nuevoX -= speed;
    dir = "left";
  } else if (keyIsDown(RIGHT_ARROW)) {
    nuevoX += speed;
    dir = "right";
  } else if (keyIsDown(UP_ARROW)) {
    nuevoY -= speed;
    dir = "back";
  } else if (keyIsDown(DOWN_ARROW)) {
    nuevoY += speed;
    dir = "default";
  }

  // Verificar colisión con cada obstáculo
  let colision = false;
  let hitW = 40; // Ancho de la caja de colisión del jugador
  let hitH = 40; // Alto de la caja de colisión del jugador

  for (let i = 0; i < objetos.length; i++) {
    let o = objetos[i];
    // Chequeo AABB centrado (nuevoX/Y son el centro del jugador)
    if (nuevoX + hitW/2 > o.x && nuevoX - hitW/2 < o.x + o.w && 
        nuevoY + hitH/2 > o.y && nuevoY - hitH/2 < o.y + o.h) {
      colision = true;
      break;
    }
  }

  // Si no hay colisión, actualiza posición
  if (!colision) {
    x = nuevoX;
    y = nuevoY;
  }

  // Limites del mapa
  x = constrain(x, 0, mapaAncho - 50);
  y = constrain(y, 0, mapaAlto - 50);
}

function dibujarJugador() {
  let set = avatar === 1 ? p1 : p2;
  let setImage;

  if (dir === "left") setImage = set.left;
  else if (dir === "right") setImage = set.right;
  else if (dir === "back") setImage = set.back;
  else setImage = set.default;

  image(setImage, x, y, 100, 100);
}
