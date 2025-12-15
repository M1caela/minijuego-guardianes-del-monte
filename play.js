///   Micaela Calvo - TP N°5 - Info Aplicada I 2025 - UNA   ///


///////////////////////////   VARIABLES  ///////////////////////////

let gameState = "inicio"; // inicio, elegir, juego, ganar/perder, info, creditos
let miCanvas;

// imagen
let fondoInicio;
let fondoGanar;
let fondoPerder;
let topadoraImg; 
let imgBrote, imgArbolMedio, imgArbolGrande, imgEstrellita
let estrellaLogros;
let coatiLastimado, coatiCurado;
let fuegoImg;

// fondo / mapa
let fondoGrande;
let mapaAncho = 1300;
let mapaAlto = 900;

// objetos 
let arboles = [];
let objetos = []
let objetosEstaticos = []; // Lista fija de edificios

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
let maxNuevosArboles = 10;  // límite de nuevos árboles que se puede plantar
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
let botonRanking;
let botonOrdenar;
let botonComenzar;
let ordenRanking = 'DESC'; // Por defecto mayor a menor
let avatarElegido = false;

// partidas
let idPartida = null;
let ranking = []; // guardar los datos JSON

// temporizador/contador de partida
let inicioPartida = 0;
let tiempoMaximo = 5 * 60 * 1000; // 5 minutos en ms
let tiempoRestante = tiempoMaximo;

// sistema de particulas HUD de vida 
let particulasHUD = [];

// estado UI tabla logros
let tablaLogrosExpandida = true;
let tablaLogrosAltoActual = 170;

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

  // animal
  coatiLastimado = loadImage("img/coati-lastimado.png");
  coatiCurado = loadImage("img/coati-curado.png");
  
  // fondos
  fondoInicio = loadImage("img/fondo-inicio.jpg")
  fondoGanar = loadImage("img/fondo-ganar.jpg");
  fondoPerder = loadImage("img/fondo-perder.jpg");

  // logro completado
  estrellaLogros = loadImage("img/logro-completado.png");
  imgEstrellita = loadImage("img/estrellita.png");

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
  objetosEstaticos = [
    { x: 40, y: 0, w: 460, h: 150 }, // Casa grande
    { x: 1040, y: 300, w: 200, h: 115 }, // Casita
    { x: 1010, y: 550, w: 110, h: 130 }, // Arbol 1 der
    { x: 395, y: 510, w: 100, h: 110 }, // Arbol 2 izq
  ]; 
  
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

  // BOTÓN RANKING
  botonRanking = createButton("Ver Ranking");
  botonRanking.style("position", "absolute");
  botonRanking.class("btn-siguiente"); 
  botonRanking.hide();
  botonRanking.mousePressed(() => {
    cargarRanking();
    gameState = "ranking";
  });

  // BOTÓN ORDENAR (Ranking)
  botonOrdenar = createButton("Ordenar: Mayor Puntaje");
  botonOrdenar.style("position", "absolute");
  botonOrdenar.class("btn-siguiente"); 
  botonOrdenar.style("font-size", "14px"); // Un poco más chico
  botonOrdenar.hide();
  botonOrdenar.mousePressed(toggleOrdenRanking);

  // BOTÓN COMENZAR (Inicio)
  botonComenzar = createButton("¡COMENZAR!");
  botonComenzar.class("btn-siguiente"); // Usamos la misma clase para mantener estilo
  botonComenzar.style("position", "absolute");
  botonComenzar.style("font-size", "24px"); // Un poco más grande
  botonComenzar.hide();
  botonComenzar.mousePressed(() => {
    gameState = "elegirJugador";
  });
}


///////////////////////////   DRAW  ///////////////////////////
function draw() {
  background('rgb(40,71,16)');

  // logica de estados //
  if (gameState === "inicio") {
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
    checkGameStateSounds();
    pantallaPerderTiempo();
  }
   else if (gameState === "informacion") {
    pantallaInformacion();
  } 
  else if (gameState === "creditos") {
    pantallaCreditos();
  }
  else if (gameState === "ranking") {
    pantallaRanking();
  }
  
  gestionarAnimacionLogro();
  dibujarParticulasHUD(); // Dibujar efectos sobre todo lo demás
 
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

     if (key === 'a' || key === 'A') {
      intentarAyudarAnimal();
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
      resetGame(); //  reinicia todo 
      gameState = "inicio";
      return;
    }
  }

  if (gameState === "ranking") {
    if (key === 'i' || key === 'I') {
      gameState = "inicio";
      return;
    }
  }
}

//  MOUSE //

function mousePressed() {
  if (gameState !== "juego") return;

  // Detectar clic en el HEADER de la tabla de logros (para abrir/cerrar)
  let tablaW = 240;
  let tablaX = width - tablaW - 20;
  let tablaY = 20;
  let headerH = 34;

  if (mouseX > tablaX && mouseX < tablaX + tablaW && mouseY > tablaY && mouseY < tablaY + headerH) {
    tablaLogrosExpandida = !tablaLogrosExpandida;
    return; // Evitamos que dispare al hacer clic en la UI
  }

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
  x = 800; y = 300; dir = "default";
  camXGlobal = 0; camYGlobal = 0;

  // Restaurar configuración de dibujo por defecto
  textAlign(CENTER, CENTER);
  imageMode(CORNER);
  rectMode(CORNER);
  noTint();

  // reinicializaciones que tienen lógica propia
  if (typeof initMonte === 'function') initMonte();  // reinicia monte/variedades
  if (typeof initTopadoras === 'function') initTopadoras();  // crea topadoras iniciales 
  if (typeof initArbolesEjemplo === 'function') initArbolesEjemplo(); // crea árboles por defecto
  if (typeof initFuegos === 'function') {
  }

  // indicadores
  fuegoActivo = false;
  puedePlantar = false;
  tablaLogrosExpandida = true; // Resetear tabla abierta
  tablaLogrosAltoActual = 170;

  // reiniciar contadores de logros
  riegosLocales = 0;
  fuegosLocales = 0;
  arbolesLocales = 0;
  animalesLocales = 0;
  topadorasLocales = 0;

  console.log("Juego reiniciado -> estado:", gameState);
}

// PANTALLA ELEGIR // 

function mostrarInput() {
  inputNombre.show();
  botonSiguiente.show();
  if (botonComenzar) botonComenzar.hide();
}

function ocultarInput() {
  inputNombre.hide();
  botonSiguiente.hide();
  if (botonRanking) botonRanking.hide();
  if (botonOrdenar) botonOrdenar.hide();
  if (botonComenzar) botonComenzar.hide();
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
    partidaId = data.id_partida;
    console.log("Partida creada:", partidaId);
  });
}

// LEER JSON DESDE PHP //
function cargarRanking() { 
  // llamar para q la variable ranking se llene con la lista de jugadores traida desde la bdd
  loadJSON('obtenerRanking.php?orden=' + ordenRanking, (data) => {
    ranking = data; // Guarda los datos en la variable global
    console.log("Ranking cargado:", ranking);
    // Ejemplo para crear objetos visuales basados en estos datos: for (let r of ranking) { ... crearObjeto(r.nombre, r.puntaje_final) ... } 
  });
}

function botonVerRanking() {
  if (botonRanking) {
    botonRanking.show();
    botonRanking.position(width / 2 - 60, height / 2 + 210);
  }
}

function mostrarBotonOrdenar() {
  if (botonOrdenar) {
    botonOrdenar.show();
    botonOrdenar.position(width / 2 - 100, height / 2 + 160);
  }
}

function toggleOrdenRanking() {
  if (ordenRanking === 'DESC') {
    ordenRanking = 'ASC';
    botonOrdenar.html("Ordenar: Menor Puntaje");
  } else {
    ordenRanking = 'DESC';
    botonOrdenar.html("Ordenar: Mayor Puntaje");
  }
  cargarRanking();
}

// TEMPORIZADOR DEL JUEGO //
function actualizarTemporizador() {
  let ahora = millis();
  tiempoRestante = tiempoMaximo - (ahora - inicioPartida);
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
  // dimensiones y posición
  let tablaW = 240;
  // let tablaH = 170;
  let alturaMaxima = 170;
  let headerH = 34;
 //let margen = 2;

  let tablaX = width - tablaW - 20;
  let tablaY = 20;

  //  LÓGICA DE ANIMACIÓN abrir/cerrar
  let targetH = tablaLogrosExpandida ? alturaMaxima : headerH;
  // Interpolación lineal (lerp) para suavizar el cambio de altura (0.15 es la velocidad)
  tablaLogrosAltoActual = lerp(tablaLogrosAltoActual, targetH, 0.15);
  
  let tablaH = tablaLogrosAltoActual; 

  let colorHeader = color(70); // franja superior
  let colorCuerpo = color(40, 40, 40, 170); // Cuerpo semi-transparente

  // header
  noStroke();
  fill(colorHeader);
  rect(tablaX, tablaY, tablaW, headerH, 10, 10, 0, 0);

  // Solo dibujamos el cuerpo si hay altura suficiente
  if (tablaH > headerH + 1) {
    fill(colorCuerpo);
    rect(
      tablaX,
      tablaY + headerH,
      tablaW,
      tablaH - headerH,
      0, 0, 10, 10 // Redondeado solo abajo
    );
  }

  // título
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Logros", tablaX + 12, tablaY + headerH / 2);

  // ===== ESTRELLA DECORATIVA =====
  if (imgEstrellita) {
    image(
      imgEstrellita,
      tablaX + tablaW - 45, // Ajustado a la derecha (esquina superior)
      tablaY - 3,           // Centrado verticalmente en el header
      40,
      40
    );
  }

  // ===== LISTA DE LOGROS =====
  // Solo mostrar texto si la tabla está casi totalmente desplegada
  if (tablaH > alturaMaxima - 40) {
    fill(255);
    textSize(13);
    textAlign(LEFT, TOP);

    let y = tablaY + headerH + 10;
    let x = tablaX + 12;
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
  }

  pop();
}

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
    inicioAnimacionLogro = millis();
    logroActual = "animal";
  }

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

function todosLosLogrosCompletados() {
  return Object.values(logrosCompletados).every(l => l === true);
}

// ANIMACION AL CONSEGUIR LOGRO //
function dispararAnimacionLogro(tipo) {
  logroActual = tipo;
  mostrarAnimacionLogro = true;
  inicioAnimacionLogro = millis();
}

function gestionarAnimacionLogro() {
  if (!mostrarAnimacionLogro) return;

  // Calcular tiempo 
  let tiempoPasado = millis() - inicioAnimacionLogro;
  let duracionFadeIn = 1500; // 1.5 segundos
  let duracionHold = 3000;   
  let duracionFadeOut = 1500;
  let duracionTotal = duracionFadeIn + duracionHold + duracionFadeOut;

  // Si pasó menos de x segundos dibujar
  if (tiempoPasado < duracionTotal) {
    let alpha = 0;
    let tam = 420; // Tamaño base 
    
    if (tiempoPasado < duracionFadeIn) {
      // Fade In (aparece)
      alpha = map(tiempoPasado, 0, duracionFadeIn, 0, 255);
    } else if (tiempoPasado < duracionFadeIn + duracionHold) {
      // Mantener visible con "latido"
      alpha = 255;
      let pulso = sin(frameCount * 0.1) * 10; // Oscila +/- 10px
      tam = 400 + pulso;
    } else {
      // Fade Out (desvanece)
      alpha = map(tiempoPasado, duracionFadeIn + duracionHold, duracionTotal, 255, 0);
    }

    push();
    imageMode(CENTER);
    tint(255, alpha); // Aplicar transparencia
    image(estrellaLogros, width/2, height/2+100, tam, tam);
    noTint();
    pop();
  } 
  else {
    // Si pasó el tiempo apagr la animación
    mostrarAnimacionLogro = false;
    logroActual = null;
  }
}

// SISTEMA DE PARTÍCULAS HUD (Pixel Art) //

class ParticulaHUD {
  constructor(x, y, r, g, b, speed) {
    this.x = x;
    this.y = y;
    this.vx = random(-speed, speed);
    this.vy = random(-speed, speed);
    this.alpha = 255;
    this.color = color(r, g, b);
    this.size = 12; // 12x12 px pixel art
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // Desvanecer
  }

  draw() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    rect(this.x, this.y, this.size, this.size); // Cuadrado pixel art
  }
}

// Función llamada al recibir el JSON desde PHP
function spawnParticulasHUD(data) {
  // Parsear datos del JSON
  let r = data.r;
  let g = data.g;
  let b = data.b;
  let cantidad = data.cantidad;
  let velocidad = data.velocidad;

  // Crear objetos
  for (let i = 0; i < cantidad; i++) {
    // Spawnear cerca de la barra de vida (aprox 140, 30)
    particulasHUD.push(new ParticulaHUD(140, 30, r, g, b, velocidad));
  }
}

function dibujarParticulasHUD() {
  for (let i = particulasHUD.length - 1; i >= 0; i--) {
    let p = particulasHUD[i];
    p.update();
    p.draw();
    if (p.alpha <= 0) {
      particulasHUD.splice(i, 1);
    }
  }
}

// RECARGA DE MUNICIÓN //
function actualizarRecarga() {
  if (recargando) {
    if (millis() - tiempoInicioRecarga >= tiempoRecarga) {
      // Recarga completa
      municionActual = maxMunicion;
      recargando = false;
    }
  }
}

// FINALIZAR PARTIDA - enviar datos al servidor //

function finalizarPartida() {
  if (!partidaId) return;

  fetch("finalizarPartida.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partida_id: partidaId,
      puntaje_final: monteHealth,
      tiempo_partida: floor((millis() - inicioPartida) / 1000), // tiempo en segundos
      topadoras_eliminadas: topadorasLocales,
      incendios_apagados: fuegosLocales,
      riegos: riegosLocales,
      arboles_plantados: arbolesLocales,
      animales_ayudados: animalesLocales
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
    if (gameState === "ganar" || gameState === "perder" || gameState === "perderTiempo") {
      finalizarPartida(); // Guardar datos al terminar
      mostrarAnimacionLogro = false; // Detener animación de logro
      particulasHUD = []; // Limpiar partículas visuales
    }

    if (gameState === "ganar") {
      if (cancionGanar) {
        if (cancionAmbiente && cancionAmbiente.isPlaying()) cancionAmbiente.pause();
        cancionGanar.play();
      }
    } else if (gameState === "perder" || gameState === "perderTiempo") {
      if (cancionPerder) {
        if (cancionAmbiente && cancionAmbiente.isPlaying()) cancionAmbiente.pause();
        cancionPerder.play();
      }
    }
    prevGameState = gameState;
  }
}

///////////////////////////   COLISIONES DINÁMICAS   ///////////////////////////

function actualizarObjetosColision() {
  // Reiniciar objetos con los estáticos
  objetos = [...objetosEstaticos];

  // 1. Árboles grandes (Etapa 3)
  for (let a of arboles) {
    if (a.vivo && a.etapa === 3) {
      // Verificar si hay una topadora cerca (para desactivar colisión y dejar que lo tale)
      let topadoraCerca = false;
      for (let t of topadoras) {
        if (t.active && !t.dead && dist(t.x, t.y, a.x, a.y) < 100) {
          topadoraCerca = true;
          break;
        }
      }

      // Si NO hay topadora cerca, el árbol es sólido para el jugador
      if (!topadoraCerca) {
        objetos.push({ x: a.x - 15, y: a.y - 15, w: 30, h: 30, tipo: 'arbol' });
      }
    }
  }

  // 2. Topadoras activas
  for (let t of topadoras) {
    if (t.active && !t.dead) {
      // Caja de colisión para la topadora (aprox 80x60)
      // Agregamos referencia 'ref' para que la topadora no choque consigo misma
      objetos.push({ x: t.x - 40, y: t.y - 30, w: 80, h: 60, tipo: 'topadora', ref: t });
    }
  }

  // 3. Animal (si está en el mapa)
  if (animalActivo && animal) {
    // Caja de colisión para el animal (aprox 80x80)
    objetos.push({ x: animal.x - 40, y: animal.y - 40, w: 80, h: 80, tipo: 'animal' });
  }
}

///////////////////////////      x             ///////////////////////////