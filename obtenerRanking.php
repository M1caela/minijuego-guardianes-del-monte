<?php
header("Content-Type: application/json");
include "conexion.php";

// Consulta SQL: obtener los 5 mejores puntajes
$sql = "SELECT id, nombre, puntaje_final FROM partidas WHERE puntaje_final > 0 ORDER BY puntaje_final DESC LIMIT 5";
$result = $cn->query($sql);

$datos = [];

if ($result) {
    // Recorrer los resultados y guardarlos en un array
    while ($fila = $result->fetch_assoc()) {
        $datos[] = $fila;
    }
}

// Convertir el array a formato JSON y enviarlo
echo json_encode($datos);
?>