<?php
header("Content-Type: application/json");
include "conexion.php";

// Recibimos el tipo de efecto (positivo o negativo)
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'neutro';

// Aquí simulamos obtener la configuración desde una tabla de la base de datos
// Ej: $sql = "SELECT r, g, b, cantidad FROM efectos_visuales WHERE tipo = '$tipo'";

$respuesta = [];

if ($tipo == 'positivo') {
    $respuesta = [
        "r" => 70, "g" => 200, "b" => 100, // Verde
        "cantidad" => 12,
        "velocidad" => 3
    ];
} else {
    $respuesta = [
        "r" => 230, "g" => 80, "b" => 60, // Rojo
        "cantidad" => 12,
        "velocidad" => 4
    ];
}

echo json_encode($respuesta);
?>