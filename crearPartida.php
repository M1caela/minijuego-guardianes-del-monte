<?php
header("Content-Type: application/json");
include "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["nombre"])) {
  echo json_encode(["error" => "Datos incompletos"]);
  exit;
}

$nombre = $data["nombre"];

$stmt = $cn->prepare(
  "INSERT INTO partidas (nombre, fecha) VALUES (?, NOW())"
);
$stmt->bind_param("s", $nombre);
$stmt->execute();

echo json_encode([
  "ok" => true,
  "id_partida" => $stmt->insert_id
]);
