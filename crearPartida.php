<?php
header("Content-Type: application/json");
require "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);
$nombre = trim($data["nombre"]);

$stmt = $cn->prepare(
  "INSERT INTO partidas (nombre, fecha) VALUES (?, NOW())"
);
$stmt->bind_param("s", $nombre);
$stmt->execute();

echo json_encode([
  "ok" => true,
  "id_partida" => $stmt->insert_id
]);
