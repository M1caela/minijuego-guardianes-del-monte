<?php
header("Content-Type: application/json");
include "conexion.php";

// Obtener orden (DESC por defecto)
$orden = isset($_GET['orden']) && $_GET['orden'] === 'ASC' ? 'ASC' : 'DESC';

// Consulta SQL: obtener los 5 mejores puntajes
$sql = "SELECT id, nombre, puntaje_final, tiempo_partida FROM partidas WHERE puntaje_final > 0 ORDER BY puntaje_final $orden LIMIT 5";
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