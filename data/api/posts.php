<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$db = new SQLite3("../data/database.sqlite");

// Handle incoming requests
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        $result = $db->query("SELECT * FROM posts");
        $posts = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $posts[] = $row;
        }
        echo json_encode($posts);
        break;

    case 'POST':
        $stmt = $db->prepare("INSERT INTO posts (title, content) VALUES (:title, :content)");
        $stmt->bindValue(':title', $input['title'], SQLITE3_TEXT);
        $stmt->bindValue(':content', $input['content'], SQLITE3_TEXT);
        $stmt->execute();
        echo json_encode(["message" => "Post created"]);
        break;

    case 'PUT':
        $stmt = $db->prepare("UPDATE posts SET title = :title, content = :content WHERE id = :id");
        $stmt->bindValue(':title', $input['title'], SQLITE3_TEXT);
        $stmt->bindValue(':content', $input['content'], SQLITE3_TEXT);
        $stmt->bindValue(':id', $input['id'], SQLITE3_INTEGER);
        $stmt->execute();
        echo json_encode(["message" => "Post updated"]);
        break;

    case 'DELETE':
        $stmt = $db->prepare("DELETE FROM posts WHERE id = :id");
        $stmt->bindValue(':id', $input['id'], SQLITE3_INTEGER);
        $stmt->execute();
        echo json_encode(["message" => "Post deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
