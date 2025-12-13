<?php
//variables de conexion a la base de datos

// --- CONFIGURACIÓN DE CONEXIÓN ---
$host = "localhost";
$user = "root";
$pass = "";
$db   = "minijuego"; 

$cn = new mysqli($host, $user, $pass, $db);

if ($cn->connect_error) {
    http_response_code(500);
    echo "Error de conexión: " . $cn->connect_error;
    exit;
}

