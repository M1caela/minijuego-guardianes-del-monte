<?php
require "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id_partida"];
$puntaje = $data["puntaje"];
$tiempo = $data["tiempo"];

$stmt = $cn->prepare(
  "UPDATE partidas 
   SET puntaje_final = ?, tiempo_partida = ?
   WHERE id = ?"
);
$stmt->bind_param("iii", $puntaje, $tiempo, $id);
$stmt->execute();

echo json_encode(["ok" => true]);
