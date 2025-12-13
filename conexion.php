<?php
//variables de conexion a la base de datos

// --- CONFIGURACIÓN DE CONEXIÓN ---
$host = "localhost";
$user = "root";
$pass = "";
$db   = "minijuego"; 

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo "Error de conexión: " . $mysqli->connect_error;
    exit;
}

