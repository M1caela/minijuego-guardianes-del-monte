<?php
require "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id_partida"];
$tareas = json_encode($data["tareas"]);

$stmt = $cn->prepare(
  "UPDATE partidas SET tareas_completadas = ? WHERE id = ?"
);
$stmt->bind_param("si", $tareas, $id);
$stmt->execute();

echo json_encode(["ok" => true]);
