///   Micaela Calvo - TP N°5 - Info Aplicada I 2025 - UNA   ///


///////////////////////////   VARIABLES  ///////////////////////////

let gameState = "inicio"; // inicio, elegir, juego, ganar/perder, info, creditos
let miCanvas;

// imagen
let fondoInicio;
let fondoGanar;
let fondoPerder;
let topadoraImg; 
let imgBrote, imgArbolMedio, imgArbolGrande; 
let estrellaGif;
let fuegoImg;

// fondo / mapa
let fondoGrande;
let mapaAncho = 1300;
let mapaAlto = 900;

// objetos 
let arboles = [];
let objetos = []

// personajes
let avatar = 0; 
let personaje;
let p1 = {};
let p2 = {};

let dir = "default"; // dirección del jugador
let x = 800, y = 300; // posición del jugador dentro del mapa
let speed = 4;

//  fuego 
let fuegos = [];
let fuegoActivo = false; // se activa luego de derrotar las topadoras
let fuegoDerrotado = false;
let aguaProyectiles = [];

// funcion plantar nuevo arbol (luego de apagar incendio)
let puedePlantar = false;
let maxNuevosArboles = 5;  // límite de nuevos árboles que se puede plantar
let nuevosPlantados = 0;   // contador de nuevos plantados 
let initialArbolesCount = 0; //  árboles iniciales

// sonido
let cancionGanar, cancionPerder, cancionAmbiente;
let toggleSonido;  
let sonidoActivo = false; // estado actual
let prevGameState = "";  // para detectar transiciones de estado

// guardar nombre
let inputNombre;
let nombreUsuario = "";
let botonSiguiente;
let avatarElegido = false;

// partidas
let idPartida = null;

// temporizador de partida
let inicioPartida = 0;
let tiempoMaximo = 10 * 60 * 1000; // 10 minutos en ms
let tiempoRestante = tiempoMaximo;




///////////////////////////   IMAGENES Y SONIDO  ///////////////////////////
function preload() {
  fondoGrande = loadImage("img/mapa.jpg");
  
  // jugador 1
  p1.default = loadImage("player1/default.png");
  p1.left = loadImage("player1/izquierda.png");
  p1.right = loadImage("player1/derecha.png");
  p1.back = loadImage("player1/espalda.png");
  
  // juagdor 2
  p2.default = loadImage("player2/default.png");
  p2.left = loadImage("player2/izquierda.png");
  p2.right = loadImage("player2/derecha.png");
  p2.back = loadImage("player2/espalda.png");
  
  // árboles
  imgBrote = loadImage("img/brote.png");
  imgArbolMedio = loadImage("img/arbol-medio.png");
  imgArbolGrande = loadImage("img/arbol-grande.png");
  
  // topadora
  topadoraImg = loadImage("img/topadora.png");
  fuegoImg = loadImage("img/fuego.png");
  
  // fondos
  fondoInicio = loadImage("img/fondo-inicio.jpg")
  fondoGanar = loadImage("img/fondo-ganar.jpg");
  fondoPerder = loadImage("img/fondo-perder.jpg");

  // gif animacion logro
  estrellaGif = loadImage("img/logro-completado.gif");

  /// SONIDOS ///
  cancionAmbiente = loadSound("sonido/ambiente.mp3");
  cancionGanar = loadSound("sonido/ganar.mp3");
  cancionPerder = loadSound("sonido/perder.mp3");
}


///////////////////////////   SETUP  ///////////////////////////
function setup() {
  miCanvas = createCanvas(800, 600); // tu canvas

  textFont("roboto mono"); 
  textAlign(CENTER, CENTER);
  
  // objeos que ocupan lugar en el mapa 
  objetos = [
    { x: 40, y: 0, w: 460, h: 150 }, // Casa grande
    { x: 1040, y: 300, w: 200, h: 115 }, // Casita
    { x: 1010, y: 550, w: 110, h: 130 }, // Arbol 1 der
    { x: 395, y: 510, w: 100, h: 110 }, // Arbol 2 izq
  ]; 
  
  // initArboles();
  controlarMusica();
  
  // INPUT de nombre (pantalla elegir)
  inputNombre = createInput();
  inputNombre.position(340, 515);
  inputNombre.attribute("placeholder", "Nombre");
  inputNombre.size(150);
  inputNombre.parent(document.body);
  inputNombre.hide(); 
  inputNombre.input(verificarCamposCompletos);
  
  // BOTÓN (pantalla elegir)
  botonSiguiente = createButton("Siguiente");
  botonSiguiente.style("position", "absolute");
  botonSiguiente.class("btn-siguiente"); 
  botonSiguiente.hide();
  botonSiguiente.mousePressed(irAJuego);

  //  debug
  console.log("Datos del GIF:", estrellaGif);
  console.log("Ancho:", estrellaGif.width);
  console.log("Alto:", estrellaGif.height);

}


///////////////////////////   DRAW  ///////////////////////////
function draw() {
  background('rgb(40,71,16)');

  // logica de estados //
  if (gameState === "inicio") {
    //pantallaJuego(); // solo para producir tabla de logros, dsp descomentar el de abajo
     pantallaInicio();
  } 
  else if (gameState === "elegirJugador") {
    pantallaElegir();
  } 
  else if (gameState === "juego") {
    pantallaJuego();
  } 
  else if (gameState === "ganar") {
    checkGameStateSounds();
    pantallaGanar();
  } 
  else if (gameState === "perder") {
    checkGameStateSounds();
    pantallaPerder();
  }
   else if (gameState === "perderTiempo") {
    pantallaPerderTiempo();
  }
   else if (gameState === "informacion") {
    pantallaInformacion();
  } 
  else if (gameState === "creditos") {
    pantallaCreditos();
  }
  
  gestionarAnimacionLogro();
 
}



/////////////////////////   FUNCIONES DE USUARIO   ///////////////////////////

// keyPressed centralizado por estados //

function keyPressed() {
  // desde inicio ir a elegir con ESPACIO
  if (gameState === "inicio") {
    if (keyCode === 32) { // SPACE
      gameState = "elegirJugador";
      return;
    } else if (key === 'c' || key === 'C') {
      gameState = "creditos";
      return;
    }
  }

  // en pantalla de elección: 1 o 2 elige avatar 
  if (gameState === "elegirJugador") {
    if (key === '1') {
      avatar = 1;
      avatarElegido = true;
      verificarCamposCompletos();
    }
    if (key === '2') {
      avatar = 2;
      avatarElegido = true;
      verificarCamposCompletos();
    }
  }
  
  // riego de arboles
  if (gameState === "juego") {
    if (key === 'r' || key === 'R') {
      regarArboles();
    }
   
    // plantar nuevo árbol 
    if (key === 'p' || key === 'P') {
      plantarNuevoArbol();
    }
 }
  
  // ir a info desde ganar/perder
  if (gameState === "ganar" || gameState === "perder") {
    if (keyCode === 32) { // SPACE
      gameState = "informacion";
      return;
    } 
  }
  
  // ir a creditos desde info
  if (gameState === "informacion") {
    if (key === 'c' || key === 'C') {
      gameState = "creditos";
      return;
    } 
  }

  // desde créditos volver a inicio
  if (gameState === "creditos") {
    if (key === 'i' || key === 'I') {
      gameState = "inicio";
      resetGame(); //  reinicia todo 
      return;
    }
  }
}

//  MOUSE //

function mousePressed() {
  if (gameState !== "juego") return;

  let objetivoX = mouseX + camXGlobal;
  let objetivoY = mouseY + camYGlobal;
  let dx = objetivoX - x;
  let dy = objetivoY - y;
  let mag = sqrt(dx * dx + dy * dy);
  let vx = (dx / mag) * maxThrowSpeed;
  let vy = (dy / mag) * maxThrowSpeed;

   if (recargando) return;

  // Si no hay munición → iniciar recarga
  if (municionActual <= 0) {
    iniciarRecarga();
    return;
  }

  if (fuegoActivo) {
    // Disparo de agua
    aguaProyectiles.push({
      x: x + 50,
      y: y + 20,
      vx: vx,
      vy: vy,
      r: 10,
      life: 1500,
      born: millis()
    });
  }   else {
    // Disparo contra topadoras
    proyectiles.push({
      x: x + 50,
      y: y + 20,
      vx: vx,
      vy: vy,
      r: 5,
      life: 1000,
      born: millis()
    });
  

    // Restar munición
    municionActual--;
    
    // Si se quedó sin balas, activar recarga
    if (municionActual <= 0) {
      iniciarRecarga();
    }
  }
}

function mouseDragged() {
  if (!isAiming) return;
  aimEndWorld.x = mouseX + camXGlobal;
  aimEndWorld.y = mouseY + camYGlobal;
}

function mouseReleased() {
  // tiros - punteria
  if (!isAiming) return;

  // posición final
  aimEndWorld.x = mouseX + camXGlobal;
  aimEndWorld.y = mouseY + camYGlobal;

  // vector de lanzamient
  let dx = aimStartWorld.x - aimEndWorld.x;
  let dy = aimStartWorld.y - aimEndWorld.y;
  let mag = sqrt(dx*dx + dy*dy);

  if (mag < minThrowDistance) {
    isAiming = false;
    return;
  }

  // velocidad  
  let speedFactor = constrain(map(mag, 0, 150, 2, maxThrowSpeed), 2, maxThrowSpeed);
  let vx = (dx / mag) * speedFactor;
  let vy = (dy / mag) * speedFactor;

  // proyectil 
  proyectiles.push({
    x: x + 40,
    y: y,
    vx: vx,
    vy: vy,
    r: 8,
    life: 2000,
    born: millis()
  });

  isAiming = false;
}


///////////////////////////      FUNCIONES DEL JUEGO             ///////////////////////////

// REINICIAR // 
function resetGame() {
  // detener sonidos
  userInteracted = false;
  if (cancionAmbiente && cancionAmbiente.isPlaying()) cancionAmbiente.stop();
  if (cancionGanar && cancionGanar.isPlaying()) cancionGanar.stop();
  if (cancionPerder && cancionPerder.isPlaying()) cancionPerder.stop();

  // estado general
  gameState = "inicio";
  prevGameState = "";
  avatar = 0;

  // limpiar arrays 
  topadoras = [];
  proyectiles = [];
  arboles = [];
  fuegos = [];
  aguaProyectiles = []; 
  objetos = []; 
  soundIconRect = undefined;

  // resetear contadores 
  topadorasDestruidas = 0;
  arbolesDestruidos = 0;
  totalTopadorasSpawned = 0;
  fuegoIniciado = false;
  totalTopadorasMeta = 6; 

  // reestablecer salud del monte 
  if (typeof saludMonte !== 'undefined') saludMonte = 30; 
  if (typeof saludMax !== 'undefined') saludMax = 100;

  // reset modo plantar
  puedePlantar = false;
  nuevosPlantados = 0;
  maxNuevosArboles = 4;

  // reiniciar cámara / jugador a posición inicial
  x = 200; y = 480; dir = "default";
  camXGlobal = 0; camYGlobal = 0;

  // reinicializaciones que tienen lógica propia
  if (typeof initMonte === 'function') initMonte();  // reinicia monte/variedades
  if (typeof initTopadoras === 'function') initTopadoras();  // crea topadoras iniciales 
  if (typeof initArbolesEjemplo === 'function') initArbolesEjemplo(); // crea árboles por defecto
  if (typeof initFuegos === 'function') {
  }

  // indicadores
  fuegoActivo = false;
  puedePlantar = false;
  console.log("Juego reiniciado -> estado:", gameState);
}

// PANTALLA ELEGIR // 

function mostrarInput() {
  inputNombre.show();
  botonSiguiente.show();
  // ubicarInput();
}

function ocultarInput() {
  inputNombre.hide();
  botonSiguiente.hide();
}

function verificarCamposCompletos() {
  // chequear si se eligió personaje y se completó nombre antes de mostrar boton de sig 
  let nombreOk = inputNombre.value().trim() !== "";
  if (avatarElegido && nombreOk) {
    botonSiguiente.show(); 
  } else {
    botonSiguiente.hide();
  }
}

// si se eligió personaje y se presionó siguiente > inicia juego
function irAJuego() {
  // guardar nombre del input
  nombreUsuario = inputNombre.value();

  // inicializar partida y elementos
  crearPartida();
  inicioPartida = millis();   // arranca el timer
  tiempoRestante = tiempoMaximo;

  gameState = "juego";

  initArboles();
  initTopadoras();
  initMonte();
}

function crearPartida() {
  fetch("crearPartida.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: nombreUsuario })
  })
  .then(res => res.json())
  .then(data => {
    partidaId = data.partida_id;
    console.log("Partida creada:", partidaId);
  });
}

// TEMPORIZADOR DEL JUEGO //
function actualizarTemporizador() {
  let ahora = millis();
  tiempoRestante = tiempoMaximo - (ahora - inicioPartida);

  if (tiempoRestante <= 0) {
    tiempoRestante = 0;
    gameState = "perderTiempo";
  }
}

function dibujarTemporizador() {
  let segundos = floor(tiempoRestante / 1000);
  let minutos = floor(segundos / 60);
  segundos = segundos % 60;

  let textoTiempo =
    nf(minutos, 2) + ":" + nf(segundos, 2);

  // ubicar a la derecha de la barra de vida
  let bx = 20, by = 20, bw = 240, bh = 18;
  let tiempoX = bx + bw + 60;
  let tiempoY = by + bh / 2 - 6;

  push();
  fill(255);
  textSize(16);
  textAlign(RIGHT, TOP);
  text(textoTiempo, tiempoX, tiempoY);
  pop();
}


// TABLA DE LOGROS //
function dibujarTablaLogros() {
  push();

  let tablaW = 240;
  let tablaH = 170;
  let tablaX = width - tablaW - 20;
  let tablaY = 20;

  // fondo
  fill(60);
  rect(tablaX, tablaY, tablaW, tablaH, 8);

  // título
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Logros", tablaX + 10, tablaY + 8);

  textSize(13);
  let y = tablaY + 36;

  // 1. Topadoras
  let okTop = topadorasLocales >= REQ.topadoras;
  text(
    (okTop ? "✓ " : "□ ") +
    `Eliminar topadoras (${topadorasLocales}/${REQ.topadoras})`,
    tablaX + 10, y
  );
  y += 22;

  // 2. Incendios
  let okFuego = fuegosLocales >= REQ.fuegos_apagados;
  text(
    (okFuego ? "✓ " : "□ ") +
    `Apagar incendios (${fuegosLocales}/${REQ.fuegos_apagados})`,
    tablaX + 10, y
  );
  y += 22;

  // 3. Riegos
  let okRiego = riegosLocales >= REQ.riegos;
  text(
    (okRiego ? "✓ " : "□ ") +
    `Regar árboles (${riegosLocales}/${REQ.riegos})`,
    tablaX + 10, y
  );
  y += 22;

  // 4. Plantar árboles
  let okPlantar = arbolesLocales >= REQ.arboles_plantados;
  text(
    (okPlantar ? "✓ " : "□ ") +
    `Plantar árboles (${arbolesLocales}/${REQ.arboles_plantados})`,
    tablaX + 10, y
  );
  y += 22;

  // 5. Animal
  let okAnimal = animalesLocales >= REQ.animales_ayudados;
  text(
    (okAnimal ? "✓ " : "□ ") +
    `Ayudar animal (${animalesLocales}/${REQ.animales_ayudados})`,
    tablaX + 10, y
  );

  pop();
}

// conexion con mysql - actualizar logros
function enviarAccionAlServidor(tipo) {
  if (!partidaId) return; // protección
  fetch("actualizarTareas.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partida_id: partidaId,
      accion: tipo
    })
  });
}

// TABLA DE LOGROS //

function actualizarLogros() {

  // TOPADORAS
  if (
    topadorasLocales >= REQ.topadoras &&
    !logrosCompletados.topadoras
  ) {
    logrosCompletados.topadoras = true;

    mostrarAnimacionLogro = true;
    inicioAnimacionLogro = millis();
    logroActual = "topadoras";
  }

  // INCENDIOS
  if (
    fuegosLocales >= REQ.fuegos_apagados &&
    !logrosCompletados.incendios
  ) {
    logrosCompletados.incendios = true;

  mostrarAnimacionLogro = true;
  inicioAnimacionLogro = millis();
  logroActual = "incendios";
  }

  // RIEGOS
  if (
    riegosLocales >= REQ.riegos &&
    !logrosCompletados.riegos
  ) {
    logrosCompletados.riegos = true;

    mostrarAnimacionLogro = true;
    inicioAnimacionLogro = millis();
    logroActual = "riegos";
  }

  // PLANTAR
  if (
    arbolesLocales >= REQ.arboles_plantados &&
    !logrosCompletados.plantar
  ) {
    logrosCompletados.plantar = true;

    mostrarAnimacionLogro = true;
    inicioAnimacionLogro = millis();
    logroActual = "plantar";
  }

  // ANIMAL
  if (
    animalesLocales >= REQ.animales_ayudados &&
    !logrosCompletados.animal
  ) {
    logrosCompletados.animal = true;

    mostrarAnimacionLogro = true;
    iniciAnimacionLogro = millis();
    logroActual = "animal";
  }

}

function todosLosLogrosCompletados() {
  return Object.values(logros).every(l => l.completado);
}

// ANIMACION AL CONSEGUIR LOGRO //

function dispararAnimacionLogro(tipo) {
  logroActual = tipo;
  mostrarAnimacionLogro = true;
  inicioAnimacionLogro = millis();
}

function gestionarAnimacionLogro() {
  if (!mostrarAnimacionLogro) return;

  // Calcular cuánto tiempo pasó
  let tiempoPasado = millis() - inicioAnimacionLogro;

  // Si pasó menos de x segundos dibujar
  if (tiempoPasado < 5000) {
    push();
    imageMode(CENTER);
    noTint();

    image(topadoraImg, 400,300, 350, 350); 
    
    pop();
  } 
  else {
    // Si pasó el tiempo apagr la animación
    mostrarAnimacionLogro = false;
    logroActual = null;
  }
}

// FINALIZAR PARTIDA - enviar datos al servidor //

function finalizarPartida() {
  fetch("finalizarPartida.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partida_id: partidaId,
      puntaje_final: saludMonte,
      tiempo_partida: tiempoTotal
    })
  });
}


///////////////////////////      SONIDO             ///////////////////////////

function controlarMusica() {

  toggleSonido = createCheckbox("🎵", false);
  //toggleSonido.parent(document.body); 
  toggleSonido.style("position", "absolute");
  toggleSonido.style("top", "25px");
  toggleSonido.style("right", "25px");
  toggleSonido.style("accent-color", "white");
  toggleSonido.changed(controlarSonido);
  
  if (cancionAmbiente) cancionAmbiente.setVolume(0.9);
  if (cancionGanar) cancionGanar.setVolume(0.9);
  if (cancionPerder) cancionPerder.setVolume(0.9);
}

// musica de fondo
function controlarSonido() {
  sonidoActivo = toggleSonido.checked();
  if (sonidoActivo) {
      if (!cancionAmbiente.isPlaying()) {
        cancionAmbiente.loop();  // inicia la música de fondo 
      }
    } else {
      if (cancionAmbiente.isPlaying()) {
        cancionAmbiente.pause(); // pausa 
      }
    }
}

//  sonidos ganar - perder
function checkGameStateSounds() {
  if (prevGameState !== gameState) {
    // cambio de estado detectado
    if (gameState === "ganar") {
      if (cancionGanar) {
        if (cancionAmbiente && cancionAmbiente.isPlaying()) cancionAmbiente.pause();
        cancionGanar.play();
      }
    } else if (gameState === "perder") {
      if (cancionPerder) {
        if (cancionAmbiente && cancionAmbiente.isPlaying()) cancionAmbiente.pause();
        cancionPerder.play();
      }
    }
    prevGameState = gameState;
  }
}

///////////////////////////      x             ///////////////////////////