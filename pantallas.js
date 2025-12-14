
// PANTALLAS //

function pantallaInicio() {
  ocultarInput();
  push();
    resetMatrix();  
    imageMode(CORNER);
    if (fondoInicio) image(fondoInicio, 0, 0, width, height);

    fill(255);
    push();
    textSize(48);
    textFont("bungee"); 
    text("Guardianes del Monte", width/2, 180);
    pop();

    push();
      textSize(24);
      text("La naturaleza te necesita.", width/2, 240);
      text("Protegé el bosque y sus animales.", width/2, 270);
    pop();

    push();
      textSize(20);
      text("Presioná ESPACIO para comenzar", width/2, 400);
      text("Presioná C para ver los créditos", width/2, 440);
    pop();
  pop();
}

function pantallaElegir() {
  background('rgb(114,152,94)');
  elegirJugador(); 
  fill('white');
  textSize(25); 
  text("Escribí tu nombre:", 400, 470);
  mostrarInput(); // input de nombre que envia a bdd 

  // si ya se puede continuar, hacer otón visible
  if (avatarElegido && inputNombre.value().trim() !== "") {
    botonSiguiente.position(width-160, height-70);
    botonSiguiente.show();
  } else {
    botonSiguiente.hide();
  }
}

function pantallaJuego() {
  ocultarInput();
  let camX = constrain(x - width / 2, 0, mapaAncho - width);
  let camY = constrain(y - height / 2, 0, mapaAlto - height);
  
  push();
    translate(-camX, -camY); // mueve el "mundo" para que el jugador quede centrado al mover vista
    
    // guardo global para mapear mouse 
    camXGlobal = camX;
    camYGlobal = camY;

    // actualizo las coordenadas del mouse en coordenadas de mundo
    aimWorldX = mouseX + camXGlobal;
    aimWorldY = mouseY + camYGlobal;
    
    // fondo del mapa 
    image(fondoGrande, 0, 0, mapaAncho, mapaAlto);
    
    // Árboles
    dibujarArboles();
    arboles = arboles.filter(a => !a.desaparecio());

    // jugador
    moverJugador();
    dibujarJugador();
    
    // actualizar y dibujar topadoras
    for (let i = topadoras.length - 1; i >= 0; i--) {
      let t = topadoras[i];
      t.update();
      t.draw();
      if (!t.active && t.dead) {
        topadoras.splice(i, 1);
      }
    }
    
    // fuego y proyectiles
    actualizarFuegos();       
    actualizarProyectiles();
    actualizarAgua();      
    
    dibujarFuegos();       
    dibujarProyectiles(); 
    verificarModoPlantar();

    // animal una vez que no hay fuego
    dibujarAnimal();

    // punteria del tiro
    if (isAiming) {
        stroke(255, 200, 40);
        strokeWeight(2);
        line(x, y, aimWorldX, aimWorldY);
        noStroke();
        fill(255, 200, 40);
        ellipse(aimWorldX, aimWorldY, 8);
    }
    
    // espacio que ocupan los objetos del mapa (arbol, casita..) 
    for (let o of objetos) {
      noFill();
      rect(o.x, o.y, o.w, o.h); 
    } 

  pop();
  
  // instrucciones (cambia segun modo)
  push();
    textAlign(CENTER, CENTER);
    textSize(18);
    noStroke();
    fill(255);
    let instruccion = getInstruccion();
    if (instruccion !== "") {
      text(instruccion, width/2, 550);
    }
  pop();

  // barra de vida y tiros restantes
  dibujarBarraMonte(); 
  dibujarMunicionHUD();
  actualizarRecarga();

  // tablero de logros y tareas
  dibujarTablaLogros();
  actualizarLogros();

  chequearEstadoMonte();

  // contador de tiempo
  actualizarTemporizador();
  dibujarTemporizador();
 
}

function pantallaGanar() {
  ocultarInput();
  push();
    // Dibujar fondo ajustado exactamente al canvas
    imageMode(CORNER);
    if (fondoGanar) image(fondoGanar, 0, 0, width, height);

    // Texto centrado en pantalla
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40);
    text("¡El monte respira otra vez!", width / 2, height / 2 - 50);

    botonVerRanking(); // mostrar botón ranking
    textSize(24);
    text("Presioná ESPACIO", width / 2, height / 2 + 60);
  pop();
}

function pantallaPerder() {
  ocultarInput();
  push();
    imageMode(CORNER);
   if (fondoPerder) image(fondoPerder, 0, 0, width, height);

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40);
    text("El monte fue destruido.", width / 2, height / 2 - 50);

    botonVerRanking(); // mostrar botón ranking
    textSize(24);
    text("Presioná ESPACIO", width / 2, height / 2 + 60);
  pop();
}

function pantallaPerderTiempo() {
  ocultarInput();
  push();
    imageMode(CORNER);
    if (fondoPerder) image(fondoPerder, 0, 0, width, height);

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40);
    text("Se acabó el tiempo\ny el monte no fue restaurado.", width / 2, height / 2 - 50);
    textSize(30);
    text("¡Seguí intentando!", width / 2, height / 2 - 30);

    botonVerRanking(); // mostrar botón ranking
    textSize(24);
    text("Presioná ESPACIO", width / 2, height / 2 + 60);
  pop();
}

function pantallaCreditos() {
  ocultarInput();
  push();
  background(20, 40, 20);
  fill('white'); 
   textAlign(CENTER, CENTER);
    push();
      fill(200);
      textSize(34);
      textFont("bungee"); 
      text("Créditos", width/2, 120);
    pop();
  
    textSize(20);
    text("Minijuego desarrollado por Micaela Calvo.", width/2, 200);
    text("TP N°5 - Info. aplicada I - Cat. Bedoian - UNA", width/2, 240);
    text("Hecho en p5.js - 2025", width/2, 280);
  
    push();
      textSize(22);
      text("Presioná I para volver al inicio.", width/2, 400);
    pop();
  pop();
}

function pantallaInformacion() {
  ocultarInput();
  push();
    background(20, 40, 20);
    fill('white'); 
    anchoMaxTxt = 660;
    let w = (100);
    textSize(15); textWrap(WORD); textAlign(LEFT);
    text("El cuidado ambiental no es solo una responsabilidad colectiva: es una necesidad urgente. \n En Argentina, la deforestación industrial avanza a un ritmo alarmante, amenazando la biodiversidad y los ecosistemas que sostienen la vida. ", w, 70, anchoMaxTxt);
  
    text("Según datos del Min de Ambiente y Desarrollo, entre 1998 y 2023 el país perdió +8M de hectáreas de bosques nativos, principalmente en  provincias del norte. Las causas principales son la expansión agroganadera y la tala ilegal, en muchos casos para sembrar soja o criar ganado. \n A esto se suman los incendios forestales, cada vez más frecuentes. En 2023, el Servicio Nacional de Manejo del Fuego (SNMF) registró +1,3M de hectáreas afectadas por incendios en todo el país, impulsados por el cambio climático, las sequías prolongadas y las quemas intencionales.", w, 210, anchoMaxTxt);
   
  text("La deforestación y los incendios no solo destruyen árboles: afectan el equilibrio del suelo, alteran los ciclos del agua y aumentan la temperatura global. Cada árbol que cae implica menos oxígeno, menos sombra, menos vida.", w, 360, anchoMaxTxt);
    
  text("Proteger el monte es proteger el futuro. Reforestar, reducir el consumo de productos que provienen de la tala indiscriminada y exigir políticas ambientales efectivas son pasos fundamentales.", w, 440, anchoMaxTxt);
  pop();
  
  push();
    textAlign(CENTER);
    textSize(17); fill('white'); 
    text("Presioná C para ver los créditos y volver al inicio", width / 2, 530);
  pop();
  
}

function pantallaRanking() {
  ocultarInput();
  push();
  background(20, 40, 20);
  fill('white'); 
   textAlign(CENTER, CENTER);
    push();
      fill(200);
      textSize(34);
      textFont("bungee"); 
      text("Ranking de Guardianes", width / 2, 80);
    pop();
  
    textSize(20);
    text("Mejores Puntajes", width / 2, 130);
  
    // Encabezados de tabla
    textSize(18);
    fill(150, 200, 150);
    text("Pos", width / 2 - 150, 180);
    text("Nombre", width / 2, 180);
    text("Puntaje", width / 2 + 150, 180);

    // Línea separadora
    stroke(150, 200, 150);
    line(width / 2 - 200, 200, width / 2 + 200, 200);
    noStroke();

    // Mostrar los datos del ranking
    let startY = 230;
    let lineHeight = 40;
    fill(255);

    if (!ranking || ranking.length === 0) {
      text("Cargando...", width / 2, startY);
    } else {
    for (let i = 0; i < ranking.length; i++) {
      let r = ranking[i];
      let y = startY + i * lineHeight;
      
      text(i + 1, width / 2 - 150, y);
      text(r.nombre, width / 2, y);
      text(r.puntaje_final, width / 2 + 150, y);
    }
    }
    
    push();
      textSize(18);
      fill(200);
      textAlign(CENTER, CENTER);
      text("Presioná I para volver al inicio.", width/2, height - 50);
    pop();
  pop();
}
