<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
include "conexion.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["nombre"])) {
    echo json_encode(["ok" => false, "error" => "No se envió nombre"]);
    exit;
}

$nombre = $input["nombre"];

$sql = $cn->prepare("INSERT INTO partidas (nombre) VALUES (?)");
$sql->bind_param("s", $nombre);
$sql->execute();

echo json_encode(["ok" => true, "nombre" => $nombre]);