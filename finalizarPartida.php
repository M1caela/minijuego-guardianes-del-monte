<?php
header("Content-Type: application/json");
include "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['partida_id'])) {
    echo json_encode(["error" => "Falta ID de partida"]);
    exit;
}

$id = $data['partida_id'];
$puntaje = $data['puntaje_final'];
$tiempo = $data['tiempo_partida'];
$topadoras = $data['topadoras_eliminadas'];
$incendios = $data['incendios_apagados'];
$riegos = $data['riegos'];
$arboles = $data['arboles_plantados'];
$animales = $data['animales_ayudados'];

$sql = "UPDATE partidas SET 
        puntaje_final = ?, 
        tiempo_partida = ?, 
        topadoras_eliminadas = ?, 
        incendios_apagados = ?, 
        riegos = ?, 
        arboles_plantados = ?, 
        animales_ayudados = ? 
        WHERE id = ?";

$stmt = $cn->prepare($sql);
$stmt->bind_param("iiiiiiii", $puntaje, $tiempo, $topadoras, $incendios, $riegos, $arboles, $animales, $id);

if ($stmt->execute()) {
    echo json_encode(["ok" => true]);
} else {
    echo json_encode(["error" => "Error al actualizar: " . $stmt->error]);
}
?>